import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signInStaff } from "./staff-auth";
import "./monthly.css";
export default function MonthlyStaffSignIn({
  onSignedIn,
}: {
  onSignedIn: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supplied = password;
    setPassword("");
    try {
      if (await signInStaff(email, supplied)) onSignedIn();
      else setMessage("Staff access unavailable.");
    } catch {
      setMessage("Staff access unavailable.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  };
  return (
    <main className="monthly-portal min-h-screen px-6 py-16">
      <form onSubmit={submit} className="max-w-md mx-auto space-y-5">
        <h1 className="text-3xl">BluePipe staff sign-in</h1>
        <label htmlFor="staff-email" className="block">
          Email address
        </label>
        <input
          id="staff-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        <label htmlFor="staff-password" className="block">
          Password
        </label>
        <input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />
        <Button type="submit" disabled={busy} className="w-full">
          Sign in
        </Button>
        <p role="status">{message}</p>
      </form>
    </main>
  );
}
