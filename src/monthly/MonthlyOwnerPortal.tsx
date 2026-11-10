import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowDownToLine,
  FileText,
  LockKeyhole,
  LogOut,
  Building2,
} from "lucide-react";
import logo from "@/assets/bluepipe-logo.png";
import { ownerRequest } from "./owner-api";
import { calendarDate, latestFirst, verifyFrozenBytes } from "./owner-rules";
import "./monthly.css";
type Location = { id: string; display_name: string; package: string | null };
type Report = {
  id: string;
  client_id: string;
  version: number;
  period_label: string;
  period_start: string;
  period_end: string;
  dataset_sha256: string;
};
export default function MonthlyOwnerPortal() {
  const [code, setCode] = useState(""),
    [clients, setClients] = useState<Location[]>([]),
    [reports, setReports] = useState<Report[]>([]),
    [location, setLocation] = useState(""),
    [selected, setSelected] = useState(""),
    [signed, setSigned] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState("");
  const load = async () => {
    const d = await ownerRequest({ action: "archive" });
    setClients(d.clients);
    setReports(d.reports);
    setLocation((old) =>
      d.clients.some((c: Location) => c.id === old)
        ? old
        : (d.clients[0]?.id ?? ""),
    );
    setSigned(true);
  };
  useEffect(() => {
    void load().catch(() => setSigned(false));
  }, []);
  const archive = latestFirst(reports.filter((r) => r.client_id === location)),
    current = archive.find((r) => r.id === selected) ?? archive[0],
    client = clients.find((c) => c.id === location);
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await ownerRequest({ action: "login", code });
      setCode("");
      await load();
    } catch {
      setCode("");
      setMessage("Access unavailable. Contact your BluePipe account team.");
    } finally {
      setBusy(false);
    }
  };
  const file = async (format: "html" | "pdf") => {
    if (!current) return;
    setBusy(true);
    setMessage("");
    try {
      const d = await ownerRequest({
        action: "file",
        version_id: current.id,
        format,
      });
      if (typeof d.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(d.sha256))
        throw new Error("Missing frozen hash");
      const r = await fetch(d.url, {
        referrerPolicy: "no-referrer",
        cache: "no-store",
      });
      if (!r.ok) throw Error();
      const bytes = await r.arrayBuffer();
      await verifyFrozenBytes(bytes, d.sha256);
      if (format === "html") setPreview(new TextDecoder().decode(bytes));
      else {
        const u = URL.createObjectURL(
          new Blob([bytes], { type: "application/pdf" }),
        );
        const a = document.createElement("a");
        a.href = u;
        a.download = "BluePipe-Monthly-Report.pdf";
        a.click();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
      }
    } catch {
      setMessage("Report unavailable. Please try again.");
      setPreview("");
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    setBusy(true);
    try {
      await ownerRequest({ action: "logout" });
      setSigned(false);
      setClients([]);
      setReports([]);
      setPreview("");
    } catch {
      setMessage("Sign out could not be confirmed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="monthly-portal">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center gap-4">
          <img src={logo} alt="BluePipe Digital" className="w-40 sm:w-48" />
          {signed && (
            <Button
              size="icon"
              variant="secondary"
              aria-label="Sign out"
              title="Sign out"
              disabled={busy}
              onClick={() => void logout()}
            >
              <LogOut />
            </Button>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!signed ? (
          <div className="max-w-lg mx-auto py-12">
            <LockKeyhole className="text-primary mb-6" size={40} />
            <p className="text-primary text-sm mb-3">
              PRIVATE CLIENT REPORTING
            </p>
            <h1 className="text-4xl mb-4">PuroClean monthly reports</h1>
            <p className="text-muted-foreground mb-8">BluePipe Digital</p>
            <form onSubmit={login} className="space-y-4">
              <label htmlFor="owner-code" className="block text-sm">
                Owner access code
              </label>
              <input
                id="owner-code"
                type="password"
                autoComplete="off"
                spellCheck={false}
                maxLength={97}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full"
              />
              <Button
                size="lg"
                type="submit"
                disabled={busy || !code}
                className="w-full"
              >
                Sign in
                <ArrowRight />
              </Button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10">
              <h1 className="text-3xl">
                {client?.display_name ?? "Your locations"}
              </h1>
              <div>
                <label
                  htmlFor="owner-location"
                  className="block text-sm text-muted-foreground mb-2"
                >
                  Location
                </label>
                <select
                  id="owner-location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setSelected("");
                    setPreview("");
                  }}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {client?.package && (
              <p className="text-muted-foreground mb-6">{client.package}</p>
            )}
            <div className="grid lg:grid-cols-[240px_1fr] gap-8">
              <aside>
                <p className="flex gap-2 text-muted-foreground text-sm mb-4">
                  <Building2 size={18} />
                  REPORT ARCHIVE
                </p>
                {archive.map((r) => (
                  <Button
                    key={r.id}
                    variant={r.id === current?.id ? "default" : "secondary"}
                    className="w-full h-auto py-3 mb-2 justify-start whitespace-normal text-left"
                    onClick={() => {
                      setSelected(r.id);
                      setPreview("");
                    }}
                  >
                    <FileText />
                    {r.period_label} · v{r.version}
                  </Button>
                ))}
              </aside>
              <section className="min-w-0">
                {current ? (
                  <>
                    <div className="flex flex-wrap justify-between gap-5 mb-6">
                      <div>
                        <h2 className="text-2xl">
                          {current.period_label} · v{current.version}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                          {calendarDate(current.period_start)} –{" "}
                          {calendarDate(current.period_end)} · America/Chicago
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                    {preview && (
                      <iframe
                        title="Monthly report"
                        sandbox=""
                        referrerPolicy="no-referrer"
                        srcDoc={preview}
                        className="report-preview"
                      />
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    No published reports yet.
                  </p>
                )}
              </section>
            </div>
          </>
        )}
        <p role="status" className="mt-5 text-sm">
          {message}
        </p>
      </main>
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-border text-xs text-muted-foreground">
        Powered by BluePipe Digital
      </footer>
    </div>
  );
}
