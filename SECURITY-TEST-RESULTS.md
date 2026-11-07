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
