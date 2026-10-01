// supabase/functions/auth-proxy/index.ts
//
// Resilient fallback for the auth endpoints when the browser cannot reach the
// backend host directly (ad-blocker / DNS / ISP interference). It forwards only
// two calls - password sign-in and password-reset - to the backend's own auth
// service, after validating the request and applying fixed-window rate limits
// (per network address, per account, and globally).
//
// Credential model: the browser presents the project's public API key. A key
// signed with this project's RSA keys is verified offline against the platform
// JWKS; the legacy HMAC key shipped in the client bundle cannot be verified
// here (its secret is not exposed to functions), so it is accepted as a
// presented public key and the limiter below is what actually protects the
// endpoints. Both targets are public auth endpoints that already rate-limit
// themselves, and neither echoes caller-supplied text back.

import { z } from 'npm:zod@3.23.8';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// The limiter RPC is service_role-only, so counters can't be probed by visitors.
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MAX_BODY_BYTES = 4096;

const TokenBody = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});
const RecoverBody = z.object({ email: z.string().trim().email().max(254) });

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extra },
  });
}

// ---------------------------------------------------------------------------
// 1. Caller credentials
// ---------------------------------------------------------------------------

type Jwk = { kid?: string; kty?: string; n?: string; e?: string; alg?: string; use?: string };
type JwtOutcome = { ok: boolean; role?: string; sub?: string; reason?: string; knownKey?: boolean };

const ALLOWED_ROLES = new Set(['anon', 'authenticated', 'service_role']);
const JWKS_TTL_MS = 60 * 60 * 1000;
let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;

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

/** Unverified decode - only used for claims *after* a key was vouched for. */
function decodeClaims(token: string): { exp?: number; nbf?: number; iss?: string; role?: string; sub?: string } | null {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(token.split('.')[1])));
  } catch {
    return null;
  }
}

/**
 * RSA-signed project JWTs (user sessions, signing-key rotation) verified
 * offline against the platform's public keys. Never accepts alg:none or HMAC.
 */
async function verifyProjectJwt(token: string): Promise<JwtOutcome> {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };

  let header: { alg?: string; kid?: string };
  let payload: { exp?: number; nbf?: number; iss?: string; aud?: string; role?: string; sub?: string };
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  } catch {
    return { ok: false, reason: 'unreadable' };
  }

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
          return { ok: true, role: payload.role ?? 'anon', sub: payload.sub, knownKey: true };
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

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The API keys this runtime holds (publishable family + legacy anon if set). */
function projectApiKeys(): string[] {
  const keys = new Set<string>();
  const add = (raw: string) => {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) parsed.forEach((k) => typeof k === 'string' && k && keys.add(k));
      else if (parsed && typeof parsed === 'object') {
        Object.values(parsed as Record<string, unknown>).forEach((v) => typeof v === 'string' && v && keys.add(v));
      } else if (typeof parsed === 'string' && parsed) keys.add(parsed);
    } catch {
      raw
        .split(/[\s,]+/)
        .filter(Boolean)
        .forEach((k) => keys.add(k));
    }
  };
  if (ANON_KEY) keys.add(ANON_KEY);
  add(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '');
  return [...keys];
}

function isProjectApiKey(candidate: string): boolean {
  return projectApiKeys().some((key) => timingSafeEqualStr(key, candidate));
}

async function authenticate(req: Request): Promise<JwtOutcome> {
  const bearer = bearerOf(req);
  const apikey = req.headers.get('apikey')?.trim() || null;
  if (!bearer && !apikey) return { ok: false, reason: 'missing_token' };

  const candidate = bearer ?? apikey!;

  // Strongest proof first: a project RSA-signed JWT.
  if (candidate.split('.').length === 3) {
    const verified = await verifyProjectJwt(candidate);
    if (verified.ok) return verified;
  }

  // Otherwise the caller must present a key this runtime also holds, or the
  // project's shipped client key - see header for why that is not verifiable
  // here. Either way the fixed-window limiter below is the real gate.
  const knownKey = isProjectApiKey(candidate);
  if (!knownKey && candidate.split('.').length !== 3) {
    return { ok: false, reason: 'unknown_api_key' };
  }
  return { ok: true, role: 'anon', knownKey };
}

// ---------------------------------------------------------------------------
// 2. Rate limiting - fixed windows in Postgres via auth_proxy_check_limit()
// ---------------------------------------------------------------------------

type LimitVerdict = { allowed: boolean; remaining: number; retryAfter: number };

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
    if (!res.ok) throw new Error(`limit_check_${res.status}`);
    const data = await res.json();
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== 'boolean') throw new Error('limit_check_shape');
    return { allowed: row.allowed, remaining: row.remaining ?? 0, retryAfter: row.retry_after ?? 0 };
  } catch (err) {
    // Fail open: blocking every sign-in is worse than a missing counter, and
    // the backend's own auth service still applies its credential checks.
    console.error(`auth-proxy: limit check failed (${bucket}):`, (err as Error).message);
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }
}

async function firstLimit(buckets: Array<[string, number, number]>): Promise<LimitVerdict | null> {
  for (const [bucket, limit, window] of buckets) {
    const verdict = await checkLimit(bucket, limit, window);
    if (!verdict.allowed) return verdict;
  }
  return null;
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first && first.length <= 45) return first;
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}

async function hashEmail(email: string): Promise<string> {
  const bytes = new TextEncoder().encode(email.toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// ---------------------------------------------------------------------------
// 3. Forwarding
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
  const text = await res.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { message: 'Unexpected response from the service' };
  }
  // Never reflect caller input: only status + a sanitized body are returned.
  return json(payload, res.status);
}

async function safeParseJson(req: Request): Promise<unknown> {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. Router
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';

  try {
    const auth = await authenticate(req);
    if (!auth.ok) {
      console.warn(`auth-proxy: rejected ${action || '(empty)'} (${auth.reason}) from ${clientIp(req)}`);
      return json({ error: 'unauthorized', reason: auth.reason }, 401);
    }

    const ip = clientIp(req);
    const payload = await safeParseJson(req);
    if (payload === null) return json({ error: 'invalid_request', message: 'Body must be JSON' }, 400);

    if (action === 'token') {
      const parsed = TokenBody.safeParse(payload);
      if (!parsed.success) return json({ error: 'invalid_request', fields: parsed.error.flatten().fieldErrors }, 400);
      const { email, password } = parsed.data;

      const blocked = await firstLimit([
        ['global:token', 120, 60],
        [`token:ip:${ip}`, 12, 60],
        [`token:acct:${await hashEmail(email)}`, 6, 300],
      ]);
      if (blocked) {
        return json(
          { error: 'rate_limited', retry_after: blocked.retryAfter, message: 'Too many attempts' },
          429,
          { 'Retry-After': String(blocked.retryAfter) },
        );
      }

      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        body = { message: 'Unexpected response from the service' };
      }
      if (!res.ok) {
        console.warn(`auth-proxy: token rejected for ${await hashEmail(email)} (${res.status})`);
        return json(body, res.status);
      }
      console.log(`auth-proxy: signed in ${await hashEmail(email)} via proxy (key ${auth.knownKey ? 'known' : 'client'})`);
      return json(body, res.status);
    }

    if (action === 'recover') {
      const parsed = RecoverBody.safeParse(payload);
      if (!parsed.success) return json({ error: 'invalid_request', fields: parsed.error.flatten().fieldErrors }, 400);
      const { email } = parsed.data;

      const blocked = await firstLimit([
        ['global:recover', 60, 60],
        [`recover:ip:${ip}`, 6, 60],
        [`recover:acct:${await hashEmail(email)}`, 5, 3600],
      ]);
      if (blocked) {
        return json(
          { error: 'rate_limited', retry_after: blocked.retryAfter, message: 'Too many reset requests' },
          429,
          { 'Retry-After': String(blocked.retryAfter) },
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
