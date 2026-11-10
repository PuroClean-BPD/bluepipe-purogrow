# Controlled Netlify deploy checkpoint (synthetic only, NOT go-live)

Reviewed candidate: 260168b8b12deb0142f8febd81b88fc10d8619fc. Deploy commit: this commit (the only commit without skip markers).
Rollback: Netlify deploy 6af3640e524be2d7fe040589 / source 532d08274c0c16f0284e2e9c8a4ac9e26e06e9a2 (frontend only; keep backend guards and retired-membership policy).

## Pre-release readiness (fresh, 2026-11-10 ~14:12 America/Chicago)
- Vitest src/monthly: 10 PASS.
- Bun broker + stream + staff-retirement (PGlite): 12 PASS, 0 FAIL. (First run hit a missing temporary test tool only, not a code failure; re-run passed.)
- Working tree clean on 260168b before this doc.

## get-report-file hash
- f6b71eab…b064 = SHA-256 of the single file supabase/functions/get-report-file/index.ts.
- c0582647…0d0d = deploy tool's "files and settings" bundle hash.
- Repo source redeployed via supported tool this checkpoint; it returned the identical bundle hash c0582647…, so the live function matches the reviewed repo source. Different hash algorithms, not a mismatch.

## Deployed tests: NOT_RUN
The platform pushes commits to GitHub only after the agent turn ends, so Netlify CI starts after this checkpoint.
Nothing could be checked against puroclean.bluepipedigital.com during this checkpoint: broker methods/Origin/null/extra/oversized input,
cookie attributes, 3/3/2/2+14 scope matrix, reload/logout/revoke/rotate, lockout, forged IDs, signed URL expiry,
admin upload/idempotency/NULL-lease regression after 0009, legacy routes, /a gate HTML. All NOT_RUN, nothing claimed.

## BLOCKED (unchanged)
Editor JWT, old-owner JWT, native password sign-in end-to-end, hosted forced expiry, live audit-fault injection, elapsed 30 days.

## Revoking synthetic staff before real import (assessment, not executed)
Add a reviewed additive RPC in a later checkpoint, run by a genuine real admin, that sets monthly_staff.role to NULL or 'revoked' for synthetic=true rows
and writes the monthly_audit_log row in the same transaction. No row deletion. Synthetic staff already cannot do real imports or real credentials (monthly_require_real_admin).

## Next step
Coordinator confirms Netlify deploy ID/state for this commit, then authorizes the deployed synthetic regression run (next checkpoint).
Human prerequisites remain: Bill account + staff classification, 24-location package, salted verifier manifest.
