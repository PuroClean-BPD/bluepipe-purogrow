import { test, expect } from 'bun:test';
import { disableFixture, FIXTURE_USERS, type CleanupDeps } from '../../supabase/functions/monthly-admin/cleanup';
function mock(auditFails = false, email = 'bluepipe-monthly-' + 'a'.repeat(32) + '-admin@example.invalid') {
  let writes = 0;
  const d: CleanupDeps = {
    rpc: async () => ({ data: auditFails ? null : 'receipt', error: auditFails ? 'failure' : null }),
    getUser: async id => ({ id, email, banned_until: writes ? '2126-01-01T00:00:00Z' : undefined }),
    banUser: async () => { writes++; return true; },
  };
  return { d, writes: () => writes };
}
test('Bill is never an Auth cleanup target', async () => {
  const m = mock();
  expect((await disableFixture(m.d, '47954f6b-ccc8-47f9-a93b-e16935a9e326')).status).toBe(403);
  expect(m.writes()).toBe(0);
});
test('real identity rejected even at an allowed fixture UUID', async () => {
  const m = mock(false, 'real@example.com');
  expect((await disableFixture(m.d, FIXTURE_USERS[0])).status).toBe(403);
  expect(m.writes()).toBe(0);
});
test('audit failure prevents external Auth mutation', async () => {
  const m = mock(true);
  expect((await disableFixture(m.d, FIXTURE_USERS[0])).status).toBe(503);
  expect(m.writes()).toBe(0);
});
test('successful ban requires readback and outcome audit', async () => {
  const m = mock();
  expect((await disableFixture(m.d, FIXTURE_USERS[0])).body.disabled).toBe(true);
  expect(m.writes()).toBe(1);
});