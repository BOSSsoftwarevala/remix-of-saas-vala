REVOKE ALL ON FUNCTION public.auth_proxy_check_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auth_proxy_check_limit(TEXT, INTEGER, INTEGER) TO service_role;

CREATE POLICY "No direct access to proxy counters" ON public.auth_proxy_attempts
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);