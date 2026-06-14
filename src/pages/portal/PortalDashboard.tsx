import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase, AuditRun } from "@/integrations/external-supabase/client";
import { toast } from "sonner";
import ReportView from "./ReportView";
import "./portal-print.css";

const PortalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [clientSlug, setClientSlug] = useState<string | null>(null);
  const [reports, setReports] = useState<AuditRun[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        navigate("/portal", { replace: true });
        return;
      }
      setEmail(session.user.email ?? "");

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("client_slug")
        .eq("id", session.user.id)
        .maybeSingle();

      if (pErr) {
        setError(pErr.message);
        setLoading(false);
        return;
      }

      const slug = profile?.client_slug ?? null;
      setClientSlug(slug);

      if (!slug) {
        setLoading(false);
        return;
      }

      const { data: runs, error: rErr } = await externalSupabase
        .from("audit_runs")
        .select("*")
        .eq("client_slug", slug)
        .order("processed_at", { ascending: false, nullsFirst: false });

      if (!active) return;
      if (rErr) {
        setError(rErr.message);
      } else if (runs) {
        setReports(runs as AuditRun[]);
        if (runs.length > 0) setSelectedId((runs[0] as AuditRun).id);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  const selectedReport = useMemo(
    () => reports.find((r) => r.id === selectedId) ?? null,
    [reports, selectedId]
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/portal", { replace: true });
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatSlug = (slug: string) =>
    slug
      .split("-")
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");

  const displayName = (r: typeof selectedReport) =>
    r?.leadsnap?.gbp?.name ?? (clientSlug ? formatSlug(clientSlug) : "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
        <div className="text-white/60">Loading your portal…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      {/* Header */}
      <header className="portal-no-print border-b border-white/10 sticky top-0 z-10 backdrop-blur" style={{ backgroundColor: "rgba(10,22,40,0.85)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F97316" }}>
              <span className="text-white font-bold">B</span>
            </div>
            <div>
              <div className="text-white font-bold leading-tight">BluePipe Digital</div>
              <div className="text-white/50 text-xs">PuroClean SEO Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm hidden sm:inline">{email}</span>
            <button onClick={handleSignOut} className="text-sm px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/5">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="rounded-xl p-4 mb-6 border border-red-500/30 bg-red-500/10 text-red-200">{error}</div>
        )}

        {!clientSlug && (
          <div className="rounded-2xl p-8 border border-white/10 bg-white/[0.03] text-center">
            <h2 className="text-white text-xl font-semibold mb-2">Account pending setup</h2>
            <p className="text-white/60">
              Your account isn't linked to a client yet. Please contact your BluePipe account manager so we can finish your portal setup.
            </p>
          </div>
        )}

        {clientSlug && reports.length === 0 && (
          <div className="rounded-2xl p-8 border border-white/10 bg-white/[0.03] text-center">
            <h2 className="text-white text-xl font-semibold mb-2">No reports yet</h2>
            <p className="text-white/60">Your first monthly SEO report will appear here as soon as it's processed.</p>
          </div>
        )}

        {clientSlug && selectedReport && (
          <>
            {/* Title bar */}
            <div className="portal-no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedReport.leadsnap?.gbp?.name ?? clientSlug}
                </h1>
                <p className="text-white/60 mt-1">
                  Monthly SEO Report · {formatDate(selectedReport.processed_at ?? selectedReport.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#0A1628]">
                      {formatDate(r.processed_at ?? r.created_at)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: "#F97316" }}
                >
                  Download PDF
                </button>
              </div>
            </div>

            <ReportView report={selectedReport} businessName={selectedReport.leadsnap?.gbp?.name ?? clientSlug} reportDate={formatDate(selectedReport.processed_at ?? selectedReport.created_at)} />
          </>
        )}
      </main>
    </div>
  );
};

export default PortalDashboard;
