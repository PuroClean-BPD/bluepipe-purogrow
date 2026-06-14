import { AuditRun } from "@/integrations/external-supabase/client";

interface Props {
  report: AuditRun;
  businessName: string;
  reportDate: string;
}

// Render simple **bold** markdown to JSX while preserving line breaks.
const renderMarkdown = (text: string) => {
  const lines = text.split(/\n/);
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-white/85 leading-relaxed mb-3 last:mb-0">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`portal-card rounded-2xl border border-white/10 bg-white/[0.03] p-6 ${className}`}>{children}</div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
    <span className="w-1 h-6 rounded-full" style={{ backgroundColor: "#F97316" }} />
    {children}
  </h2>
);

type Severity = "ok" | "warn" | "crit";
const severityStyle: Record<Severity, { bg: string; text: string; border: string }> = {
  ok:   { bg: "rgba(34,197,94,0.10)",  text: "#86efac", border: "rgba(34,197,94,0.30)" },
  warn: { bg: "rgba(234,179,8,0.10)",   text: "#fde68a", border: "rgba(234,179,8,0.30)" },
  crit: { bg: "rgba(239,68,68,0.10)",   text: "#fca5a5", border: "rgba(239,68,68,0.35)" },
};

const MetricCard = ({ label, value, severity = "ok" }: { label: string; value: number | string; severity?: Severity }) => {
  const s = severityStyle[severity];
  return (
    <div className="portal-card rounded-xl p-4 border" style={{ backgroundColor: s.bg, borderColor: s.border }}>
      <div className="text-xs uppercase tracking-wide text-white/60 mb-2">{label}</div>
      <div className="text-2xl font-bold" style={{ color: s.text }}>{value}</div>
    </div>
  );
};

const Gauge = ({ label, value }: { label: string; value: number | undefined }) => {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, Math.round(value))) : null;
  const color = v === null ? "#6b7280" : v >= 90 ? "#22c55e" : v >= 50 ? "#eab308" : "#ef4444";
  const circumference = 2 * Math.PI * 42;
  const dash = v === null ? 0 : (v / 100) * circumference;
  return (
    <div className="portal-card rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`} transform="rotate(-90 50 50)"
        />
        <text x="50" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="#ffffff">{v ?? "—"}</text>
      </svg>
      <div className="mt-3 text-white font-semibold">{label}</div>
    </div>
  );
};

const cwvSeverity = (metric: string, val: number | undefined): Severity => {
  if (typeof val !== "number") return "ok";
  switch (metric) {
    case "FCP": return val <= 1800 ? "ok" : val <= 3000 ? "warn" : "crit";
    case "LCP": return val <= 2500 ? "ok" : val <= 4000 ? "warn" : "crit";
    case "TBT": return val <= 200 ? "ok" : val <= 600 ? "warn" : "crit";
    case "CLS": return val <= 0.1 ? "ok" : val <= 0.25 ? "warn" : "crit";
    default: return "ok";
  }
};

const formatCwv = (metric: string, val: number | undefined): string => {
  if (typeof val !== "number") return "—";
  if (metric === "CLS") return val.toFixed(2);
  if (val >= 1000) return `${(val / 1000).toFixed(2)} s`;
  return `${Math.round(val)} ms`;
};

const StarRow = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg key={i} className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? "#F97316" : "rgba(255,255,255,0.2)"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
};

const ReportView = ({ report, businessName, reportDate }: Props) => {
  const sf = report.screaming_frog?.summary ?? {};
  const ps = report.pagespeed ?? {};
  const gbp = report.leadsnap?.gbp;
  const grid = report.leadsnap?.grid;
  const dm = report.domain_metrics;
  const keywords = report.top_keywords ?? [];

  const techMetrics: Array<{ label: string; value: number; severity: Severity }> = [
    { label: "Broken Links",     value: sf.broken ?? 0,         severity: (sf.broken ?? 0) > 0 ? "crit" : "ok" },
    { label: "Redirects",        value: sf.redirects ?? 0,      severity: (sf.redirects ?? 0) > 5 ? "warn" : "ok" },
    { label: "Missing Titles",   value: sf.missingTitle ?? 0,   severity: (sf.missingTitle ?? 0) > 0 ? "crit" : "ok" },
    { label: "Long Titles",      value: sf.longTitle ?? 0,      severity: (sf.longTitle ?? 0) > 10 ? "warn" : "ok" },
    { label: "Duplicate Titles", value: sf.duplicateTitle ?? 0, severity: (sf.duplicateTitle ?? 0) > 0 ? "crit" : "ok" },
    { label: "Missing Meta",     value: sf.missingMeta ?? 0,    severity: (sf.missingMeta ?? 0) > 0 ? "crit" : "ok" },
    { label: "Missing H1",       value: sf.missingH1 ?? 0,      severity: (sf.missingH1 ?? 0) > 0 ? "crit" : "ok" },
    { label: "Non-Indexable",    value: sf.nonIndexable ?? 0,   severity: (sf.nonIndexable ?? 0) > 5 ? "warn" : "ok" },
    { label: "Thin Content",     value: sf.thinContent ?? 0,    severity: (sf.thinContent ?? 0) > 0 ? "warn" : "ok" },
  ];

  return (
    <div className="portal-print-root space-y-10">
      {/* Print header (only visible in print) */}
      <div className="hidden print:block mb-6">
        <div className="text-2xl font-bold">{businessName}</div>
        <div className="text-sm text-gray-600">Monthly SEO Report — {reportDate}</div>
      </div>

      {/* A: Executive Summary */}
      <section>
        <SectionTitle>Executive Summary</SectionTitle>
        <Card>
          {report.report_narrative ? renderMarkdown(report.report_narrative) : (
            <p className="text-white/50">No narrative available for this report.</p>
          )}
        </Card>
      </section>

      {/* B: Technical Health */}
      <section>
        <SectionTitle>Technical Health</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {techMetrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} severity={m.severity} />
          ))}
        </div>
      </section>

      {/* C: Page Speed */}
      <section>
        <SectionTitle>Page Speed & Core Web Vitals</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Gauge label="Performance" value={ps.performance} />
          <Gauge label="SEO" value={ps.seo} />
          <Gauge label="Accessibility" value={ps.accessibility} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["FCP", "LCP", "TBT", "CLS"] as const).map((m) => {
            const val =
              m === "FCP" ? ps.fcp :
              m === "LCP" ? ps.lcp :
              m === "TBT" ? ps.tbt : ps.cls;
            return <MetricCard key={m} label={m} value={formatCwv(m, val)} severity={cwvSeverity(m, val)} />;
          })}
        </div>
      </section>

      {/* D: GBP & Local Presence */}
      <section>
        <SectionTitle>Google Business Profile & Local Presence</SectionTitle>
        {gbp || grid ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Business</div>
              <div className="text-white font-semibold text-lg">{gbp?.name ?? "—"}</div>
              <div className="text-white/70 text-sm mt-1">{gbp?.address ?? "—"}</div>
              <div className="text-white/70 text-sm">{gbp?.phone ?? "—"}</div>
              {gbp?.mainCategory && <div className="text-white/50 text-xs mt-2">{gbp.mainCategory}</div>}
              {typeof gbp?.avgRating === "number" && (
                <div className="mt-4 flex items-center gap-3">
                  <StarRow rating={gbp.avgRating} />
                  <span className="text-white font-semibold">{gbp.avgRating.toFixed(1)}</span>
                  <span className="text-white/60 text-sm">({gbp.reviewCount ?? 0} reviews)</span>
                </div>
              )}
            </Card>
            <Card>
              <div className="text-xs uppercase tracking-wide text-white/50 mb-3">Grid Ranking Summary</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">{grid?.top3 ?? 0}</div>
                  <div className="text-xs text-white/60 mt-1">Top 3</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-200">{grid?.top10 ?? 0}</div>
                  <div className="text-xs text-white/60 mt-1">Top 10</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">{grid?.beyond10 ?? 0}</div>
                  <div className="text-xs text-white/60 mt-1">Beyond 10</div>
                </div>
              </div>
              {typeof grid?.avgRank === "number" && (
                <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/70">
                  Average rank: <span className="text-white font-semibold">{grid.avgRank.toFixed(1)}</span>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card><p className="text-white/50">Data pending</p></Card>
        )}
      </section>

      {/* E: Domain Metrics */}
      <section>
        <SectionTitle>Domain Metrics</SectionTitle>
        {dm ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard label="Organic Traffic" value={(dm.organicTraffic ?? 0).toLocaleString()} />
            <MetricCard label="Organic Keywords" value={(dm.organicKeywords ?? 0).toLocaleString()} />
            <MetricCard label="Domain Rank" value={dm.domainRank ?? "—"} />
          </div>
        ) : (
          <Card><p className="text-white/50">Data pending</p></Card>
        )}
      </section>

      {/* F: Top Keywords */}
      <section>
        <SectionTitle>Top Keywords</SectionTitle>
        <Card>
          {keywords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-white/50 border-b border-white/10">
                    <th className="py-2 pr-4">Keyword</th>
                    <th className="py-2 pr-4">Position</th>
                    <th className="py-2">Search Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.slice(0, 10).map((k, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4 text-white">{k.keyword}</td>
                      <td className="py-3 pr-4 text-white/80">{k.position}</td>
                      <td className="py-3 text-white/80">{(k.searchVolume ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white/50">Data pending</p>
          )}
        </Card>
      </section>
    </div>
  );
};

export default ReportView;
