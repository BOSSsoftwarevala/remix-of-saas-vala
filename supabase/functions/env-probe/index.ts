// Throwaway diagnostic: reports which Supabase-related env vars the edge
// runtime actually sees, without revealing any values (presence, length and a
// short prefix for public keys only). Deleted right after use.
const NAMES = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_PUBLISHABLE_KEYS',
  'SUPABASE_SECRET_KEYS',
  'SUPABASE_JWKS',
  'SUPABASE_JWT_SECRET',
];

const PUBLIC = new Set(['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEYS']);

Deno.serve(() => {
  const report: Record<string, unknown> = {};
  for (const name of NAMES) {
    const value = Deno.env.get(name) ?? '';
    report[name] = {
      present: value.length > 0,
      len: value.length,
      prefix: PUBLIC.has(name) ? value.slice(0, 24) : undefined,
    };
  }
  return new Response(JSON.stringify(report, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});
