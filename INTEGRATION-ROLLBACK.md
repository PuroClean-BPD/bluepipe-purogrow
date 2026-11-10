# Monthly portal integration and rollback

## Integration

- Additive entry: `/portal/monthly`; exact PKCE callback: `/portal/callback`.
- Original `/portal`, `/portal/dashboard`, `/reports/caseyville-il`, `/local-seo-dashboard`, all other public pages and all `public/a/**` files are preserved.
- New dedicated auth client uses `bluepipe-monthly-auth` storage, separate from the existing portal. New monthly code does not import the external audit backend, profile client-slug mapping, or raw console logging.
- Database uses `public.monthly_*` namespacing (8 tables); every table has ENABLE+FORCE RLS and no anon table access. Authenticated users have SELECT only, subject to RLS. Private settings has no client-readable policy.
- New private bucket `reports-private` has restrictive policy denying anon/authenticated direct read/write. Server endpoint only signs stored version paths after caller-RLS checks, never arbitrary supplied paths. HTML is displayed in an empty sandbox with no origin/scripts privileges, plus fixture HTML has strict CSP. Issuances are logged, URLs expire in 60 seconds and carry download disposition.
- Local fixture harness is not deployed. It only creates reserved-address synthetic users; real client creation or enrollment is not implemented or authorized. Bill's sole admin/approver assignment remains proposed only. No real account/grant exists.

## Email activation blockers — separate approval required

`monthly_settings.auth_sending_enabled` is explicitly OFF. The endpoint fails closed for missing/unreadable flags. No auth emails were sent.

Before activation, separately approve sending, confirm hosted OTP length is exactly six under Users → Auth settings → Email, and verify the Magic Link template contains both the link and code. These are hosted settings, not custom OTP generation. Set a server-only `MONTHLY_AUTH_ORIGINS` allow-list for exact approved origins (currently absent, also fails closed). Callback requests require `/portal/callback` with no query/hash and a PKCE challenge. The send request uses Auth `create_user:false` (the server equivalent of `shouldCreateUser:false`); there is no signup UI. Legacy global signup remains unchanged. Add the Netlify origin under hosted Redirect URLs before any Netlify auth activation; it is not currently allow-listed. No global auth reconfiguration is justified.

Real email delivery, six-digit hosted configuration, and end-to-end magic-link exchange are NOT RUN. The code verification UI exists but remains disabled with the server feature flag.

## Versioned migrations

- Authoritative applied forward SQL: `drizzle/migrations/0000_monthly_portal_v1.sql`, `0001_monthly_policy_scope_fix.sql`.
- First forward SQL also stored byte-identically under `supabase/migrations/202611070001_monthly_portal_v1.sql`.
- Non-destructive down scripts: `supabase/rollback/202611070001_monthly_portal_v1.down.sql`, `202611070002_monthly_policy_scope_fix.down.sql`.
- Apply rollback through the migration tool only. Down revokes new portal access and retains every row, audit record, storage file and auth user. It does not revert to the bad v1 correlated policy. Stop the new endpoints/remove additive routes as appropriate; do not delete real or fixture users automatically.

## Backups

Verified code baseline `c4fab5c212c7362c56e1024299773aa01b3db5a9`. Database snapshot inventory and storage backups are UNVERIFIED. No destructive database rollback/restore is authorized. Additive tables isolate all changes; rollback preserves production data/storage. Fixtures remain clearly labelled and isolated; no real report release.

## Deployment

New backend functions and migrations are already active on this project's Cloud backend, with monthly sending OFF. Frontend publishing is conditional on security/UI checks. Lovable publishing targets `bluepipe-purogrow.lovable.app`, not the custom-domain Netlify site. Public DNS for `puroclean.bluepipedigital.com` points to `imaginative-croquembouche-a1035e.netlify.app`; repository/branch/build deployment linkage cannot currently be verified. No unsupported Netlify APIs are used. Do not claim custom-domain deployment without evidence.
## Remaining release limitations

The new lazy monthly module contains no external audit key/import or console data logs. The existing site's shared initial bundle still includes its original legacy portal imports; removing those would require additional legacy-route refactoring outside this isolation scope. No whole-site key-removal claim is made. Publication is withheld while the strict whole-bundle requirement is unresolved and hosted six-digit/PKCE email configuration cannot be verified without live auth sending. Backend access is safely isolated and email sending remains OFF.

## Nov 10 2026
Rollback: delete function monthly-admin; restore monthly-auth from 67c8e83. No schema/data changes.

## Nov 10 2026 (2)
Baseline eece788. Rollback: apply supabase/rollback/202611100001_monthly_admin_atomic.down.sql via migration tool; redeploy monthly-admin from eece788 if needed. Data retained.
