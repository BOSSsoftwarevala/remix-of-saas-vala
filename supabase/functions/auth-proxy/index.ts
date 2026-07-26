// Server-side proxy for Supabase auth endpoints. Lets the browser reach
// /functions/v1/auth-proxy/* when filter lists / corp policies block
// direct calls to /auth/v1/*. Runs with verify_jwt=false (public).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

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

  const url = new URL(req.url);
  // Path arrives as /auth-proxy/<action>
  const action = url.pathname.split('/').filter(Boolean).pop();

  try {
    const payload = await req.json().catch(() => ({}));

    if (action === 'token') {
      const { email, password } = payload as { email?: string; password?: string };
      if (!email || !password) return json({ error: 'email and password required' }, 400);
      return await forward('/auth/v1/token?grant_type=password', { email, password });
    }

    if (action === 'recover') {
      const { email } = payload as { email?: string };
      if (!email) return json({ error: 'email required' }, 400);
      return await forward('/auth/v1/recover', { email });
    }

    return json({ error: `unknown action: ${action}` }, 404);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});