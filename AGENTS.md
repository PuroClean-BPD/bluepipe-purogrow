# Architecture rules

- Keep monthly portal code in `src/monthly` with lazy additive routes and a dedicated PKCE auth storage key; this prevents loading the legacy external audit reader into the new portal.
- Monthly JWT report authorization is staff-only through separate `monthly_staff`; historical memberships never authorize owners; code owners use separate credential scopes and live digest-only sessions, never Auth identities or browser claims, to isolate authority.
- Keep all monthly database changes additive and retain data in down migrations; legacy production auth, public audits and existing reports must survive rollback.
- Provision fixtures only through the local privileged test harness using reserved addresses and real Auth sessions; never expose a fixture endpoint, embed credentials, send email, or bypass browser authorization.
- Only the server-gated monthly auth endpoint may send new monthly login emails; its database flag fails closed and existing auth semantics stay unchanged.
- Monthly staging, owner provisioning, grants and transitions go only through admin-only `monthly-admin`; every DB mutation runs inside an admin-checked RPC that writes its audit row in the same transaction, staging uses a fenced per-request lease bound to a payload fingerprint and never deletes storage (orphans are audited); keeps writes audited and retries safe.
- Code login uses a secret-free Netlify cookie broker and independently secured Cloud RPCs; durable global/credential limits precede PBKDF2, and every owner request revalidates generation, expiry, scope and published state with fail-closed auditing.
- Initial code-login commits require both deployment-skip markers; only a separately authorized Netlify deploy may expose the cookie broker.
- Classify staff as synthetic by default in a protected staff column; only separately authorized human bootstrap may mark real staff, so synthetic admins cannot import real reports or stage real verifier scopes.
- Bound streamed JSON reads and whitelist broker outputs; release only successful login reservations, require frozen raw-file hashes before signing/rendering, and preserve calendar date boundaries independently of viewer timezone.

- Staff password entry uses the isolated monthly client and server staff-role readback; it never signs up or emails users, and transition guards preserve approver approval while real imports remain genuine-admin-only.
