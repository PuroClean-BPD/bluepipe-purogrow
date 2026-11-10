# Correction checkpoint: API and staff bootstrap

## Deployment boundary

Frontend and Netlify broker are NOT deployed. All checkpoint commits contain `[skip netlify] [skip ci]`. A later unmarked CI commit can deploy the entire diff: coordinator review and separate controlled instruction remain mandatory. No Lovable Publish, account/plan/env changes, DNS, real access activation, email, real imports, owners, grants or Bill bootstrap were performed.

Cloud `monthly-code` and `monthly-admin` corrections and additive migration `0008_monthly_code_review_guards.sql` are deployed. Protected `public/a/**`, `src/App.tsx`, public pages and old route sources are untouched.

## Public broker contract

POST `/portal/api/owner`, exact same-origin Origin and `X-BluePipe-Request: 1` required. Body maximum 2048 **bytes**, streamed/cancelled on overflow even without Content-Length. JSON null/primitives/arrays/unknown keys reject before forwarding. Infrastructure/broker rejects are **not** claimed to have monthly_audit_log rows.

- `{action: login, code: string}` → `{ok:true}` plus host-only `__Host-bluepipe-owner` HttpOnly Secure SameSite=Strict cookie, Max-Age 2592000. No token in response JSON.
- `{action: archive}` → `{ok:true, clients:[id,display_name,slug,package], reports:[id,report_id,client_id,version,period_label,period_start,period_end,dataset_sha256]}`.
- `{action: file, version_id: UUID, format: html|pdf|content}` → `{url,sha256,expires_in:60}`. This documented file URL is intentionally short-lived, never a session token; test ledgers never contain it.
- `{action: logout}` → `{ok:true}` and cookie deletion only after durable Cloud confirmation.
- Every error is a broker-owned generic `{error}`; unexpected upstream JSON fields are stripped at every nesting level. Upstream malformed successful outputs fail 503. Upstream errors are never forwarded. Upstream reads capped at 1MB.

Cloud direct API takes these actions with a `session` proof for non-login actions, never trusts Origin/IP as authority. Only Cloud possesses its existing runtime privilege, never Netlify. Durable gates are 600 requests/minute globally and 30 login attempts/minute globally before KDF, plus five per-credential in-flight/failure reservations. Five completed failed verifications lock 15 minutes; successful finish releases exactly one own reservation in the same generation/window, never clears another failure. Abandoned reservations remain conservative until the 15-minute window expires. No precise trusted per-IP claim.

Cloud authorization and credential/session mutations audit transactionally and fail closed. If infrastructure or audit service is unavailable, access fails 503; it cannot guarantee a durable audit row during that outage. Storage signing occurs only after audited authorization and is rechecked with the same path/hash after signing. Already-issued URLs may survive revoke for their remaining ≤60 seconds. Saved files cannot be recalled.

## Frozen hashes and calendar periods

HTML/PDF/content issuance requires a valid 64-lowercase-hex frozen staging hash. `dataset_sha256` is the SHA256 of **original UTF8 content.json bytes**, including whitespace, not reserialized JSONB. Content issuance also checks the stored dataset hash agrees with the original content receipt. Legacy synthetic versions without verified staging hashes now fail closed. Browser checks required hash before fetch and exact downloaded bytes before sandbox preview/PDF download.

Archives are explicitly ordered by period_end, period_start, version and UUID descending in SQL; frontend independently sorts and labels versions. Bare dates/UTC-midnight date labels preserve calendar days; actual non-midnight timestamp instants render America/Chicago including DST. Oct 5–Nov 5 inclusive checked in local tests and browser simulation.

## Later genuine staff and private manifest handoff (not executed)

`monthly_staff.synthetic` defaults **true** for all existing/new staff. It is protected from browser writes and is not derived from metadata, email strings or JWT claims. Real credential provisioning and real organization/client/report/staging/version writes require admin role **and synthetic=false** inside database transactions. Only a separately authorized human bootstrap may classify a verified real staff identity as nonsynthetic. No automated bootstrap endpoint is supplied.

Human prerequisites: Bill/workspace owner creates a real confirmed account without sending email through the existing supported editor flow, chooses and verifies a no-email sign-in/password/MFA path, and separately authorizes a protected staff assignment/classification for that exact identity. No genuine Bill session, password/MFA verification or staff classification exists at this checkpoint. Owner codes never confer staff authority. The app cannot complete this human/private-value step on Bill's behalf. Genuine editor JWT remains unavailable; no refused identity was retried or spoofed.

Supported subsequent admin intake:
1. `monthly-admin create_org` → UUID.
2. `create_client {org_id,slug,display_name,package}` → UUID (Rocklin rejected).
3. `create_report {client_id,period_start,period_end,period_label,kind}` → UUID.
4. `stage_version {request_id,report_id,html_b64,pdf_b64,content_b64,expected:{html_sha256,pdf_sha256,content_sha256},notes}` → `{id,version,state:draft,sha256,bytes}`; original receipt on replay; immutable fingerprint, lease fencing, byte/hash readback and no-delete safeguards retained.
5. NEW `stage_owner_verifier {selector:32hex,salt:32hex,verifier:64hex,client_ids:[1..3 UUIDs]}` → `{id}` via audited `monthly_code_manage(create_real_staged)`. Guaranteed **synthetic=false, active=false**, 600000 PBKDF2-HMAC-SHA256 iterations. Real scopes only. No plaintext code input. This path was **not invoked hosted**; positive classification tested only in disposable local SQL simulation.

These existing supported actions can ingest the 24-location package under Bill's genuine admin session without direct SQL/service keys. Scope validation requires real client UUIDs, excludes `rocklin-ca`, and makes real credential creation inactive. Activation has deliberately not been provided in this checkpoint. Real code CSV originates only on coordinator box, mode 600; only verifier manifests are privately handed over later, never committed to this public repository. Scope remains 24 including Appleton, 18 owners with 3/3/2/2 and 14 singles. No real roster is reproduced here.

## Evidence limits and rollback

Local PGlite SQL tests use a disposable auth.uid stub: **UNIT simulation**, never hosted identity proof. Browser mocked owner responses: **UI simulation**, not deployed cookie/auth proof. Live audit failure injection BLOCKED because no isolated fixture-scoped injection hook exists; do not install a global audit-failure trigger. Forced hosted expiry BLOCKED without a reviewed audited fixture-expiry RPC. Live NULL/forged/released-NULL lease denial and distinct/overlap allocation are exercised by the supplemental synthetic runtime harness; expired/stale lease and audit-failure injection remain UNIT simulations. Exact 30-day login receipts are policy evidence; elapsed-30-days observation is NOT_RUN.

Rollback retains data: keep real access OFF and deploy the coordinator's recorded frontend rollback (`6af3640e524be2d7fe040589`, source `532d082`) if later CI needs reversal. Do not weaken the corrected security guards to restore vulnerable behavior; backend rollback should be a reviewed forward correction. No applied migration history was rewritten. Existing published synthetic fixtures remain private; new published objects are marked synthetic QA only.

## Final evidence summary

Corrected ledger: 23 PASS rows (20 hosted/static policy checks plus 3 grouped UNIT/UI/STATIC rows), 0 current FAIL, 4 BLOCKED, 2 NOT_RUN. Two harness failures are retained explicitly: initial empty void-response parsing, then raw timestamp encoding/newest-1000 audit query truncation. Corrected audit-only read verified all required actions; full matrix was not rerun after that read correction. Supplemental genuine-admin runtime confirmed mixed logins/five-failure lockout and atomic distinct/same-request lease/NULL guards.

Actual file matrices: **432 HTML + 432 PDF authorization requests**, each **24 allowed / 408 denied**, with 24 independent source-byte/hash verified downloads per format. Archive membership matrix remains separately labeled. All synthetic IDs, request IDs and independent expected hashes are in the secret-free ledger. Earlier failed run's one synthetic version is retained in `code-correction-first-attempt.json`; no storage was deleted.

Bun: 48 PASS. Vitest: 7 PASS. Deno staging orchestration: 12 PASS (dependency-injected unit simulation). Local browser simulation passed exact period dates/version, verified preview, mismatch refusal and legacy route loading; deployed cookie/Safari remains BLOCKED. Preview build latest signal: OK. Manual project builds/typechecks not run; harness performs compilation automatically. No accurate per-turn credit reading is available in this environment; user-provided remaining envelope was not independently recalculated.
