-- auth-proxy abuse protection: fixed-window attempt counters + atomic limiter.
-- The edge function calls auth_proxy_check_limit(bucket, limit, window_seconds)
-- before forwarding anything to Supabase auth. Nobody reads or writes the table
-- directly: RLS is on with no policies, and only the security-definer function
-- below touches it.

CREATE TABLE IF NOT EXISTS public.auth_proxy_attempts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_seconds INTEGER NOT NULL DEFAULT 60,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (bucket_key, window_start)
);

GRANT ALL ON public.auth_proxy_attempts TO service_role;
REVOKE ALL ON public.auth_proxy_attempts FROM PUBLIC, anon, authenticated;
ALTER TABLE public.auth_proxy_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.auth_proxy_check_limit(
  p_bucket TEXT,
  p_limit INTEGER,
  p_window_sec INTEGER
)
RETURNS TABLE (allowed BOOLEAN, remaining INTEGER, retry_after INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
  v_attempts INTEGER;
BEGIN
  IF p_bucket IS NULL OR length(p_bucket) > 200 OR p_limit IS NULL OR p_limit < 1
     OR p_window_sec IS NULL OR p_window_sec < 1 OR p_window_sec > 86400 THEN
    RETURN QUERY SELECT true, 0, 0;
    RETURN;
  END IF;

  v_window := to_timestamp(floor(extract(epoch FROM v_now) / p_window_sec) * p_window_sec);
  v_window_end := v_window + make_interval(secs => p_window_sec);

  INSERT INTO public.auth_proxy_attempts (bucket_key, window_start, window_seconds, attempts, updated_at)
  VALUES (p_bucket, v_window, p_window_sec, 1, v_now)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET attempts = auth_proxy_attempts.attempts + 1, updated_at = v_now
  RETURNING auth_proxy_attempts.attempts INTO v_attempts;

  IF v_attempts > p_limit THEN
    RETURN QUERY
      SELECT false, 0, greatest(1, ceil(extract(epoch FROM (v_window_end - v_now)))::integer);
  ELSE
    RETURN QUERY
      SELECT true, greatest(p_limit - v_attempts, 0), 0;
  END IF;

  -- Opportunistic purge of stale windows; cheap and self-limiting.
  IF random() < 0.02 THEN
    DELETE FROM public.auth_proxy_attempts WHERE window_start < v_now - interval '2 days';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.auth_proxy_check_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_proxy_check_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated, service_role;
