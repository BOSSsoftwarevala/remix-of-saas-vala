# Roadmap

## In progress
- [x] Refine auth diagnostics panel: single clear status summary + "Retry health check" button shown before credentials are submitted
- [x] Client-side error reporting for authHealth: which check failed (network/adblock/CORS/timeout), failing endpoint, timing data
- [ ] E2E test: block direct Supabase auth calls, verify login + recover succeed via auth-proxy "Try via secure proxy" flow (spec written; needs real credentials in env to run green)
- [ ] auth-proxy hardening: JWT authentication + per-IP / per-account rate limiting (function rewritten; needs migration + deploy + verification)

## Queued
- [ ] Surface HTTP 429 from the auth proxy as a "too many attempts, try again in Ns" message in the diagnostics panel

