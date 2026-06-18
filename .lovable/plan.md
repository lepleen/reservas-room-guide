
## Goal
Temporarily let anyone access protected routes (dashboard, calendar, reservations, internal, admin) without signing in — without deleting the auth system you just built.

## Approach
Introduce a single feature flag `VITE_AUTH_BYPASS` (read via `import.meta.env.VITE_AUTH_BYPASS === "true"`). When enabled:

1. **`src/components/AuthGuard.tsx`** — if bypass is on, skip the auth + role check and render `children` directly. Original logic stays intact for when the flag is off.

2. **`src/contexts/AuthContext.tsx`** — when bypass is on, expose a synthetic "dev" identity: `isAuthenticated: true`, a mock `profile`, and `roles: ["admin", "internal", "external"]` so every role-gated page (including `/admin` and `/internal/*`) opens. `loading` resolves to `false` immediately. Real Supabase calls (`signIn`, `signOut`, etc.) are left untouched so the auth UI still works if you visit it.

3. **`src/routes/auth.tsx`** — already redirects to `/dashboard` when authenticated, so the synthetic session naturally bounces you out of the login page. No change needed.

4. **`.env`** — add `VITE_AUTH_BYPASS=false` as the documented default, with a comment explaining how to flip it to `true` for local/demo use.

## How to use it
- To disable auth: set `VITE_AUTH_BYPASS=true` in `.env`, restart dev server. Every route opens; the user appears as a full admin.
- To re-enable auth: set it back to `false` (or remove the line). No code changes needed — your Supabase auth, RLS, roles, and guards all resume working exactly as before.

## Why a flag (not deleting guards)
- Reversible in one line.
- No risk of forgetting to restore RLS-aware UI when re-enabling.
- Clear signal in code/env that auth is intentionally off.

## Caveats
- Database RLS is **not** bypassed. Any page that queries Supabase as the signed-in user (e.g. fetching the user's reservations) will still get empty results because there's no real session. If you want demo data to load too, we'd additionally need to either (a) seed with a real test user and auto-sign-in, or (b) loosen RLS for demo — say the word and I'll extend the plan.
- Don't ship `VITE_AUTH_BYPASS=true` to production; it grants admin to everyone.

## Files touched
- `src/components/AuthGuard.tsx` (early return when flag on)
- `src/contexts/AuthContext.tsx` (synthetic session when flag on)
- `.env` (add flag, default false)
