# Monthly portal

- [x] Verify requested code rollback commit and inspect existing auth/policies/hosting without mutation.
- [x] Record non-destructive rollback and integration constraints.
- [x] Establish local admin-only email-free synthetic fixture provisioning using managed sandbox credentials.
- [x] Add isolated schema, FORCE RLS, state/grant audit RPCs and non-destructive down migration.
- [x] Add private report storage and authorized short-lived file issuance.
- [x] Add `/portal/monthly` and `/portal/callback` without modifying legacy portal flows.
- [x] Freeze synthetic data and matching HTML/PDF hashes; implement client archive and staff actions.
- [x] Run real backend security tests and authenticated UI flow; record actual passes, initial failures and limitations.
- [ ] Frontend deploy withheld: strict shared-bundle external-key exclusion unresolved without legacy-route refactor; hosted OTP/PKCE exchange unverified with emails prohibited; Netlify linkage unknown.