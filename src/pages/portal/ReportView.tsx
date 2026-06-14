import { useState } from "react";
import { AuditRun } from "@/integrations/external-supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const MetricCard = ({
  label,
  value,
  severity = "ok",
  onClick,
  count,
}: {
  label: string;
  value: number | string;
  severity?: Severity;
  onClick?: () => void;
  count?: number;
}) => {
  const s = severityStyle[severity];
  const clickable = !!onClick && (count ?? 0) > 0;
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className={`portal-card rounded-xl p-4 border text-left w-full transition ${
        clickable ? "hover:brightness-125 cursor-pointer" : "cursor-default"
      }`}
      style={{ backgroundColor: s.bg, borderColor: s.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
        {clickable && (
          <span className="text-[10px] uppercase tracking-wider text-white/50">View →</span>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ color: s.text }}>{value}</div>
    </button>
  );
};

const Gauge = ({ label, value }: { label: string; value: number | string | undefined | null }) => {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
      ? parseFloat(value)
      : NaN;
  const v = Number.isFinite(num) ? Math.max(0, Math.min(100, Math.round(num))) : null;
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

// Parse "2.7 s", "670 ms", "0.058", number -> { ms or unitless }
const parseCwv = (val: number | string | undefined): { ms?: number; cls?: number } => {
  if (val === undefined || val === null) return {};
  if (typeof val === "number") return { ms: val };
  const cleaned = String(val).replace(/\u00a0/g, " ").trim().toLowerCase();
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return {};
  if (cleaned.includes("ms")) return { ms: num };
  if (cleaned.includes("s")) return { ms: num * 1000 };
  return { cls: num };
};

const cwvSeverity = (metric: string, val: number | string | undefined): Severity => {
  const { ms, cls } = parseCwv(val);
  if (metric === "CLS") {
    const c = cls ?? ms;
    if (c === undefined) return "ok";
    return c <= 0.1 ? "ok" : c <= 0.25 ? "warn" : "crit";
  }
  if (ms === undefined) return "ok";
  switch (metric) {
    case "FCP": return ms <= 1800 ? "ok" : ms <= 3000 ? "warn" : "crit";
    case "LCP": return ms <= 2500 ? "ok" : ms <= 4000 ? "warn" : "crit";
    case "TBT": return ms <= 200 ? "ok" : ms <= 600 ? "warn" : "crit";
    default: return "ok";
  }
};

const formatCwv = (metric: string, val: number | string | undefined): string => {
  if (val === undefined || val === null || val === "") return "—";
  if (typeof val === "string") return val.replace(/\u00a0/g, " ");
  if (metric === "CLS") return val.toFixed(2);
  if (val >= 1000) return `${(val / 1000).toFixed(2)} s`;
  return `${Math.round(val)} ms`;
};

const CWV_META: Record<string, { name: string; explain: string; benchmark: string; fix: string }> = {
  FCP: {
    name: "First Contentful Paint",
    explain: "How quickly the first text or image appears on screen when someone visits your site.",
    benchmark: "Good: under 1.8s",
    fix: "Images may be too large or the server is slow to respond.",
  },
  LCP: {
    name: "Largest Contentful Paint",
    explain: "How long it takes for the main content of your page to fully load.",
    benchmark: "Good: under 2.5s",
    fix: "Large images or videos are slowing down your page load time.",
  },
  TBT: {
    name: "Total Blocking Time",
    explain: "How long your page is unresponsive to clicks while it loads.",
    benchmark: "Good: under 200ms",
    fix: "Too many scripts are running at once, freezing the page temporarily.",
  },
  CLS: {
    name: "Cumulative Layout Shift",
    explain: "How much the page layout jumps around while loading (annoying to users).",
    benchmark: "Good: under 0.1",
    fix: "Images or ads without set dimensions are causing content to shift.",
  },
};

const SEVERITY_LABEL: Record<Severity, string> = {
  ok: "Good",
  warn: "Needs Improvement",
  crit: "Poor",
};

const CwvTile = ({ metric, value }: { metric: "FCP" | "LCP" | "TBT" | "CLS"; value: number | string | undefined }) => {
  const sev = cwvSeverity(metric, value);
  const meta = CWV_META[metric];
  const s = severityStyle[sev];
  const showFix = sev !== "ok";
  return (
    <div
      className="portal-card rounded-xl p-5 border flex flex-col gap-3"
      style={{ backgroundColor: s.bg, borderColor: s.border, borderWidth: 2 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">{metric}</div>
          <div className="text-sm font-semibold text-white mt-0.5">{meta.name}</div>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full whitespace-nowrap"
          style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
        >
          {SEVERITY_LABEL[sev]}
        </span>
      </div>
      <div className="text-3xl font-bold" style={{ color: s.text }}>
        {formatCwv(metric, value)}
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{meta.explain}</p>
      <div className="text-[11px] text-white/50 uppercase tracking-wide">{meta.benchmark}</div>
      {showFix && (
        <div
          className="mt-1 text-xs rounded-lg px-3 py-2 border"
          style={{ borderColor: s.border, backgroundColor: "rgba(0,0,0,0.25)", color: s.text }}
        >
          <span className="font-semibold">How to fix: </span>
          <span className="text-white/80">{meta.fix}</span>
        </div>
      )}
    </div>
  );
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

// ============================================================
// Drilldown rendering
// ============================================================

type IssueKey =
  | "broken" | "redirects"
  | "missingTitle" | "longTitle" | "duplicateTitle"
  | "missingMeta" | "longMeta" | "duplicateMeta"
  | "missingH1" | "multipleH1"
  | "nonIndexable" | "thinContent";

const urlOf = (item: any): string => (typeof item === "string" ? item : item?.url ?? "");

const groupByKey = (items: any[], key: "title" | "meta") => {
  const map = new Map<string, string[]>();
  for (const it of items) {
    const k = it?.[key] ?? "(empty)";
    const arr = map.get(k) ?? [];
    arr.push(it?.url ?? "");
    map.set(k, arr);
  }
  return Array.from(map.entries()).filter(([, urls]) => urls.length > 1);
};

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`py-2 px-3 text-xs uppercase tracking-wide text-white/50 font-medium ${className}`}>{children}</th>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-2 px-3 text-sm text-white/85 align-top ${className}`}>{children}</td>
);

const UrlCell = ({ url }: { url: string }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="text-orange-300 hover:text-orange-200 underline break-all">
    {url}
  </a>
);

const IssueTable = ({ issueKey, items }: { issueKey: IssueKey; items: any[] }) => {
  if (!items || items.length === 0) {
    return <p className="text-white/60">No items.</p>;
  }

  if (issueKey === "broken" || issueKey === "redirects") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th><Th className="w-24">Status</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={urlOf(it)} /></Td><Td>{it.status ?? "—"}</Td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (issueKey === "missingTitle" || issueKey === "missingMeta" || issueKey === "missingH1") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={urlOf(it)} /></Td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (issueKey === "longTitle") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th><Th>Title</Th><Th className="w-20">Chars</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={it.url} /></Td><Td>{it.title}</Td><Td>{it.length}</Td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (issueKey === "longMeta") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th><Th>Meta</Th><Th className="w-20">Chars</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={it.url} /></Td><Td>{it.meta}</Td><Td>{it.length}</Td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (issueKey === "duplicateTitle" || issueKey === "duplicateMeta") {
    const key = issueKey === "duplicateTitle" ? "title" : "meta";
    const groups = groupByKey(items, key);
    if (groups.length === 0) {
      // fall back to flat list
      return (
        <table className="w-full">
          <thead><tr className="border-b border-white/10"><Th>URL</Th><Th>{key === "title" ? "Title" : "Meta"}</Th></tr></thead>
          <tbody>{items.map((it, i) => (
            <tr key={i} className="border-b border-white/5"><Td><UrlCell url={it.url} /></Td><Td>{it[key]}</Td></tr>
          ))}</tbody>
        </table>
      );
    }
    return (
      <div className="space-y-4">
        {groups.map(([val, urls], i) => (
          <div key={i} className="rounded-lg border border-white/10 p-4 bg-white/[0.02]">
            <div className="text-xs uppercase tracking-wide text-white/50 mb-2">{key === "title" ? "Title" : "Meta"}</div>
            <div className="text-white mb-3">{val}</div>
            <div className="text-xs uppercase tracking-wide text-white/50 mb-1">URLs ({urls.length})</div>
            <ul className="space-y-1">{urls.map((u, j) => <li key={j}><UrlCell url={u} /></li>)}</ul>
          </div>
        ))}
      </div>
    );
  }
  if (issueKey === "multipleH1") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th><Th>H1</Th><Th>H1 (2)</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={it.url} /></Td><Td>{it.h1}</Td><Td>{it.h1_2}</Td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (issueKey === "nonIndexable") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th><Th>Reason</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={it.url} /></Td><Td>{it.reason ?? "—"}</Td></tr>
        ))}</tbody>
      </table>
    );
  }
  if (issueKey === "thinContent") {
    return (
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><Th>URL</Th><Th className="w-28">Word count</Th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className="border-b border-white/5"><Td><UrlCell url={it.url} /></Td><Td>{it.wordCount ?? "—"}</Td></tr>
        ))}</tbody>
      </table>
    );
  }
  return null;
};

const ReportView = ({ report, businessName, reportDate }: Props) => {
  const sf = report.screaming_frog?.summary ?? {};
  const issues = report.screaming_frog?.issues ?? {};
  const ps = report.pagespeed ?? {};
  const gbp = report.leadsnap?.gbp;
  const grid = report.leadsnap?.grid;
  const dm = report.domain_metrics;
  const keywords = report.top_keywords ?? [];

  const [drilldown, setDrilldown] = useState<{ key: IssueKey; label: string } | null>(null);

  const issueCount = (k: IssueKey): number => (issues as any)?.[k]?.length ?? 0;

  const techMetrics: Array<{ key: IssueKey; label: string; value: number; severity: Severity }> = [
    { key: "broken",         label: "Broken Links",     value: sf.broken ?? issueCount("broken"),                 severity: (sf.broken ?? issueCount("broken")) > 0 ? "crit" : "ok" },
    { key: "redirects",      label: "Redirects",        value: sf.redirects ?? issueCount("redirects"),           severity: (sf.redirects ?? issueCount("redirects")) > 5 ? "warn" : "ok" },
    { key: "missingTitle",   label: "Missing Titles",   value: sf.missingTitle ?? issueCount("missingTitle"),     severity: (sf.missingTitle ?? issueCount("missingTitle")) > 0 ? "crit" : "ok" },
    { key: "longTitle",      label: "Long Titles",      value: sf.longTitle ?? issueCount("longTitle"),           severity: (sf.longTitle ?? issueCount("longTitle")) > 10 ? "warn" : "ok" },
    { key: "duplicateTitle", label: "Duplicate Titles", value: sf.duplicateTitle ?? issueCount("duplicateTitle"), severity: (sf.duplicateTitle ?? issueCount("duplicateTitle")) > 0 ? "crit" : "ok" },
    { key: "missingMeta",    label: "Missing Meta",     value: sf.missingMeta ?? issueCount("missingMeta"),       severity: (sf.missingMeta ?? issueCount("missingMeta")) > 0 ? "crit" : "ok" },
    { key: "longMeta",       label: "Long Meta",        value: sf.longMeta ?? issueCount("longMeta"),             severity: (sf.longMeta ?? issueCount("longMeta")) > 10 ? "warn" : "ok" },
    { key: "duplicateMeta",  label: "Duplicate Meta",   value: sf.duplicateMeta ?? issueCount("duplicateMeta"),   severity: (sf.duplicateMeta ?? issueCount("duplicateMeta")) > 0 ? "crit" : "ok" },
    { key: "missingH1",      label: "Missing H1",       value: sf.missingH1 ?? issueCount("missingH1"),           severity: (sf.missingH1 ?? issueCount("missingH1")) > 0 ? "crit" : "ok" },
    { key: "multipleH1",     label: "Multiple H1s",     value: sf.multipleH1 ?? issueCount("multipleH1"),         severity: (sf.multipleH1 ?? issueCount("multipleH1")) > 0 ? "warn" : "ok" },
    { key: "nonIndexable",   label: "Non-Indexable",    value: sf.nonIndexable ?? issueCount("nonIndexable"),     severity: (sf.nonIndexable ?? issueCount("nonIndexable")) > 5 ? "warn" : "ok" },
    { key: "thinContent",    label: "Thin Content",     value: sf.thinContent ?? issueCount("thinContent"),       severity: (sf.thinContent ?? issueCount("thinContent")) > 0 ? "warn" : "ok" },
  ];

  const narrative = report.report_narrative;
  const hasNarrative = typeof narrative === "string" && narrative.trim().length > 0;

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
          {hasNarrative ? renderMarkdown(narrative!) : (
            <p className="text-white/50">No narrative available for this report.</p>
          )}
        </Card>
      </section>

      {/* B: Technical Health */}
      <section>
        <SectionTitle>Technical Health</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {techMetrics.map((m) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={m.value}
              severity={m.severity}
              count={issueCount(m.key)}
              onClick={() => setDrilldown({ key: m.key, label: m.label })}
            />
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

      {/* Drilldown modal */}
      <Dialog open={!!drilldown} onOpenChange={(o) => !o && setDrilldown(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-[#0A1628] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {drilldown?.label}
              {drilldown && (
                <span className="ml-2 text-white/50 text-sm font-normal">
                  ({issueCount(drilldown.key)} {issueCount(drilldown.key) === 1 ? "item" : "items"})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {drilldown && (
            <div className="mt-2">
              <IssueTable issueKey={drilldown.key} items={(issues as any)[drilldown.key] ?? []} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportView;
