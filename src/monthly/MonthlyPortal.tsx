import { useEffect, useState } from "react";
import { monthlyClient } from "./client";
import { hasStaffSession } from "./staff-auth";
import MonthlyOwnerPortal from "./MonthlyOwnerPortal";
import MonthlyStaffPortal from "./MonthlyStaffPortal";
import MonthlyStaffSignIn from "./MonthlyStaffSignIn";
export default function MonthlyPortal() {
  const [staff, setStaff] = useState(false);
  const staffEntry =
    new URLSearchParams(window.location.search).get("staff") === "1";
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const allowed = await hasStaffSession();
        if (mounted) setStaff(allowed);
      } catch {
        if (mounted) setStaff(false);
      }
    };
    void check();
    const {
      data: { subscription },
    } = monthlyClient.auth.onAuthStateChange(() =>
      setTimeout(() => void check(), 0),
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  if (staff) return <MonthlyStaffPortal />;
  return staffEntry ? (
    <MonthlyStaffSignIn onSignedIn={() => setStaff(true)} />
  ) : (
    <MonthlyOwnerPortal />
  );
}
