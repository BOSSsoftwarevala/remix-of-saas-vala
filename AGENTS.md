# Architecture Decisions

- Keep system-health routes behind JWT validation and the handler's super-admin role check, but skip legacy session-token binding because the live `user_sessions` schema has no session-token column.