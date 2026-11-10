# Real backend security evidence

Synthetic fixtures only. No email, invitation, real-account grants or real metrics. Tested 2026-11-07 UTC.

| Test | Expected | Actual | Result |
|---|---|---|---|
| anon GET organizations | 401/403 permission denied | 401 | PASS |
| anon POST organizations | 401/403 permission denied | 401 | PASS |
| anon GET clients | 401/403 permission denied | 401 | PASS |
| anon POST clients | 401/403 permission denied | 401 | PASS |
| anon GET memberships | 401/403 permission denied | 401 | PASS |
| anon POST memberships | 401/403 permission denied | 401 | PASS |
| anon GET staff | 401/403 permission denied | 401 | PASS |
| anon POST staff | 401/403 permission denied | 401 | PASS |
| anon GET reports | 401/403 permission denied | 401 | PASS |
| anon POST reports | 401/403 permission denied | 401 | PASS |
| anon GET report_versions | 401/403 permission denied | 401 | PASS |
| anon POST report_versions | 401/403 permission denied | 401 | PASS |
| anon GET audit_log | 401/403 permission denied | 401 | PASS |
| anon POST audit_log | 401/403 permission denied | 401 | PASS |
| anon GET settings | 401/403 permission denied | 401 | PASS |
| anon POST settings | 401/403 permission denied | 401 | PASS |
| anon file edge | 401 | 401 | PASS |
| ub forged clients | 0 rows | 0 | PASS |
| ub forged clients | 0 rows | 0 | PASS |
| ub forged reports | 0 rows | 0 | PASS |
| ub forged versions | 0 rows | 0 | PASS |
| cross tenant signed issuance | 403 | 403 | PASS |
| ua locations | test-a1,test-a2 | ['test-a1', 'test-a2'] | PASS |
| ua published versions only | 2 published | ['published', 'published'] | PASS |
| anon direct private storage | 403 or masked 400/404 | 400 | PASS |
| anon private storage write | 403 or masked 400/404 | 400 | PASS |
| ua direct private storage | 403 or masked 400/404 | 400 | PASS |
| ua private storage write | 403 or masked 400/404 | 400 | PASS |
| authorized issuance | 200 | 200 | PASS |
| actual signed PDF | 200 PDF | {'status': 200, 'pdf': True} | PASS |
| actual URL expiry after 65s | 400/401/403 expired | 400 | PASS |
| admin revoke | 200/204 or already revoked 403 | 403 | PASS |
| ur revoked old token | 0 rows | 0 | PASS |
| ur revoked issuance | 403 | 403 | PASS |
| ur after refresh | 0 rows | 0 | PASS |
| client write memberships | 403 | 403 | PASS |
| client write staff | 403 | 403 | PASS |
| client write report_versions | 403 | 403 | PASS |
| client write audit_log | 403 | 403 | PASS |
| client RPC monthly_transition | 403 | 403 | PASS |
| client RPC monthly_grant | 403 | 403 | PASS |
| client RPC monthly_revoke | 403 | 403 | PASS |
| editor publish | 403 | 403 | PASS |
| admin approve transition | 200/204 or already approved 403 | 403 | PASS |
| transition logged | approved event | ['approved'] | PASS |
| audit immutable PATCH | 403 | 403 | PASS |
| audit immutable DELETE | 403 | 403 | PASS |
| disabled auth generic unknown | 200 generic enabled false | {'status': 200, 'enabled': False, 'message': 'If access is available, follow the instructions provided.'} | PASS |
| disabled auth generic known | 200 generic enabled false | {'status': 200, 'enabled': False, 'message': 'If access is available, follow the instructions provided.'} | PASS |
| unknown email no creation | 0 matching users | 0 | PASS |
| dataset SHA256 frozen | bc89204397369ca7e3ee09e1fe7481fd76ca65001283e646c6f9cfe5d0ac9fb3 | bc89204397369ca7e3ee09e1fe7481fd76ca65001283e646c6f9cfe5d0ac9fb3 | PASS |
| html matching frozen SHA256 | same SHA256 in actual file | True | PASS |
| pdf matching frozen SHA256 | same SHA256 in actual file | True | PASS |

Real email delivery: NOT RUN. Global signup settings unchanged; new monthly sender is OFF. Hosted six-digit OTP length and Netlify deployment linkage remain UNVERIFIED. Direct storage denial may be HTTP 400/404 (masked object absence) rather than 403; evidence records actual status.

## Additional actual evidence and failures retained

- First backend run: authorized file issuance returned 403; caller report SELECT returned zero rows. Diagnosed unqualified correlated policy IDs. Additive migration `0001_monthly_policy_scope_fix.sql` fixed both organization and report correlation. Repeated same checks: authorized issuance 200, actual PDF 200, actual URL after 65 seconds HTTP 400 expired, HTML/PDF matching frozen hash PASS.
- First run actual admin revoke: HTTP 204; immediate old-token report denial 403 / location SELECT zero; refreshed-token SELECT zero. Repeat run returned 403 for already-revoked grant. This repeat refusal is not a fresh revoke transition.
- First run actual admin approve: HTTP 204 and audit event `approved`; repeat run correctly refused already-approved transition with 403. This repeat refusal is not a fresh approval.
- Real authenticated Playwright desktop (1280×1800) and mobile (390×844): client ua location options exactly two; archive published-only; HTML downloaded through endpoint, displayed in iframe with empty sandbox; location switch; PDF response verified by backend harness. Missing metric orange, unknown package omitted.
- Real admin Playwright selected published a1 fixture and withdrew it, selected approved fixture and published it. Follow-up run selected published v4, withdrew it, selected draft v3, approved then published it; waited for Withdraw control to confirm published state read back through UI. Zero page runtime errors. Sign-out succeeded. Screenshots saved under `/tmp/browser/monthly/`.
- Initial UI attempt tried Withdraw while approved version was selected; selector timed out, no mutation. Corrected test selected the published archive entry explicitly. Another run reused a signed-out synthetic admin session and timed out; synthetic-only password/session renewal resolved this without email.
- Hosted catalog inspection: all 8 new tables ENABLE+FORCE RLS, anon SELECT/INSERT privileges false. No new client write policies.
- SHA256 comparison of protected baseline: all 55 `public/a/**` files, public headers/redirects/robots, existing portal pages, dashboard page and auto-generated previewAuthStorage unchanged. App changed only by additive lazy monthly routes/imports; all previous route declarations identical. Both `/reports/caseyville-il` and `/local-seo-dashboard` rendered in browser; existing `/portal` rendered.
- New `src/monthly` source: no external audit reader import/key, service credential, or console data log. New client module is lazy-loaded. Legacy App still statically imports the existing portal reader; thus the entire site's shared initial bundle can still contain the pre-existing external publishable key. Full shared-bundle removal is BLOCKED by the requirement not to refactor legacy routes; no claim of whole-site key removal is made.
- Vitest: 4 concrete reporting cutoff tests + 1 existing test PASS. Preview compilation latest signal: build OK.

## Not run / limitations

- Real email delivery and live magic-link / six-digit OTP exchange: NOT RUN, sending flag OFF; hosted OTP length/template and Netlify callback allow-list need separate approval/configuration.
- Direct storage denial returns masked HTTP 400, not the requested literal 403. Anonymous file edge 401 and cross-tenant file edge 403 verified. Existing valid signed URLs are bearer capabilities until their 60-second expiry; revocation prevents new issuance immediately, not already-issued URLs.
- No real client account/report/grant, Bill account, invitation, external client message or Aubrey backend mutation.
- Netlify custom-domain deployment linkage remains UNVERIFIED.

## Nov 10 2026 - monthly-admin build (base commit 67c8e832b9cde8a995152f722d342bae2a560a03)
Live results this run: monthly-admin no-auth 401, anon-bearer 401; get-report-file 401/401;
monthly-auth GET enabled:false; client-address POST generic, no send; anon SELECT on all 8 monthly tables 401. All PASS.
NOT RUN: every staff/editor/client path (no approved synthetic session minting available; local fixture passwords not read).

## Nov 10 2026 (2) - atomic audit + concurrency fixes (baseline eece788)
- DB atomicity (local throwaway PGlite, real migration SQL 0000-0002, injected audit-insert failure): 6/6 PASS
  (non-admin denied; audit failure rolls back org/client/report/reservation/commit/provision intent; distinct
  versions + request-unique paths; idempotent retry; provision intent before auth call; audit append-only).
- monthly-admin orchestration (Deno, in-memory fakes): 12/12 PASS (upload/readback/commit/fail-audit
  injection, only self-created objects removed, pre-existing objects never deleted, same-request retry,
  8 parallel requests distinct versions/disjoint objects, provisioning recovery states).
- Live anon: all 10 monthly tables 401; admin RPCs 404/401; monthly-admin no-auth 401. PASS.
- Live parallel row-lock test against hosted DB: NOT RUN (needs staff session).
- All authenticated runtime tests: NOT RUN (awaiting human approval of synthetic admin session).
