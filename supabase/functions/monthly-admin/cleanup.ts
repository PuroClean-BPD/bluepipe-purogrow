// Auth writes happen only after a caller-authorized durable intent receipt.
export interface CleanupDeps {
  rpc(name: string, args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  getUser(id: string): Promise<{ id: string; email?: string; banned_until?: string } | null>;
  banUser(id: string): Promise<boolean>;
}
export const FIXTURE_USERS = [
  '2745fb7f-8604-4d02-8645-437e4cd635c1',
  '716ae187-2086-4b5d-9a87-064fe42dbcdb',
  '76a43a8c-0fc9-4a59-9bfc-7b7b7efb89d5',
  '8a44551b-923c-436c-b0a7-212b8fa2c2f3',
  'c753e482-67d3-4bc9-ab13-0e1294da1f8a',
  'e450b9cb-50c6-477d-adce-53a6d7b04a3d',
];
export async function disableFixture(d: CleanupDeps, id: string) {
  if (!FIXTURE_USERS.includes(id)) return { status: 403, body: { error: 'Reserved fixture required' } };
  const u = await d.getUser(id);
  if (!u || u.id !== id || !/^bluepipe-monthly-[0-9a-f]{32}-[a-z0-9-]+@example\.invalid$/.test(u.email ?? ''))
    return { status: 403, body: { error: 'Reserved fixture required' } };
  const intent = await d.rpc('monthly_cleanup_auth_begin', { p_user: id });
  if (intent.error || typeof intent.data !== 'string') return { status: 503, body: { error: 'Audit unavailable' } };
  const written = await d.banUser(id);
  const back = await d.getUser(id);
  const disabled = written && !!back?.banned_until && Date.parse(back.banned_until) > Date.now();
  const receipt = await d.rpc('monthly_cleanup_auth_finish', { p_intent: intent.data, p_disabled: disabled });
  if (receipt.error || !receipt.data) return { status: 503, body: { error: 'Recovery required', intent_id: intent.data } };
  return { status: disabled ? 200 : 503, body: { user_id: id, disabled, intent_id: intent.data, outcome_id: receipt.data } };
}