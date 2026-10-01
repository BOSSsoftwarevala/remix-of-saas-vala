// Server-side proxy for Supabase auth endpoints. Lets the browser reach
// /functions/v1/auth-proxy/* when filter lists / corp policies block
// direct calls to /auth/v1/*. Runs with verify_jwt=false, so the function
// authenticates and throttles every caller itself:
//
//   1. Authentication  - a JWT signed by THIS project's auth service is
//      required (anon, authenticated or service_role), verified against the
//      project JWKS. Random tokens, other projects' keys and unsigned tokens
//      are rejected, so this can never be used as an open relay.
//   2. Validation      - strict Zod schemas: email shape/length, password
//      length (bcrypt limit), request body size.
//   3. Rate limiting   - fixed-window counters in Postgres, per client IP and
//      per target account, checked before anything is forwarded to GoTrue.
//
// Deployed as: supabase/functions/auth-proxy
import { z } from 'npm:zod@3.23.8';

const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// The limiter RPC is service_role-only, so counters can't be probed by visitors.
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ANON_KEY;


const ALLOWED_ROLES = new Set(['anon', 'authenticated', 'service_role']);
const MAX_BODY_BYTES = 4096;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
}

// ---------------------------------------------------------------------------
// 1. Authentication - verify a JWT signed by this project (RS256, via JWKS)
// ---------------------------------------------------------------------------

type Jwk = { kid?: string; kty?: string; alg?: string; n?: string; e?: string; use?: string };

let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 60 * 60 * 1000;

async function getJwks(force = false): Promise<Jwk[]> {
  if (!force && jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) return jwksCache.keys;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/keys`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`jwks_unavailable:${res.status}`);
  const data = await res.json().catch(() => ({}));
  const keys: Jwk[] = Array.isArray((data as { keys?: Jwk[] })?.keys) ? (data as { keys: Jwk[] }).keys : [];
  if (!keys.length) throw new Error('jwks_empty');
  jwksCache = { keys, fetchedAt: Date.now() };
  return keys;
}

function b64urlToBytes(input: string): Uint8Array {
  const clean = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = clean.length % 4 === 0 ? '' : '='.repeat(4 - (clean.length % 4));
  const bin = atob(clean + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

type JwtOutcome = { ok: boolean; role?: string; sub?: string; reason?: string };

async function verifyProjectJwt(token: string): Promise<JwtOutcome> {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };

  let header: { alg?: string; kid?: string; typ?: string };
  let payload: { exp?: number; nbf?: number; iss?: string; aud?: string; role?: string; sub?: string };
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  } catch {
    return { ok: false, reason: 'unreadable' };
  }

  // HMAC tokens are never accepted: only this project's RSA keys can sign.
  if (header.alg !== 'RS256') return { ok: false, reason: 'unsupported_alg' };

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) return { ok: false, reason: 'expired' };
  if (typeof payload.nbf === 'number' && payload.nbf > now) return { ok: false, reason: 'not_yet_valid' };

  const verify = async (keys: Jwk[]): Promise<JwtOutcome> => {
    let candidates = keys.filter(
      (k) => (k.kty ?? 'RSA') === 'RSA' && (k.use ?? 'sig') === 'sig' && (k.alg ?? 'RS256') === 'RS256',
    );
    if (header.kid) {
      const exact = candidates.filter((k) => k.kid === header.kid);
      if (exact.length) candidates = exact;
    }
    let last: JwtOutcome = { ok: false, reason: 'no_matching_key' };
    for (const jwk of candidates) {
      try {
        const key = await crypto.subtle.importKey(
          'jwk',
          { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true } as JsonWebKey,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['verify'],
        );
        const sigOk = await crypto.subtle.verify(
          'RSASSA-PKCS1-v1_5',
          key,
          b64urlToBytes(parts[2]),
          new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
        );
        if (sigOk) {
          if (payload.iss && payload.iss !== SUPABASE_URL) return { ok: false, reason: 'issuer_mismatch' };
          if (payload.role && !ALLOWED_ROLES.has(payload.role)) return { ok: false, reason: 'role_denied' };
          return { ok: true, role: payload.role, sub: payload.sub };
        }
        last = { ok: false, reason: 'bad_signature' };
      } catch (err) {
        last = { ok: false, reason: (err as Error).message };
      }
    }
    return last;
  };

  try {
    const keys = await getJwks();
    const first = await verify(keys);
    if (first.ok) return first;
    // Keys rotate: one forced refresh before giving up.
    if (jwksCache && Date.now() - jwksCache.fetchedAt > 5 * 60 * 1000) {
      const refreshed = await verify(await getJwks(true));
      if (refreshed.ok) return refreshed;
    }
    return first;
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

function bearerOf(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  if (/^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, '').trim() || null;
  return null;
}

/**
 * The API keys this project itself holds. The anon key here is an HMAC-signed
 * JWT, which cannot be checked offline without the legacy JWT secret, so it is
 * compared against the platform's own values - the same gate Supabase's
 * `apikey` check applies. RSA-signed project JWTs (user sessions, signing-key
 * migration) are verified cryptographically instead.
 */
function projectApiKeys(): string[] {
  const keys = new Set<string>();
  if (ANON_KEY) keys.add(ANON_KEY);
  const raw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '';
  if (raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        parsed.forEach((k) => typeof k === 'string' && k && keys.add(k));
      } else if (typeof parsed === 'string' && parsed) {
        keys.add(parsed);
      }
    } catch {
      raw
        .split(/[\s,]+/)
        .filter(Boolean)
        .forEach((k) => keys.add(k));
    }
  }
  return [...keys];
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isProjectApiKey(candidate: string): boolean {
  return projectApiKeys().some((key) => timingSafeEqualStr(key, candidate));
}


async function authenticate(req: Request): Promise<JwtOutcome> {
  const bearer = bearerOf(req);
  const apikey = req.headers.get('apikey')?.trim() || null;
  if (!bearer && !apikey) return { ok: false, reason: 'missing_token' };

  // A supplied apikey must be this project's key.
  if (apikey && !isProjectApiKey(apikey)) return { ok: false, reason: 'unknown_api_key' };

  const candidate = bearer ?? apikey!;
  if (candidate.split('.').length === 3) {
    const result = await verifyProjectJwt(candidate);
    if (result.ok) return result;
    // A legacy HS256 anon/publishable key cannot be verified offline: accept it
    // only when it matches a key the platform already holds, byte for byte.
    if (isProjectApiKey(candidate)) return { ok: true, role: 'anon' };
    return result;
  }

  if (isProjectApiKey(candidate)) return { ok: true, role: 'anon' };
  return { ok: false, reason: 'unknown_api_key' };
}


// ---------------------------------------------------------------------------
// 2. Rate limiting - fixed windows in Postgres via auth_proxy_check_limit()
// ---------------------------------------------------------------------------

type LimitVerdict = { allowed: boolean; retryAfter: number; remaining: number };

async function checkLimit(bucket: string, limit: number, windowSec: number): Promise<LimitVerdict> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/auth_proxy_check_limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ p_bucket: bucket, p_limit: limit, p_window_sec: windowSec }),
    });
    if (!res.ok) {
      // Fail open: a rate-limit store outage must not lock real users out.
      console.error(`auth-proxy: limit store error ${res.status} for ${bucket}`);
      return { allowed: true, retryAfter: 0, remaining: limit };
    }
    const data = await res.json().catch(() => []);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== 'boolean') return { allowed: true, retryAfter: 0, remaining: limit };
    return {
      allowed: row.allowed,
      retryAfter: Number(row.retry_after ?? 0),
      remaining: Number(row.remaining ?? 0),
    };
  } catch (err) {
    console.error('auth-proxy: limit store unreachable', err);
    return { allowed: true, retryAfter: 0, remaining: limit };
  }
}

async function firstLimit(buckets: Array<[string, number, number]>): Promise<LimitVerdict | null> {
  const verdicts = await Promise.all(buckets.map(([b, l, w]) => checkLimit(b, l, w)));
  const blocked = verdicts.find((v) => !v.allowed);
  if (!blocked) {
    const tightest = verdicts.reduce((a, b) => (a.remaining <= b.remaining ? a : b));
    return { allowed: true, retryAfter: 0, remaining: tightest.remaining };
  }
  return blocked;
}

function clientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

async function hashEmail(email: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// ---------------------------------------------------------------------------
// 3. Validation
// ---------------------------------------------------------------------------

const Email = z.string().trim().toLowerCase().min(3).max(254).email();
const TokenBody = z.object({
  email: Email,
  password: z.string().min(1).max(72),
});
const RecoverBody = z.object({ email: Email });

// ---------------------------------------------------------------------------
// Forwarding
// ---------------------------------------------------------------------------

async function forward(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return json(data, res.status);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) return json({ error: 'payload_too_large' }, 413);

  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';

  try {
    const auth = await authenticate(req);
    if (!auth.ok) {
      console.warn(`auth-proxy: rejected ${action} (${auth.reason}) from ${clientIp(req)}`);
      return json({ error: 'unauthorized', reason: auth.reason }, 401);
    }

    const raw = await req.arrayBuffer();
    if (raw.byteLength > MAX_BODY_BYTES) return json({ error: 'payload_too_large' }, 413);
    let payload: unknown = {};
    if (raw.byteLength) {
      try {
        payload = JSON.parse(new TextDecoder().decode(raw));
      } catch {
        return json({ error: 'invalid_json' }, 400);
      }
    }

    const ip = clientIp(req);

    if (action === 'token') {
      const parsed = TokenBody.safeParse(payload);
      if (!parsed.success) return json({ error: 'invalid_request', fields: parsed.error.flatten().fieldErrors }, 400);
      const { email, password } = parsed.data;

      const verdict = await firstLimit([
        [`token:ip:${ip}`, 12, 60],
        [`token:acct:${await hashEmail(email)}`, 6, 300],
      ]);
      if (!verdict.allowed) {
        return json(
          { error: 'rate_limited', retry_after: verdict.retryAfter, message: 'Too many sign-in attempts' },
          429,
          { 'Retry-After': String(verdict.retryAfter) },
        );
      }
      return await forward('/auth/v1/token?grant_type=password', { email, password });
    }

    if (action === 'recover') {
      const parsed = RecoverBody.safeParse(payload);
      if (!parsed.success) return json({ error: 'invalid_request', fields: parsed.error.flatten().fieldErrors }, 400);
      const { email } = parsed.data;

      const verdict = await firstLimit([
        [`recover:ip:${ip}`, 6, 60],
        [`recover:acct:${await hashEmail(email)}`, 3, 3600],
      ]);
      if (!verdict.allowed) {
        return json(
          { error: 'rate_limited', retry_after: verdict.retryAfter, message: 'Too many reset requests' },
          429,
          { 'Retry-After': String(verdict.retryAfter) },
        );
      }
      return await forward('/auth/v1/recover', { email });
    }

    return json({ error: `unknown action: ${action}` }, 404);
  } catch (err) {
    console.error('auth-proxy: unhandled error', err);
    return json({ error: 'proxy_error' }, 500);
  }
});
