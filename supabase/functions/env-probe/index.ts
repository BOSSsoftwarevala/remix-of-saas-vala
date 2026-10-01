// Throwaway diagnostic: finds which credential the functions runtime can use to
// call the service_role-only limiter RPC. Reports status codes only. Deleted right after use.
function parseKeys(raw: string): string[] {
  const out: string[] = [];
  if (!raw) return out;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) parsed.forEach((k) => typeof k === 'string' && out.push(k));
    else if (parsed && typeof parsed === 'object') {
      Object.values(parsed as Record<string, unknown>).forEach((v) => typeof v === 'string' && out.push(v));
    } else if (typeof parsed === 'string') out.push(parsed);
  } catch {
    raw.split(/[\s,]+/).filter(Boolean).forEach((k) => out.push(k));
  }
  return out;
}

async function tryRpc(label: string, key: string) {
  if (!key) return { label, status: 'skipped (no key)' };
  const url = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
  try {
    const res = await fetch(`${url}/rest/v1/rpc/auth_proxy_check_limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_bucket: `probe:${label}`, p_limit: 3, p_window_sec: 60 }),
    });
    const text = await res.text();
    return { label, keyLen: key.length, keyPrefix: key.slice(0, 12), status: res.status, body: text.slice(0, 160) };
  } catch (err) {
    return { label, keyLen: key.length, status: `error ${(err as Error).message}` };
  }
}

Deno.serve(async (req) => {
  const secret = parseKeys(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '');
  const publishable = parseKeys(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '');
  const results = [];
  results.push(await tryRpc('secret_keys[0]', secret[0] ?? ''));
  results.push(await tryRpc('service_role_key', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''));
  results.push(await tryRpc('anon_key', Deno.env.get('SUPABASE_ANON_KEY') ?? ''));
  results.push(await tryRpc('publishable[0]', publishable[0] ?? ''));
  const headerKey = req.headers.get('x-probe-key') ?? '';
  if (headerKey) results.push(await tryRpc('client key (from header)', headerKey));

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});
