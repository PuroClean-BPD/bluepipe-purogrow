# Monthly portal — pre-mutation inspection

Inspected 2026-11-07 UTC. No backend, auth, storage or application mutations have been made at this checkpoint.

## Verified code rollback point

- Requested commit: `c4fab5c212c7362c56e1024299773aa01b3db5a9`.
- Current HEAD is exactly that commit; Git confirms the object is a commit.
- Initial working tree was clean; `git diff --exit-code` against that commit for `public`, `src`, and `supabase` succeeded.
- A SHA-256 baseline for 63 protected files, including all 55 `public/a/**` files, was recorded in `/tmp/monthly-portal-protected-manifest.json`. Temporary evidence is not a durable backup; the verified Git commit is the durable code rollback point.

## Existing auth and data (read-only)

- Existing Cloud backend is bound to this project and is running; 3 existing auth users. No user identities or real client records were retrieved.
- Hosted `/auth/v1/settings`: email provider enabled, signup globally enabled, email auto-confirm disabled, anonymous users disabled. These values remain unchanged.
- Hosted OTP length and expiry are not exposed by the public settings response and are UNVERIFIED. No agent tool changes these settings.
- Hosted redirect allow-list permits this project's Lovable preview and published origins with `/**`, including `/portal/callback`. It does not include the Netlify custom domain. No redirect or Site URL changes were made.
- `public.profiles` has RLS enabled but not forced. Existing policies allow authenticated users to SELECT/INSERT/UPDATE only their own profile. No DELETE policy. The existing UPDATE policy permits changing `client_slug`; the new portal must never use that field for authorization.
- Effective legacy profile privileges include anon SELECT and authenticated SELECT/INSERT/UPDATE/DELETE; RLS still governs access. These legacy grants/policies will not be weakened or changed.
- Existing `auth.users` signup trigger calls `public.handle_new_user`; creating synthetic auth users would also create synthetic legacy profile rows. No fixture users have been created.
- There are no existing storage buckets. No storage changes made.
- Existing `/portal` and `/portal/dashboard` use Cloud auth and a separate external audit reader. That external reader and its console logging must not be imported by the monthly portal. It remains untouched.

## Hosting linkage

- This project is published on `https://bluepipe-purogrow.lovable.app`.
- Preview: `https://id-preview--bd1a7847-e48f-46ea-96d9-c9009a51e30b.lovable.app`.
- Read-only domain diagnosis reports `puroclean.bluepipedigital.com` is NOT connected to this Lovable project; public DNS CNAME points to `imaginative-croquembouche-a1035e.netlify.app`.
- Git-to-Netlify repository/branch/autodeploy linkage is UNVERIFIED. A Lovable publish cannot be represented as updating that Netlify domain. No unsupported Netlify operations are authorized or attempted.

## Non-destructive database rollback plan

The verified Git commit backs up code, not the database. Hosted daily snapshot inventory and storage backup are UNVERIFIED; no destructive action is permitted on that basis.

Use only additive `monthly_*` tables, functions and policies; do not alter legacy profiles, auth providers, reserved schemas, public audits or existing report routes. On rollback: switch new auth-sending feature flag OFF; remove only additive frontend route imports; disable execution of new RPCs and new file endpoint; retain all monthly records, audit logs and private storage objects. A down migration must revoke new access, not drop tables or delete production records. Never perform a global database restore or delete auth users as routine rollback. Fixture teardown, if supported, must match a recorded fixture manifest and cannot touch any unlisted record.

## Synthetic testing prerequisite

`lovable auth-session --create-test-user --json` returned: “Creating a test user is not available for this project.” No user was created and no session was minted. Do not fall back to `--self`, existing real accounts, SQL writes to `auth.users`, or browser authorization bypasses. A supported email-free admin-only fixture harness remains required before authenticated real-backend tests and deployment.

## Credits

Initial visible project billing-period usage: 10.321354488 credits (period 2026-10-28 through 2026-11-28). This is cumulative project usage, not the cost of this request. No purchase or upgrade was attempted.