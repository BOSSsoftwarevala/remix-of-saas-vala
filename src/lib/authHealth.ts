import { observability } from '@/observability/logger';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/** Which network check produced a result — used in diagnostics and reports. */
export type AuthCheckName = 'health' | 'token' | 'recover' | 'signup' | 'proxy.token' | 'proxy.recover';

/** How a check failed. `blocked` means the request never reached the server. */
export type FailureMode = 'ok' | 'timeout' | 'blocked' | 'offline' | 'http' | 'unknown';

export type TimingBreakdown = {
  /** Time to first byte, from Resource Timing (undefined when the browser withholds it). */
  ttfbMs?: number;
  /** TCP+TLS handshake duration. */
  connectMs?: number;
  /** Body download duration. */
  downloadMs?: number;
};

export type HealthResult = {
  ok: boolean;
  check: AuthCheckName;
  /** Path-only endpoint, safe to show in the UI. */
  endpoint: string;
  /** Full URL that was attempted. */
  url: string;
  status?: number;
  error?: string;
  errorName?: string;
  /** True when the browser blocked the request before it hit the network (adblock/CORS/offline). */
  blocked?: boolean;
  failureMode: FailureMode;
  startedAt: string;
  durationMs: number;
  timings?: TimingBreakdown;
  timeoutMs: number;
  data?: any;
};

/** A single captured network attempt — the unit of the client-side report. */
export type AuthHealthEvent = {
  id: string;
  at: string;
  /** Wall-clock moment the attempt began (differs from `at`, which is when it was recorded). */
  startedAt?: string;
  check: AuthCheckName;
  endpoint: string;
  url: string;
  method: string;
  ok: boolean;
  status?: number;
  failureMode: FailureMode;
  error?: string;
  errorName?: string;
  durationMs: number;
  timings?: TimingBreakdown;
  timeoutMs?: number;
  online: boolean;
  blocked?: boolean;
};

const MAX_EVENTS = 25;
const REPORT_KEY = 'sv_auth_health_report';

function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function loadEvents(): AuthHealthEvent[] {
  try {
    const raw = safeSession()?.getItem(REPORT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_EVENTS) : [];
  } catch {
    return [];
  }
}

let events: AuthHealthEvent[] = loadEvents();

function persistEvents() {
  try {
    safeSession()?.setItem(REPORT_KEY, JSON.stringify(events));
  } catch {
    // storage disabled (private mode) — reporting still works in memory
  }
}

/**
 * Captures one auth network attempt into the rolling client-side report and mirrors it to
 * the observability console so it survives even when the backend is unreachable.
 */
export function recordAuthEvent(
  input: Partial<AuthHealthEvent> & Pick<AuthHealthEvent, 'check' | 'endpoint' | 'ok' | 'durationMs'>,
): AuthHealthEvent {
  const event: AuthHealthEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    url: '',
    method: 'GET',
    failureMode: input.ok ? 'ok' : 'unknown',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    ...input,
  };
  events = [event, ...events].slice(0, MAX_EVENTS);
  persistEvents();

  const context = {
    check: event.check,
    endpoint: event.endpoint,
    url: event.url,
    method: event.method,
    status: event.status,
    failureMode: event.failureMode,
    blocked: event.blocked,
    durationMs: Math.round(event.durationMs),
    timings: event.timings,
    timeoutMs: event.timeoutMs,
    online: event.online,
    error: event.error,
    errorName: event.errorName,
  };
  if (event.ok) observability.request(`auth.${event.check}`, context);
  else observability.error(`auth.${event.check}`, context);

  return event;
}

/** Newest-first captured attempts (max 25, kept for the session). */
export function getAuthHealthReport(): AuthHealthEvent[] {
  return [...events];
}

export function clearAuthHealthReport() {
  events = [];
  persistEvents();
}

/** Plain-text digest for support/debugging — also what "Copy diagnostics" puts on the clipboard. */
export function formatAuthHealthReport(): string {
  const list = getAuthHealthReport();
  const lines = list.map((e) => {
    const timing = e.timings
      ? ` ttfb=${Math.round(e.timings.ttfbMs ?? -1)}ms connect=${Math.round(e.timings.connectMs ?? -1)}ms`
      : '';
    return [
      `${e.at}  ${e.ok ? 'OK  ' : 'FAIL'}  ${e.check}  ${e.method} ${e.endpoint}`,
      `mode=${e.failureMode}`,
      `status=${e.status ?? '-'}`,
      `${Math.round(e.durationMs)}ms${timing}${e.timeoutMs ? ` (timeout ${e.timeoutMs}ms)` : ''}`,
      `online=${e.online}`,
      e.error ? `error=${e.error}` : '',
    ]
      .filter(Boolean)
      .join('  ');
  });
  return [
    `Software Vala auth diagnostics — ${list.length} attempt(s), newest first`,
    `page=${typeof location !== 'undefined' ? location.href : '-'}`,
    `ua=${typeof navigator !== 'undefined' ? navigator.userAgent : '-'}`,
    ...lines,
  ].join('\n');
}

export function isFetchFailure(err: unknown): boolean {
  if (!err) return false;
  const msg = (err as Error).message || String(err);
  return /failed to fetch|networkerror|load failed|typeerror: fetch/i.test(msg);
}

/** Bucket an error into a failure mode so the UI can name the check that broke. */
export function classifyFailure(
  err: unknown,
  opts: { aborted?: boolean; online?: boolean } = {},
): FailureMode {
  if (opts.aborted) return 'timeout';
  const online = opts.online ?? (typeof navigator !== 'undefined' ? navigator.onLine : true);
  if (online === false) return 'offline';
  const name = (err as Error)?.name || '';
  const msg = ((err as Error)?.message || String(err || '')).toLowerCase();
  if (name === 'AbortError' || /abort|timed out|timeout/.test(msg)) return 'timeout';
  if (name === 'TypeError' || isFetchFailure(err) || /failed to fetch|networkerror|err_|connection refused|connection reset|load failed/.test(msg)) {
    return 'blocked';
  }
  if (/http \d{3}|status \d{3}/.test(msg)) return 'http';
  return 'unknown';
}

export function classifyAuthEndpoint(err: unknown, hint?: 'token' | 'recover' | 'signup' | 'health'): string {
  const msg = ((err as Error)?.message || String(err || '')).toLowerCase();
  if (hint) return `/auth/v1/${hint === 'token' ? 'token?grant_type=password' : hint}`;
  if (msg.includes('recover')) return '/auth/v1/recover';
  if (msg.includes('signup')) return '/auth/v1/signup';
  return '/auth/v1/token?grant_type=password';
}

function pathOf(url: string): string {
  try {
    const u = new URL(url, typeof location !== 'undefined' ? location.origin : 'http://localhost');
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function readResourceTimings(url: string): TimingBreakdown | undefined {
  try {
    const entries = performance.getEntriesByName(url, 'resource');
    const e = entries[entries.length - 1] as PerformanceResourceTiming | undefined;
    if (!e || !e.responseEnd) return undefined;
    const start = e.fetchStart || e.startTime;
    const ttfbMs = e.responseStart > start ? e.responseStart - start : undefined;
    const connectMs = e.connectEnd > e.connectStart ? e.connectEnd - e.connectStart : undefined;
    const downloadMs = e.responseEnd > e.responseStart ? e.responseEnd - e.responseStart : undefined;
    if (ttfbMs === undefined && connectMs === undefined && downloadMs === undefined) return undefined;
    return { ttfbMs, connectMs, downloadMs };
  } catch {
    return undefined;
  }
}

/**
 * Single timing path for every auth request: measures wall-clock duration, pulls
 * Resource Timing breakdown, classifies failures, and records the attempt.
 */
async function probe(
  url: string,
  init: RequestInit,
  check: AuthCheckName,
  timeoutMs: number,
  opts: { parseJson?: boolean } = {},
): Promise<HealthResult> {
  const method = (init.method || 'GET').toUpperCase();
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const controller = new AbortController();
  let aborted = false;
  const timer = setTimeout(() => {
    aborted = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const durationMs = performance.now() - started;
    let data: any;
    if (opts.parseJson) data = await res.json().catch(() => ({}));
    const timings = readResourceTimings(url);
    const result: HealthResult = {
      ok: res.ok,
      check,
      endpoint: pathOf(url),
      url,
      status: res.status,
      failureMode: res.ok ? 'ok' : 'http',
      startedAt,
      durationMs,
      timings,
      timeoutMs,
      data,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
    recordAuthEvent(result);
    return result;
  } catch (err) {
    const durationMs = performance.now() - started;
    const failureMode = classifyFailure(err, { aborted });
    const result: HealthResult = {
      ok: false,
      check,
      endpoint: pathOf(url),
      url,
      error: (err as Error)?.message || String(err),
      errorName: (err as Error)?.name,
      blocked: failureMode === 'blocked' || failureMode === 'offline',
      failureMode,
      startedAt,
      durationMs,
      timings: readResourceTimings(url),
      timeoutMs,
    };
    recordAuthEvent(result);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

/** Pre-login connectivity probe against `/auth/v1/health`. */
export async function checkAuthConnectivity(timeoutMs = 4000): Promise<HealthResult> {
  return probe(
    `${SUPABASE_URL}/auth/v1/health`,
    { method: 'GET', headers: { apikey: ANON_KEY }, cache: 'no-store' },
    'health',
    timeoutMs,
  );
}

/**
 * Fallback proxy login — routes the password grant through our edge function
 * so the request goes to `/functions/v1/auth-proxy` instead of `/auth/v1/*`
 * (helps when a filter list or corp policy specifically blocks the auth path).
 */
export async function proxySignIn(email: string, password: string): Promise<{ session: any; error: string | null }> {
  const result = await probe(
    `${SUPABASE_URL}/functions/v1/auth-proxy/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ email, password }),
    },
    'proxy.token',
    15000,
    { parseJson: true },
  );
  if (!result.ok) {
    const json = result.data || {};
    return { session: null, error: json.error_description || json.msg || json.error || result.error || 'Proxy login failed' };
  }
  return { session: result.data, error: null };
}

export async function proxyRecover(email: string): Promise<{ ok: boolean; error: string | null }> {
  const result = await probe(
    `${SUPABASE_URL}/functions/v1/auth-proxy/recover`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ email }),
    },
    'proxy.recover',
    15000,
    { parseJson: true },
  );
  if (!result.ok) {
    const json = result.data || {};
    return { ok: false, error: json.error_description || json.msg || json.error || result.error || 'Proxy request failed' };
  }
  return { ok: true, error: null };
}
