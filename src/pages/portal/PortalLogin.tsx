import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PortalLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/portal/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal/dashboard` },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Magic link sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A1628" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F97316" }}>
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">BluePipe Digital</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PuroClean SEO Portal</h1>
          <p className="text-white/60 text-sm">Secure access to your monthly SEO reports</p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
          {sent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F97316" }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-white font-semibold mb-2">Check your email</h2>
              <p className="text-white/60 text-sm">We sent a magic link to <span className="text-white">{email}</span></p>
              <button onClick={() => { setSent(false); setEmail(""); }} className="mt-6 text-sm text-white/70 hover:text-white underline">Use a different email</button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@franchise.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "#F97316" }}
              >
                {sending ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Trouble logging in? Contact your BluePipe account manager.
        </p>
      </div>
    </div>
  );
};

export default PortalLogin;
