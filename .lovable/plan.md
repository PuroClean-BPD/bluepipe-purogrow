# R6 Import Preflight — Result: STOP (prerequisites missing)

Read-only check done. Nothing was changed, deployed or sent.

## Findings

1. **No ZIP files are attached.** The uploads folder holds 96 older files (images, video, earlier audit payload chunks). None are ZIP, R6, or JSON. Nothing exists to import yet.
2. **No supported managed tool does private, byte-identical storage ingestion.** `supabase--storage_upload` only uploads a file from the project folder, and it is documented for buckets with a public SELECT policy. `reports-private` is private, with restrictive deny policies. Getting the files into the project folder would also be a code-tree change. SQL writes to storage are not supported.
3. **No managed tool creates auth users without email.** The managed tools give no user-provisioning call, and writing to `auth.users` with SQL is forbidden. The earlier fixture harness worked with a privileged local key. You have excluded that route ("do not extract credentials / mint admin access").
4. **The audited state machine and grants need a real staff session.** `monthly_grant`, `monthly_revoke` and `monthly_transition` check `auth.uid()` against `monthly_staff`. Plain SQL through the managed query tool has no `auth.uid()`, so these functions reject it. Writing rows directly would skip the audit trail, which goes against the requirement. No real admin (Bill) staff row exists, and creating one needs a real auth user (see 3).
5. **Client login cannot work while sending is OFF.** The portal only offers an email link or 6-digit code, and both are sent by email. `monthly-auth` fails closed while `auth_sending_enabled` is false, and the sign-in form is disabled. The only way to sign in without email is a password, which needs a frontend code change and per-user password provisioning.
6. **Memberships cannot be "explicit and unambiguous" yet.** No owner auth accounts exist to map, and no permission to invite them exists.

## Exact prerequisites (any one missing blocks the work)

- Attach the 25 R6 triplets (HTML, PDF, content JSON), plus a manifest: location slug, display name, owner email, and SHA256 for each file.
- A supported private ingestion route. Either (a) Bill approves a small new admin-only edge function that takes an upload from a signed-in admin staff session and writes it to `reports-private`; this is a backend code change plus a deploy. Or (b) a Lovable-documented private-bucket upload tool.
- A supported way to create owner and admin accounts without email. Either approval to turn on auth sending (an email/invite permission you do not have), or approval for an admin-only server provisioning function (a backend code change).
- A real admin staff account for Bill, signed in through the portal, to run the grants and the draft→approved→published steps through the audited functions.
- If owners must sign in with sending OFF: a frontend change plus redeploying the Netlify site, both excluded right now.

## What can run today with no new approvals

- Synthetic-only security re-tests with the existing fixtures. This needs the local harness key the fixtures were created with, so under the current "no credential extraction" rule it is also blocked. It can be confirmed when approval is given.
- Inserting location rows (`monthly_clients`) with SQL. This would be a data-only change outside the audit log, and it is pointless without files and owners, so it is not recommended alone.

## Recommendation

Approve option (a): an admin-only upload and provisioning edge function, called from a staff session, that logs every action to `monthly_audit_log`. Keep sending OFF. Then attach the ZIPs. Owners can only sign in once email sending (or a password route plus a redeploy) is approved.
