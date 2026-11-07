# Architecture rules

- Keep monthly portal code in `src/monthly` with lazy additive routes and a dedicated PKCE auth storage key; this prevents loading the legacy external audit reader into the new portal.
- Monthly authorization derives exclusively from active `monthly_memberships` and separate `monthly_staff`, never legacy profile slugs or browser claims; this isolates existing clients and prevents tenant escalation.
- Keep all monthly database changes additive and retain data in down migrations; legacy production auth, public audits and existing reports must survive rollback.
- Provision fixtures only through the local privileged test harness using reserved addresses and real Auth sessions; never expose a fixture endpoint, embed credentials, send email, or bypass browser authorization.
- Only the server-gated monthly auth endpoint may send new monthly login emails; its database flag fails closed and existing auth semantics stay unchanged.
