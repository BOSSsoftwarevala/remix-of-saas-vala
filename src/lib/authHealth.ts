const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type HealthResult = {
  ok: boolean;
  endpoint: string;
  status?: number;
  error?: string;
  /** True when the browser blocked the request before it hit the network (adblock/CORS/offline). */
  blocked?: boolean;
  durationMs: number;
};

export function isFetchFailure(err: unknown): boolean {
  if (!err) return false;
  const msg = (err as Error).message || String(err);
  return /failed to fetch|networkerror|load failed|typeerror: fetch/i.test(msg);
}

export function classifyAuthEndpoint(err: unknown, hint?: 'token' | 'recover' | 'signup' | 'health'): string {
  const msg = ((err as Error)?.message || String(err || '')).toLowerCase();
  if (hint) return `/auth/v1/${hint === 'token' ? 'token?grant_type=password' : hint}`;
  if (msg.includes('recover')) return '/auth/v1/recover';
  if (msg.includes('signup')) return '/auth/v1/signup';
  return '/auth/v1/token?grant_type=password';
}

export async function checkAuthConnectivity(timeoutMs = 4000): Promise<HealthResult> {
  const endpoint = `${SUPABASE_URL}/auth/v1/health`;
  const started = performance.now();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { apikey: ANON_KEY },
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      endpoint: '/auth/v1/health',
      status: res.status,
      durationMs: performance.now() - started,
    };
  } catch (err) {
    return {
      ok: false,
      endpoint: '/auth/v1/health',
      error: (err as Error).message,
      blocked: isFetchFailure(err) || (err as Error).name === 'AbortError',
      durationMs: performance.now() - started,
    };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fallback proxy call — routes password-grant login through our edge function
 * so the request goes to `/functions/v1/auth-proxy` instead of `/auth/v1/*`
 * (helps when a filter list or corp policy specifically blocks the auth path).
 */
export async function proxySignIn(email: string, password: string): Promise<{ session: any; error: string | null }> {
  const url = `${SUPABASE_URL}/functions/v1/auth-proxy/token`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { session: null, error: json.error_description || json.msg || json.error || `HTTP ${res.status}` };
    return { session: json, error: null };
  } catch (err) {
    return { session: null, error: (err as Error).message };
  }
}

export async function proxyRecover(email: string): Promise<{ ok: boolean; error: string | null }> {
  const url = `${SUPABASE_URL}/functions/v1/auth-proxy/recover`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: false, error: j.error_description || j.msg || j.error || `HTTP ${res.status}` };
    }
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}