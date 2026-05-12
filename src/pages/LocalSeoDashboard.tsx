import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Phone,
  TrendingUp,
  Star,
  Link2,
  MapPin,
  BarChart3,
  Search,
  Target,
  Zap,
  Award,
  Activity,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Droplets, Flame, Bug } from "lucide-react";

/* =====================================================
   REUSABLE LOCAL SEO VISIBILITY DASHBOARD TEMPLATE
   First implementation: Caseyville, IL — PuroClean
   ===================================================== */

// ---- TEMPLATE DATA (swap per location/month) ----
const LOCATION = {
  name: "Caseyville, IL",
  business: "PuroClean Emergency Restoration Services",
  reportPeriod: "April 2026",
};

const KPIS = [
  { label: "Avg Map Pack Position", value: "3.2", delta: "+1.4", icon: Target },
  { label: "Visibility Score", value: "78%", delta: "+12%", icon: Activity },
  { label: "Reviews Added", value: "14", delta: "+6", icon: Star },
  { label: "Authority Links Built", value: "22", delta: "+9", icon: Link2 },
  { label: "GBP Engagement", value: "1,284", delta: "+38%", icon: BarChart3 },
  { label: "Service Area Coverage", value: "22", delta: "cities", icon: MapPin },
];

const SERVICE_AREAS = [
  "Alorton", "Belleville", "Brooklyn", "Cahokia", "Caseyville",
  "Centreville", "Dupo", "East Carondelet", "East Saint Louis",
  "Fairmont City", "Fairview Heights", "French Village",
  "Hollywood Heights", "Madison", "Oak Hills", "Saint Louis",
  "Sauget", "Signal Hill", "Stolle", "Swansea", "Venice",
  "Washington Park",
];

const PERFORMANCE = [
  { label: "Avg Map Pack Ranking", value: "3.2", trend: "+1.4 positions", icon: Target },
  { label: "Visibility Percentage", value: "78%", trend: "+12% MoM", icon: Activity },
  { label: "Calls Generated", value: "186", trend: "+24% MoM", icon: Phone },
  { label: "Reviews Added", value: "14", trend: "4.9 ★ avg", icon: Star },
  { label: "Keyword Improvements", value: "47", trend: "top 10 movers", icon: TrendingUp },
  { label: "GBP Engagement", value: "1,284", trend: "views + actions", icon: BarChart3 },
];

const MONTHLY_UPDATES = [
  {
    month: "March 2026 Updates",
    items: [
      { label: "Title Tag Updates", detail: "Refined homepage and water-damage service titles to include geo-modifiers (Caseyville, IL) and improve CTR." },
      { label: "Schema Improvements", detail: "Implemented LocalBusiness + Service schema with serviceArea coverage across all 22 markets." },
      { label: "Internal Linking", detail: "Connected city pages to flagship service hubs (Water, Fire, Mold) using contextual anchors." },
      { label: "Geo-Content Additions", detail: "Added 4 new neighborhood-specific landing sections targeting East Saint Louis and Fairview Heights." },
      { label: "Service Page Optimizations", detail: "Expanded mold remediation page with FAQ schema, before/after media, and emergency CTA blocks." },
      { label: "Technical SEO", detail: "Resolved Core Web Vitals LCP issues; cut homepage TTFB by 38%." },
    ],
  },
  {
    month: "April 2026 Updates",
    items: [
      { label: "Title Tag Updates", detail: "Rolled out emergency-intent title tags across fire and biohazard pages with 24/7 modifiers." },
      { label: "Schema Improvements", detail: "Added FAQPage and Review schema to top 6 service pages." },
      { label: "Internal Linking", detail: "Built silo structure linking blog content into service hubs and GBP landing page." },
      { label: "Geo-Content Additions", detail: "Published Belleville, Swansea, and Cahokia city pages with localized testimonials." },
      { label: "Service Page Optimizations", detail: "Enhanced commercial restoration page with case studies and trust indicators." },
      { label: "Technical SEO", detail: "Compressed media library, deployed lazy-loading, and refreshed XML sitemap." },
    ],
  },
];

const TIER1_LINKS = [
  {
    month: "March 2026",
    sourceUrl: "https://medium.com/puroclean-caseyville-water-damage",
    topic: "Water Damage Restoration",
    type: "Editorial",
    moneySiteUrl: "https://puroclean.com/caseyville-il-water-damage",
    moneyAnchor: "Caseyville water damage restoration",
    idPageUrl: "https://about.me/puroclean.caseyville",
    idAnchor: "PuroClean Caseyville",
    gbpUrl: "https://maps.google.com/?cid=PuroCleanCaseyville",
    gbpAnchor: "PuroClean on Google Maps",
  },
  {
    month: "March 2026",
    sourceUrl: "https://wordpress.com/restoration-tips-illinois",
    topic: "Mold Remediation",
    type: "Guest Post",
    moneySiteUrl: "https://puroclean.com/caseyville-il-mold-removal",
    moneyAnchor: "mold remediation Caseyville IL",
    idPageUrl: "https://gravatar.com/purocleancaseyville",
    idAnchor: "PuroClean Emergency Restoration",
    gbpUrl: "https://maps.google.com/?cid=PuroCleanCaseyville",
    gbpAnchor: "Caseyville GBP",
  },
  {
    month: "April 2026",
    sourceUrl: "https://blogger.com/fire-damage-recovery-il",
    topic: "Fire Damage Recovery",
    type: "Editorial",
    moneySiteUrl: "https://puroclean.com/caseyville-il-fire-damage",
    moneyAnchor: "fire damage cleanup Caseyville",
    idPageUrl: "https://about.me/puroclean.caseyville",
    idAnchor: "PuroClean of Caseyville",
    gbpUrl: "https://maps.google.com/?cid=PuroCleanCaseyville",
    gbpAnchor: "View on Google Maps",
  },
  {
    month: "April 2026",
    sourceUrl: "https://tumblr.com/biohazard-cleanup-metro-east",
    topic: "Biohazard Cleanup",
    type: "Niche Edit",
    moneySiteUrl: "https://puroclean.com/caseyville-il-biohazard",
    moneyAnchor: "biohazard cleanup Metro East",
    idPageUrl: "https://gravatar.com/purocleancaseyville",
    idAnchor: "PuroClean Caseyville profile",
    gbpUrl: "https://maps.google.com/?cid=PuroCleanCaseyville",
    gbpAnchor: "Caseyville restoration map",
  },
];

const TIER2_LINKS = [
  { month: "March 2026", source: "diigo.com/puroclean-caseyville", topic: "Water Damage", anchor: "emergency water cleanup" },
  { month: "March 2026", source: "evernote.com/pub/puroclean", topic: "Mold Remediation", anchor: "mold removal IL" },
  { month: "March 2026", source: "scoop.it/puroclean-restoration", topic: "Fire Damage", anchor: "fire restoration Caseyville" },
  { month: "April 2026", source: "pearltrees.com/purocleancaseyville", topic: "Biohazard", anchor: "trauma scene cleanup" },
  { month: "April 2026", source: "instapaper.com/p/purocleancaseyville", topic: "Storm Damage", anchor: "storm damage repair Metro East" },
  { month: "April 2026", source: "getpocket.com/@purocleancaseyville", topic: "Commercial Restoration", anchor: "commercial restoration IL" },
];

const INSIGHTS = [
  { icon: TrendingUp, title: "Visibility Gains", body: "Map pack visibility climbed from 66% to 78% across the 22-city service area, driven by geo-content expansion and GBP optimization." },
  { icon: Award, title: "Authority Growth", body: "22 new authority links acquired across Tier 1 editorials and Tier 2 contextual placements, strengthening topical authority for restoration intents." },
  { icon: Zap, title: "Engagement Improvements", body: "GBP profile views, calls, and direction requests increased 38% month-over-month with stronger weekend conversion patterns." },
  { icon: Target, title: "Next Strategic Focus", body: "Expand into underperforming markets (Madison, Venice, Brooklyn) with dedicated city pages and review velocity campaigns." },
];

// ---- COMPONENTS ----
const KpiCard = ({ kpi }: { kpi: typeof KPIS[number] }) => {
  const Icon = kpi.icon;
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 backdrop-blur-sm hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)" }}>
          <Icon size={18} className="text-primary" />
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
          {kpi.delta}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{kpi.value}</div>
      <div className="text-xs text-white/60 mt-1">{kpi.label}</div>
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) => (
  <div className="mb-10 max-w-3xl">
    <div className="section-label">{eyebrow}</div>
    <h2 className="font-bold mb-3">{title}</h2>
    {description && <p className="section-description">{description}</p>}
  </div>
);

const HeatMapCard = ({ label, period, score, caption, seed = 0, variant = "previous" }: { label: string; period: string; score: string; caption: string; seed?: number; variant?: "previous" | "current" }) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden card-elevated">
    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-bold mt-0.5">{period}</div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
        Visibility {score}
      </span>
    </div>
    {/* Stylized heat map placeholder */}
    <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 gap-2 p-6">
        {Array.from({ length: 35 }).map((_, i) => {
          const s = (i * 13 + seed + label.length) % 10;
          const isCurrent = variant === "current";
          const rank = isCurrent
            ? (s < 5 ? 1 + (s % 3) : 4 + (s % 4))
            : (s < 3 ? 2 + (s % 3) : 6 + (s % 5));
          const color = rank <= 3 ? "#16a34a" : rank <= 6 ? "#eab308" : "#dc2626";
          return (
            <div key={i} className="flex items-center justify-center">
              <div className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md" style={{ background: color }}>
                {rank}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <div className="px-5 py-3 text-xs text-muted-foreground border-t border-border">{caption}</div>
  </div>
);

const MonthAccordion = ({ month, items, defaultOpen = false }: { month: string; items: { label: string; detail: string }[]; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
            <Search size={16} className="text-primary" />
          </div>
          <span className="font-bold text-lg">{month}</span>
        </div>
        <ChevronDown size={20} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl bg-secondary/40 p-4 border border-border/60">
              <div className="text-sm font-bold mb-1.5">{item.label}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LocalSeoDashboard = () => {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="section-dark pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(to right, hsl(var(--dark-surface-foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--dark-surface-foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "var(--gradient-primary)" }} />

        <div className="container-main relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                Monthly Visibility Report
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(209, 34, 41, 0.15)", color: "#ff6b72" }}>
                {LOCATION.reportPeriod}
              </span>
            </div>
            <h1 className="font-bold mb-4 text-white">
              {LOCATION.name} <span className="gradient-text">Local Visibility Dashboard</span>
            </h1>
            <p className="text-lg max-w-3xl mb-2" style={{ color: "hsl(var(--dark-surface-foreground) / 0.7)" }}>
              Monthly SEO performance, visibility tracking, authority growth, and market expansion reporting for {LOCATION.business}.
            </p>
          </motion.div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-10">
            {KPIS.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button variant="gradient" size="lg" onClick={() => window.print()}>
              <Download size={18} className="mr-1" />
              Download PDF Report
            </Button>
            <Button variant="hero-secondary" size="lg" asChild>
              <Link to="/contact">
                <Phone size={18} className="mr-1" />
                Schedule Strategy Call
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 1 — HEAT MAP */}
      <section className="section-light">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 01 · Heat Map Visibility"
            title="Geo-Grid Visibility Comparison"
            description="Side-by-side heat maps showing local pack ranking shifts across the Caseyville service area."
          />
          <div className="grid md:grid-cols-2 gap-6">
            <HeatMapCard label="Previous Heat Map" period="March 2026" score="66%" caption="Baseline visibility prior to the latest geo-content and GBP optimization sprint." />
            <HeatMapCard label="Current Heat Map" period="April 2026" score="78%" caption="Post-optimization snapshot showing stronger 3-pack saturation across core markets." />
          </div>
          <div className="mt-8 rounded-2xl p-6 border border-border" style={{ background: "hsl(var(--primary) / 0.05)" }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.15)" }}>
                <TrendingUp size={18} className="text-primary" />
              </div>
              <div>
                <div className="font-bold mb-1">Visibility Movement Summary</div>
                <p className="text-sm text-muted-foreground">
                  Average map pack ranking improved <span className="font-bold text-foreground">from 4.6 to 3.2</span>, with 12 new grid points entering the top 3.
                  Strongest gains observed in Belleville, Fairview Heights, and East Saint Louis — driven by city-page expansion and review velocity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — SERVICE AREA */}
      <section className="section-muted">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 02 · Service Area Coverage"
            title="22 Active Target Markets"
            description="These are the active target visibility markets being optimized through local SEO and Google Business Profile strategies."
          />
          <div className="flex flex-wrap gap-2.5">
            {SERVICE_AREAS.map((city) => (
              <div key={city} className="px-4 py-2.5 rounded-full bg-white border border-border text-sm font-semibold flex items-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all">
                <MapPin size={14} className="text-primary" />
                {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — PERFORMANCE */}
      <section className="section-light">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 03 · SEO Performance Summary"
            title="Monthly Performance Metrics"
            description="Key analytics across rankings, engagement, and lead generation for the report period."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERFORMANCE.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="card-elevated p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-box-sm">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground">{metric.label}</div>
                  </div>
                  <div className="text-4xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-primary font-semibold">{metric.trend}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — ON-PAGE SEO UPDATES */}
      <section className="section-muted">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 04 · On-Page SEO Updates"
            title="Monthly Optimization Log"
            description="A detailed log of on-page, technical, and geo-content optimizations completed each month."
          />
          <div className="space-y-4">
            {MONTHLY_UPDATES.map((m, i) => (
              <MonthAccordion key={m.month} month={m.month} items={m.items} defaultOpen={i === MONTHLY_UPDATES.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — TIER 1 LINKS */}
      <section className="section-light">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 05 · Tier 1 Authority Links"
            title="Premium Link Acquisition Report"
            description="High-authority editorial and contextual placements built across the report period."
          />
          <div className="rounded-2xl border border-border overflow-hidden card-elevated">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "hsl(var(--dark-surface))" }} className="text-white">
                  <tr>
                    {["Month","Source URL","Topic","Type","Money Site URL","Money Anchor","ID Page URL","ID Anchor","GB Map URL","GB Anchor"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIER1_LINKS.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-secondary/40"}>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{row.month}</td>
                      <td className="px-4 py-3"><a className="text-primary hover:underline" href={row.sourceUrl} target="_blank" rel="noreferrer">{row.sourceUrl.replace(/^https?:\/\//, '').slice(0, 40)}…</a></td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.topic}</td>
                      <td className="px-4 py-3"><span className="tag">{row.type}</span></td>
                      <td className="px-4 py-3"><a className="text-primary hover:underline" href={row.moneySiteUrl} target="_blank" rel="noreferrer">money site</a></td>
                      <td className="px-4 py-3 italic">"{row.moneyAnchor}"</td>
                      <td className="px-4 py-3"><a className="text-primary hover:underline" href={row.idPageUrl} target="_blank" rel="noreferrer">ID page</a></td>
                      <td className="px-4 py-3 italic">"{row.idAnchor}"</td>
                      <td className="px-4 py-3"><a className="text-primary hover:underline" href={row.gbpUrl} target="_blank" rel="noreferrer">GB map</a></td>
                      <td className="px-4 py-3 italic">"{row.gbpAnchor}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — TIER 2 LINKS */}
      <section className="section-muted">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 06 · Tier 2 Authority Links"
            title="Supporting Link Layer"
            description="Tier 2 contextual placements that reinforce Tier 1 link power and topical relevance."
          />
          <div className="rounded-2xl border border-border overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead style={{ background: "hsl(var(--dark-surface))" }} className="text-white">
                <tr>
                  {["Month","Source","Topic","Anchor"].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIER2_LINKS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-secondary/40"}>
                    <td className="px-5 py-3 font-semibold whitespace-nowrap">{row.month}</td>
                    <td className="px-5 py-3"><a className="text-primary hover:underline" href={`https://${row.source}`} target="_blank" rel="noreferrer">{row.source}</a></td>
                    <td className="px-5 py-3">{row.topic}</td>
                    <td className="px-5 py-3 italic">"{row.anchor}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 7 — STRATEGIC INSIGHTS */}
      <section className="section-light">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 07 · Strategic Insights"
            title="Strategy Commentary"
            description="Key takeaways and the next strategic focus for the upcoming reporting period."
          />
          <div className="grid md:grid-cols-2 gap-5">
            {INSIGHTS.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.title} className="card-elevated p-6">
                  <div className="flex items-start gap-4">
                    <div className="icon-box">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-lg mb-1.5">{insight.title}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(to right, hsl(var(--dark-surface-foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--dark-surface-foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="container-main py-24 text-center relative z-10">
          <h2 className="font-bold mb-5 text-white max-w-3xl mx-auto">
            Ready to Expand Your <span className="gradient-text">Local Visibility</span> Further?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "hsl(var(--dark-surface-foreground) / 0.7)" }}>
            Continue building market authority and lead generation momentum with BluePipe Digital's local SEO growth systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gradient" size="xl" asChild>
              <Link to="/contact">
                Schedule Strategy Call
                <ArrowRight size={18} className="ml-1" />
              </Link>
            </Button>
            <Button variant="hero-secondary" size="xl" asChild>
              <Link to="/free-audit">Request Expansion Audit</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LocalSeoDashboard;
