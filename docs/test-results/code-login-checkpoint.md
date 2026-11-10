# Code login checkpoint

Mode: synthetic only; real access and client sending remain OFF.

## API contracts
- Browser: `POST /portal/api/owner` with same-origin `Origin` and `X-BluePipe-Request: 1`.
- `login {code}` returns `{ok:true}` and an HttpOnly cookie; `archive {}` returns authorized locations and published reports; `file {version_id, format}` returns a 60-second URL plus SHA256; `logout {}` revokes the live session.
- The browser never receives the opaque session in JSON. The Netlify broker has no secret.
- Code format for future verifier manifest: `<32 lowercase hex selector>.<64 lowercase hex secret>`. Verifier: PBKDF2-HMAC-SHA256, 600000 iterations, 16-byte hex salt, 32-byte hex result. Plaintext codes must never enter this project.

## Results
- Local disposable database unit simulation: 32 PASS / 0 FAIL.
- Cookie broker unit: 5 PASS / 0 FAIL.
- Existing staging orchestration: 12 PASS / 0 FAIL.
- Hosted synthetic runtime: 24 PASS / 0 FAIL / 3 BLOCKED. Ledger: `code-hosted-checkpoint.json`.

## Limits
Source-IP precision is not used for authorization; forged forwarding headers are ignored. Durable per-code lockout and global request/KDF budgets also protect direct backend calls, but a global flood can temporarily deny service.

## Independent-review correction

The original 432-cell result is archive **membership**, not 432 file requests. Original HTML/PDF checks recorded downloaded hashes without asserting independent fixture expected hashes; those checks are not frozen-byte verification proof. The historical ledger now marks this limitation explicitly. Superseding correction evidence: `code-correction-hosted.json`; API/staff/security limits: `code-correction-api.md`. Original result totals above are historical, not current corrected-suite totals.
