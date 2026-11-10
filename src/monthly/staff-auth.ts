import { monthlyClient } from "./client";
export async function hasStaffSession(): Promise<boolean> {
  const { data, error } = await monthlyClient.auth.getUser();
  if (error || !data.user) return false;
  const role = await monthlyClient.rpc("monthly_staff_role");
  return (
    !role.error && ["admin", "approver", "editor"].includes(role.data ?? "")
  );
}
export async function signInStaff(
  email: string,
  password: string,
): Promise<boolean> {
  const { error } = await monthlyClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return false;
  if (await hasStaffSession()) return true;
  await monthlyClient.auth.signOut();
  return false;
}
