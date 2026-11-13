import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  ArrowRight,
  Building2,
  Check,
  FileText,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { monthlyClient } from "./client";
import { hasStaffSession } from "./staff-auth";
import logo from "@/assets/bluepipe-logo.png";
import "./monthly.css";
import { latestFirst } from "./owner-rules";
import { OWNER_GROUPS, ownerPeriodLabel } from "./staff-owner-groups";
type Client = {
  id: string;
  display_name: string;
  slug: string;
  package: string | null;
};
type Version = {
  id: string;
  report_id: string;
  version: number;
  state: string;
  dataset_sha256: string;
  dataset: {
    synthetic?: boolean;
    metrics?: Record<string, number | null>;
    authority?: { label: string; value: number }[];
  };
};
type Report = {
  id: string;
  client_id: string;
  period_label: string;
  period_start: string;
  period_end: string;
};
export default function MonthlyPortal() {
  const [ready, setReady] = useState(false),
    [signed, setSigned] = useState(false),
    [role, setRole] = useState<string | null>(null),
    [clients, setClients] = useState<Client[]>([]),
    [location, setLocation] = useState(""),
    [reports, setReports] = useState<Report[]>([]),
    [versions, setVersions] = useState<Version[]>([]),
    [selected, setSelected] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState<string | null>(null),
    [ownerMode, setOwnerMode] = useState(false),
    [owner, setOwner] = useState(OWNER_GROUPS[0].name);
  const load = async () => {
    const {
      data: { user },
    } = await monthlyClient.auth.getUser();
    const allowed = await hasStaffSession();
    setSigned(allowed);
    if (!allowed) {
      setClients([]);
      setReports([]);
      setVersions([]);
      setRole(null);
      setPreview(null);
      setReady(true);
      return;
    }
    if (user) {
      const [{ data: c }, { data: s }, { data: r }, { data: v }] =
        await Promise.all([
          monthlyClient.from("monthly_clients").select("*"),
          monthlyClient
            .from("monthly_staff")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle(),
          monthlyClient
            .from("monthly_reports")
            .select("*")
            .order("period_end", { ascending: false }),
          monthlyClient
            .from("monthly_report_versions")
            .select("*")
            .order("version", { ascending: false }),
        ]);
      setClients(c ?? []);
      setRole(s?.role ?? null);
      setReports(r ?? []);
      setVersions(v ?? []);
      setLocation((old) => old || c?.[0]?.id || "");
    }
    setReady(true);
  };
  useEffect(() => {
    const {
      data: { subscription },
    } = monthlyClient.auth.onAuthStateChange(() => {
      setTimeout(() => void load(), 0);
    });
    void load();
    return () => subscription.unsubscribe();
  }, []);
  const ownerSlugs =
    OWNER_GROUPS.find((g) => g.name === owner)?.slugs ?? [];
  const shownClients = ownerMode
    ? clients.filter((c) => ownerSlugs.includes(c.slug))
    : clients;
  if (ownerMode && !shownClients.some((c) => c.id === location) && shownClients[0])
    setTimeout(() => setLocation(shownClients[0].id), 0);
  const archive = reports.filter((r) => r.client_id === location);
  const staffVisible = versions.filter((v) =>
    archive.some((r) => r.id === v.report_id),
  );
  const visible = ownerMode
    ? latestFirst(
        staffVisible
          .filter((v) => ["draft", "approved", "published"].includes(v.state))
          .map((v) => {
            const r = archive.find((x) => x.id === v.report_id)!;
            return { ...v, period_start: r.period_start, period_end: r.period_end };
          }),
      )
    : staffVisible;
  const current = visible.find((v) => v.id === selected) ?? visible[0];
  const report = reports.find((r) => r.id === current?.report_id);
  const client = clients.find((c) => c.id === location);
  const act = async (next: string) => {
    if (!current || ownerMode) return;
    setBusy(true);
    const { error } = await monthlyClient.rpc("monthly_transition", {
      vid: current.id,
      next_state: next,
    });
    setMessage(error ? "Action not permitted." : "Report status updated.");
    await load();
    setBusy(false);
  };
  const file = async (format: "html" | "pdf") => {
    if (!current) return;
    setBusy(true);
    const { data, error } = await monthlyClient.functions.invoke(
      "get-report-file",
      { body: { version_id: current.id, format } },
    );
    if (error || !data?.url) {
      setMessage("Report unavailable or access changed.");
      setBusy(false);
      return;
    }
    const response = await fetch(data.url);
    if (!response.ok) {
      setMessage("Report link expired. Try again.");
      setBusy(false);
      return;
    }
    if (format === "html") {
      const content = await response.text();
      setPreview(content);
    } else {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BluePipe-Monthly-Report.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    setBusy(false);
  };
  return (
    <div className="monthly-portal">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <img
            src={logo}
            alt="BluePipe Digital"
            className="w-40 sm:w-48 h-auto"
          />
          <div className="flex gap-3 items-center">
            <span className="text-muted-foreground text-sm hidden sm:inline">
              Monthly client portal
            </span>
            {signed && (
              <Button
                variant="secondary"
                size="icon"
                title="Sign out"
                aria-label="Sign out"
                onClick={async () => {
                  await monthlyClient.auth.signOut();
                  setClients([]);
                  setVersions([]);
                  setReports([]);
                  setPreview(null);
                }}
              >
                <LogOut />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10 sm:py-14">
        {!ready ? (
          <p>Loading secure portal…</p>
        ) : !signed ? (
          <p>Staff access unavailable.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3 mb-6">
              {ownerMode ? (
                <Button variant="secondary" onClick={() => { setOwnerMode(false); setSelected(""); setPreview(null); }}>
                  Exit preview
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => { setOwnerMode(true); setSelected(""); setPreview(null); setMessage(""); }}>
                  Preview as owner
                </Button>
              )}
              <select
                aria-label="Owner"
                value={owner}
                onChange={(e) => { setOwner(e.target.value); setSelected(""); setPreview(null); }}
              >
                {OWNER_GROUPS.map((g) => (
                  <option key={g.name} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
            {ownerMode && (
              <p className="monthly-warning text-sm mb-6 font-semibold" role="status">
                Staff preview — owners cannot see this until you Publish
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div>
                {!ownerMode && (
                  <p className="text-primary text-sm font-semibold mb-3">
                    VISIBILITY REPORTING {role && `· ${role.toUpperCase()}`}
                  </p>
                )}
                <h1 className="text-3xl sm:text-4xl">
                  {client?.display_name ?? "Your locations"}
                </h1>
                {client?.package && (
                  <p className="text-muted-foreground mt-3">{client.package}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm text-muted-foreground mb-2"
                >
                  Location
                </label>
                <select
                  id="location"
                  aria-label="Location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setSelected("");
                    setPreview(null);
                  }}
                >
                  {shownClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {shownClients.length === 0 ? (
              <div className="border-t border-border py-12">
                <h2 className="text-2xl mb-3">No locations assigned</h2>
                <p className="text-muted-foreground">
                  Access is granted individually by your BluePipe account team.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[240px_1fr] gap-8">
                <aside>
                  <div className="flex gap-2 text-muted-foreground mb-4">
                    <Building2 size={18} />
                    <span className="text-sm">REPORT ARCHIVE</span>
                  </div>
                  <div className="space-y-2">
                    {visible.map((v) => (
                      <Button
                        key={v.id}
                        variant={current?.id === v.id ? "default" : "secondary"}
                        className="w-full h-auto py-3 justify-start whitespace-normal text-left"
                        onClick={() => {
                          setSelected(v.id);
                          setPreview(null);
                        }}
                      >
                        <FileText />
                        {ownerMode ? (
                          <span>
                            {(() => {
                              const r = reports.find((x) => x.id === v.report_id);
                              return r ? ownerPeriodLabel(r.period_start, r.period_end, v.version) : null;
                            })()}
                            {v.state !== "published" && (
                              <span className="block text-xs opacity-75">{v.state}</span>
                            )}
                          </span>
                        ) : (
                        <span>
                          {
                            reports.find((r) => r.id === v.report_id)
                              ?.period_label
                          }
                          <span className="block text-xs opacity-75">
                            Version {v.version} · {v.state}
                          </span>
                        </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </aside>
                <section className="min-w-0">
                  {!current ? (
                    <p className="text-muted-foreground">
                      No published reports yet.
                    </p>
                  ) : (
                    <>
                      {current.dataset.synthetic && (
                        <p className="monthly-warning text-sm mb-4">
                          SYNTHETIC FIXTURE · Not a client report
                        </p>
                      )}
                      <div className="flex flex-wrap justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl">{report?.period_label}</h2>
                          <p className="text-muted-foreground text-sm mt-2">
                            Oct 5–Nov 5, 2026 inclusive · America/Chicago
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Cutoff: Nov 5, 23:59:59 CST · Nov 6+ excluded
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            disabled={busy}
                            onClick={() => void file("html")}
                          >
                            <FileText />
                            Open report
                          </Button>
                          <Button
                            disabled={busy}
                            onClick={() => void file("pdf")}
                          >
                            <ArrowDownToLine />
                            PDF
                          </Button>
                        </div>
                      </div>
                      {!ownerMode && (<>
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                        {Object.entries(current.dataset.metrics ?? {}).map(
                          ([label, value]) => (
                            <article className="metric-card" key={label}>
                              <p className="text-muted-foreground text-sm mb-4">
                                {label}
                              </p>
                              <strong
                                className={`text-3xl ${value === null ? "monthly-warning" : ""}`}
                              >
                                {value === null
                                  ? "Not available"
                                  : value.toLocaleString()}
                              </strong>
                            </article>
                          ),
                        )}
                      </div>
                      <h3 className="mb-5">Authority Signal Distribution</h3>
                      <div className="space-y-4 mb-8">
                        {(current.dataset.authority ?? []).map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-2">
                              <span>{item.label}</span>
                              <span className="text-muted-foreground">
                                {item.value}%
                              </span>
                            </div>
                            <progress
                              className="w-full h-2 accent-primary"
                              max={100}
                              value={item.value}
                            />
                          </div>
                        ))}
                      </div>
                      </>)}
                      {role && !ownerMode && (
                        <div className="border-t border-border pt-5 flex flex-wrap gap-3">
                          <span className="text-muted-foreground self-center text-sm">
                            {current.state} · v{current.version}
                          </span>
                          {current.state === "draft" &&
                            ["admin", "approver"].includes(role) && (
                              <Button
                                disabled={busy}
                                onClick={() => void act("approved")}
                              >
                                <Check />
                                Approve
                              </Button>
                            )}
                          {current.state === "approved" && role === "admin" && (
                            <Button
                              disabled={busy}
                              onClick={() => void act("published")}
                            >
                              <ShieldCheck />
                              Publish
                            </Button>
                          )}
                          {current.state === "published" &&
                            role === "admin" && (
                              <Button
                                variant="destructive"
                                disabled={busy}
                                onClick={() => void act("withdrawn")}
                              >
                                <X />
                                Withdraw
                              </Button>
                            )}
                        </div>
                      )}
                      <p className="text-sm mt-4" role="status">
                        {message}
                      </p>
                      {preview && (
                        <iframe
                          title="Monthly report"
                          sandbox=""
                          referrerPolicy="no-referrer"
                          className="report-preview mt-6"
                          srcDoc={preview}
                        />
                      )}
                      {!ownerMode && (
                        <p className="text-xs text-muted-foreground mt-6 break-all">
                          Frozen dataset · SHA256 {current.dataset_sha256}
                        </p>
                      )}
                    </>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>
      <footer className="max-w-7xl mx-auto px-6 py-8 text-muted-foreground text-xs border-t border-border">
        Powered by BluePipe Digital
      </footer>
    </div>
  );
}
