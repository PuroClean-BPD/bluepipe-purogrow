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
import { Droplets, Flame, Bug, Users, Lightbulb, Crown, ShieldCheck } from "lucide-react";
import aprilWaterImg from "@/assets/april-water.jpg";
import mayWaterImg from "@/assets/may-water.jpg";
import marchMoldImg from "@/assets/march-mold.jpg";
import mayMoldImg from "@/assets/may-mold.jpg";
import marchFireImg from "@/assets/march-fire.jpg";
import mayFireImg from "@/assets/may-fire.jpg";
import gbpMarchOverview from "@/assets/gbp-march-overview.jpg";
import gbpMarchCalls from "@/assets/gbp-march-calls.jpg";
import gbpMarchDirections from "@/assets/gbp-march-directions.jpg";
import gbpMarchWebsite from "@/assets/gbp-march-website.jpg";
import gbpAprilCalls from "@/assets/gbp-april-calls.jpg";
import gbpAprilDirections from "@/assets/gbp-april-directions.jpg";
import gbpAprilWebsite from "@/assets/gbp-april-website.jpg";
import { Navigation, MousePointerClick, Sparkles, MessageSquare, ThumbsUp } from "lucide-react";
import mayReviewsImg from "@/assets/may-reviews.jpg";
import LightboxProvider from "@/components/LightboxProvider";

/* =====================================================
   REUSABLE LOCAL SEO VISIBILITY DASHBOARD TEMPLATE
   First implementation: Caseyville, IL — PuroClean
   ===================================================== */

// ---- TEMPLATE DATA (swap per location/month) ----
const LOCATION = {
  name: "Caseyville, IL",
  business: "PuroClean Emergency Restoration Services",
  reportPeriod: "May 2026",
};

const KPIS = [
  { title: "Avg Map Pack Position", label: "Blended average across Water Damage, Mold Removal, and Fire Damage visibility grids", value: "2.79", delta: "May", icon: Target },
  { title: "Visibility Score", label: "Blended Top 3 visibility across tracked service categories", value: "74.7%", delta: "Top 3", icon: Activity },
  { title: "Reviews Added", label: "May review growth", value: "+8", delta: "May", icon: Star },
  { title: "Authority Links Built", label: "March–April authority links", value: "9", delta: "Mar–Apr", icon: Link2 },
  { title: "GBP Engagement", label: "April business profile interactions", value: "222", delta: "April", icon: BarChart3 },
  { title: "Service Area Coverage", label: "Primary visibility focus area", value: "Main Service City", delta: "Primary", icon: MapPin },
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
      { label: "Content Status", detail: "No content added yet. Waiting for PuroClean corporate to update the website.", status: "Pending" },
      { label: "Schema Status", detail: "Local schema file not updated yet. Pending BluePipe Digital Rank Math Pro license to be added to the account by PuroClean corporate.", status: "In Progress" },
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

type MonthlyKpi = { label: string; april: string; aprilNote?: string; may: string; mayNote?: string; delta: string; deltaTone: "up" | "down" | "neutral" };
type Competitor = { name: string; color: string };

const SERVICE_VISIBILITY = [
  {
    id: "water",
    name: "Water Damage Restoration",
    icon: Droplets,
    seed: 3,
    periodALabel: "Apr 2026",
    periodBLabel: "May 2026",
    aprilScore: "37.87%",
    mayScore: "36.69%",
    aprilImage: aprilWaterImg,
    mayImage: mayWaterImg,
    aprilCardLabel: "April 2026 Visibility Snapshot",
    mayCardLabel: "May 2026 Visibility Snapshot",
    aprilCardPeriod: "Water Damage Restoration · April 2026",
    mayCardPeriod: "Water Damage Restoration · May 2026",
    aprilCaption: "April 2026 geo-grid snapshot · 37.87% Top 3 visibility · 48.48% market share.",
    mayCaption: "May 2026 geo-grid snapshot · 36.69% Top 3 visibility · 51.67% market share.",
    monthlyKpis: [
      { label: "Average Ranking", april: "4.43", aprilNote: "#2", may: "4.63", mayNote: "#2", delta: "+0.20", deltaTone: "neutral" },
      { label: "Top 3 Visibility", april: "37.87%", aprilNote: "#4", may: "36.69%", mayNote: "#4", delta: "-1.18%", deltaTone: "down" },
      { label: "Market Share", april: "48.48%", aprilNote: "#4", may: "51.67%", mayNote: "#4", delta: "+3.19%", deltaTone: "up" },
      { label: "Local Rank", april: "#2", may: "#2", delta: "Held", deltaTone: "neutral" },
    ] as MonthlyKpi[],
    competitors: [
      { name: "RCC Restoration", color: "#3b82f6" },
      { name: "SERVPRO Collinsville", color: "#f59e0b" },
      { name: "Rainbow Restoration", color: "#10b981" },
      { name: "Five Star Water Damage", color: "#d12229" },
    ] as Competitor[],
    analysis: {
      title: "Water Damage Visibility Analysis",
      bullets: [
        "PuroClean Caseyville maintained strong Top 3 visibility throughout core Illinois service zones.",
        "Market share increased month-over-month despite heightened local competition.",
        "Visibility remains strongest throughout Caseyville, Fairview Heights, Swansea, and Belleville.",
        "Competitive pressure remains strongest in western St. Louis markets.",
        "Continued Google Business Profile engagement and authority-building efforts are improving local search stability.",
      ],
    },
    summary: [],
    kpis: [],
  },
  {
    id: "mold",
    name: "Mold Removal",
    icon: Bug,
    seed: 7,
    periodALabel: "Mar 2026",
    periodBLabel: "May 2026",
    aprilScore: "100%",
    mayScore: "90.51%",
    aprilImage: marchMoldImg,
    mayImage: mayMoldImg,
    aprilCardLabel: "March 2026 Mold Visibility",
    mayCardLabel: "May 2026 Mold Visibility",
    aprilCardPeriod: "Mold Removal · March 2026",
    mayCardPeriod: "Mold Removal · May 2026",
    aprilCaption: "March 2026 geo-grid snapshot · 100% Top 3 visibility · 100% market share.",
    mayCaption: "May 2026 geo-grid snapshot · 90.51% Top 3 visibility · 100% market share.",
    leaderBadge: {
      title: "#1 Ranked Mold Removal Visibility Leader",
      subtitle: "Category dominance maintained across the full geo-grid",
    },
    monthlyKpis: [
      { label: "Average Ranking", april: "1.88", aprilNote: "#1", may: "2.01", mayNote: "#1", delta: "+0.13", deltaTone: "neutral" },
      { label: "Top 3 Visibility", april: "100%", aprilNote: "#1", may: "90.51%", mayNote: "#1", delta: "-9.49%", deltaTone: "down" },
      { label: "Market Share", april: "100%", aprilNote: "#1", may: "100%", mayNote: "#1", delta: "Held", deltaTone: "up" },
      { label: "Local Rank", april: "#1", may: "#1", delta: "Held", deltaTone: "up" },
    ] as MonthlyKpi[],
    dominance: {
      title: "Category Dominance Snapshot",
      items: [
        "100% Market Share",
        "#1 Average Ranking",
        "Exceptional Top 3 Coverage",
        "Strong Engagement Signals",
        "High Local Authority",
      ],
    },
    analysis: {
      title: "Mold Removal Visibility Analysis",
      bullets: [
        "PuroClean Caseyville continues to dominate the Mold Removal category across nearly the entire geo-grid.",
        "Rankings remained exceptionally stable with near-total Top 3 visibility throughout the service area.",
        "Market share maintained a commanding 100% position against local competitors.",
        "Strong Google Business Profile engagement and review authority continue reinforcing local algorithm trust.",
        "Visibility remains strongest throughout Caseyville, Fairview Heights, Collinsville, Swansea, and surrounding Illinois markets.",
        "Minor ranking fluctuations occurred in fringe western zones but overall dominance remains extremely strong.",
      ],
    },
    summary: [],
    kpis: [],
  },
  {
    id: "fire",
    name: "Fire Damage Restoration",
    icon: Flame,
    seed: 11,
    periodALabel: "Mar 2026",
    periodBLabel: "May 2026",
    aprilScore: "97.08%",
    mayScore: "97%",
    aprilImage: marchFireImg,
    mayImage: mayFireImg,
    aprilCardLabel: "March 2026 Fire Damage Visibility",
    mayCardLabel: "May 2026 Fire Damage Visibility",
    aprilCardPeriod: "Fire Damage Restoration · March 2026",
    mayCardPeriod: "Fire Damage Restoration · May 2026",
    aprilCaption: "March 2026 geo-grid snapshot · 97.08% Top 3 visibility · 100% market share.",
    mayCaption: "May 2026 geo-grid snapshot · 97% Top 3 visibility · 100% market share.",
    leaderBadge: {
      title: "#1 Fire Damage Visibility Leader",
      subtitle: "Sustained category dominance across the Caseyville geo-grid",
    },
    monthlyKpis: [
      { label: "Average Ranking", april: "1.69", aprilNote: "#1", may: "1.72", mayNote: "#1", delta: "+0.03", deltaTone: "neutral" },
      { label: "Top 3 Visibility", april: "97.08%", aprilNote: "#1", may: "97%", mayNote: "#1", delta: "-0.08%", deltaTone: "neutral" },
      { label: "Market Share", april: "100%", aprilNote: "#1", may: "100%", mayNote: "#1", delta: "Held", deltaTone: "up" },
      { label: "Local Rank", april: "#1", may: "#1", delta: "Held", deltaTone: "up" },
    ] as MonthlyKpi[],
    dominance: {
      title: "Fire Damage Market Dominance",
      items: [
        "#1 Average Ranking",
        "97%+ Top 3 Visibility",
        "100% Market Share",
        "Exceptional Geo-Grid Consistency",
        "Strong Google Trust Signals",
      ],
    },
    analysis: {
      title: "Fire Damage Visibility Analysis",
      bullets: [
        "PuroClean Caseyville maintained dominant #1 local visibility across nearly the entire geo-grid.",
        "Rankings remained highly stable month-over-month with exceptional Top 3 market penetration.",
        "Fire damage restoration visibility continues outperforming local competitors across core Illinois service markets.",
        "Strong review engagement, Google Business Profile authority, and local relevance signals are reinforcing sustained ranking leadership.",
        "Visibility remains strongest throughout Caseyville, Fairview Heights, Collinsville, Swansea, and East St. Louis markets.",
        "The consistency of #1 and #2 rankings across the grid indicates strong local algorithm trust and high topical authority.",
      ],
    },
    callout: "PuroClean Caseyville continues to demonstrate elite local visibility performance across fire damage restoration searches throughout the Illinois service region.",
    summary: [],
    kpis: [],
  },
];
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
      <div className="text-sm font-semibold text-white/90 mt-1">{kpi.title}</div>
      <div className="text-[11px] text-white/55 mt-1 leading-snug">{kpi.label}</div>
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

const HeatMapCard = ({ label, period, score, caption, seed = 0, variant = "previous", image }: { label: string; period: string; score: string; caption: string; seed?: number; variant?: "previous" | "current"; image?: string }) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden card-elevated">
    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-bold mt-0.5">{period}</div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
        Top 3 · {score}
      </span>
    </div>
    {image ? (
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img src={image} alt={`${period} geo-grid heat map`} className="w-full h-full object-cover" loading="lazy" />
      </div>
    ) : (
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
    )}
    <div className="px-5 py-3 text-xs text-muted-foreground border-t border-border">{caption}</div>
  </div>
);

const MonthAccordion = ({ month, items, defaultOpen = false }: { month: string; items: { label: string; detail: string; status?: string }[]; defaultOpen?: boolean }) => {
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
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="text-sm font-bold">{item.label}</div>
                {item.status && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{
                      background: "hsl(var(--muted) / 0.6)",
                      color: "hsl(var(--muted-foreground))",
                      borderColor: "hsl(var(--border))",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {item.status}
                  </span>
                )}
              </div>
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
    <LightboxProvider>
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

      {/* SECTION 1 — SERVICE VISIBILITY COMPARISONS */}
      <section className="section-light">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 01 · Service Visibility Comparisons"
            title="Service Visibility Comparisons"
            description="Month-over-month local map visibility tracking across core restoration service categories."
          />

          <Tabs defaultValue={SERVICE_VISIBILITY[0].id} className="w-full">
            <TabsList className="bg-secondary/60 p-1.5 rounded-full h-auto flex flex-wrap gap-1 mb-8">
              {SERVICE_VISIBILITY.map((svc) => {
                const Icon = svc.icon;
                return (
                  <TabsTrigger
                    key={svc.id}
                    value={svc.id}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {svc.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {SERVICE_VISIBILITY.map((svc: any) => {
              const hasMonthly = Array.isArray(svc.monthlyKpis) && svc.monthlyKpis.length > 0;
              return (
              <TabsContent key={svc.id} value={svc.id} className="mt-0 space-y-6">
                {svc.leaderBadge && (
                  <div className="relative overflow-hidden rounded-2xl border border-primary/30 p-5 card-elevated" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.10), hsl(var(--primary) / 0.02))" }}>
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40" style={{ background: "var(--gradient-primary)" }} />
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: "var(--gradient-primary)" }}>
                        <Crown size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base sm:text-lg font-bold leading-tight">{svc.leaderBadge.title}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">{svc.leaderBadge.subtitle}</div>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(209, 34, 41, 0.10)", color: "#d12229" }}>
                        <Award size={14} /> Category Leader
                      </span>
                    </div>
                  </div>
                )}

                {hasMonthly ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {svc.monthlyKpis.map((kpi: MonthlyKpi) => {
                      const toneBg = kpi.deltaTone === "up" ? "rgba(22,163,74,0.12)" : kpi.deltaTone === "down" ? "rgba(220,38,38,0.10)" : "hsl(var(--primary) / 0.10)";
                      const toneFg = kpi.deltaTone === "up" ? "#16a34a" : kpi.deltaTone === "down" ? "#dc2626" : "hsl(var(--primary))";
                      return (
                        <div key={kpi.label} className="card-elevated p-5 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{kpi.label}</div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: toneBg, color: toneFg }}>
                              {kpi.delta}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-secondary/50 px-3 py-2">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{svc.periodALabel || "Apr 2026"}</div>
                              <div className="flex items-baseline gap-1.5">
                                <div className="text-lg font-bold">{kpi.april}</div>
                                {kpi.aprilNote && <div className="text-[11px] text-muted-foreground">{kpi.aprilNote}</div>}
                              </div>
                            </div>
                            <div className="rounded-lg px-3 py-2" style={{ background: "hsl(var(--primary) / 0.08)" }}>
                              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>{svc.periodBLabel || "May 2026"}</div>
                              <div className="flex items-baseline gap-1.5">
                                <div className="text-lg font-bold">{kpi.may}</div>
                                {kpi.mayNote && <div className="text-[11px] text-muted-foreground">{kpi.mayNote}</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {svc.dominance && (
                  <div className="rounded-2xl border border-border bg-card p-6 card-elevated">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                        <ShieldCheck size={16} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-bold">{svc.dominance.title}</div>
                        <div className="text-xs text-muted-foreground">Snapshot of category leadership signals for {svc.name.toLowerCase()}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {svc.dominance.items.map((item: string) => (
                        <div key={item} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm font-semibold">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "hsl(var(--primary))" }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {svc.competitors && (
                  <div className="rounded-2xl border border-border bg-card p-6 card-elevated">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                        <Users size={16} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-bold">Primary Local Competitors</div>
                        <div className="text-xs text-muted-foreground">Top tracked competitors in the {svc.name.toLowerCase()} market</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {svc.competitors.map((c: Competitor) => (
                        <div key={c.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border text-sm font-semibold hover:border-primary/40 transition-all">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <HeatMapCard
                    label={svc.aprilCardLabel || "April 2026 Visibility Snapshot"}
                    period={svc.aprilCardPeriod || `${svc.name} · April 2026`}
                    score={svc.aprilScore}
                    caption={svc.aprilCaption}
                    seed={svc.seed}
                    variant="previous"
                    image={svc.aprilImage}
                  />
                  <HeatMapCard
                    label={svc.mayCardLabel || "May 2026 Visibility Snapshot"}
                    period={svc.mayCardPeriod || `${svc.name} · May 2026`}
                    score={svc.mayScore}
                    caption={svc.mayCaption}
                    seed={svc.seed + 1}
                    variant="current"
                    image={svc.mayImage}
                  />
                </div>

                {svc.analysis && (
                  <div className="rounded-2xl p-6 border border-border bg-card card-elevated">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.15)" }}>
                        <Lightbulb size={18} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-2">{svc.analysis.title}</div>
                        <ul className="space-y-1.5">
                          {svc.analysis.bullets.map((item: string) => (
                            <li key={item} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {svc.callout && (
                  <div className="relative overflow-hidden rounded-2xl border border-primary/30 p-5 card-elevated" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))" }}>
                    <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
                    <div className="relative flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: "var(--gradient-primary)" }}>
                        <Award size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--primary))" }}>Local Authority Insight</div>
                        <p className="text-sm sm:text-base font-semibold leading-snug">{svc.callout}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!hasMonthly && svc.kpis && svc.kpis.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {svc.kpis.map((kpi: any) => (
                      <div key={kpi.label} className="card-elevated p-5 rounded-2xl">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{kpi.label}</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-2xl font-bold">{kpi.value}</div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                            {kpi.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!svc.analysis && (
                  <div className="rounded-2xl p-6 border border-border" style={{ background: "hsl(var(--primary) / 0.05)" }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.15)" }}>
                        <TrendingUp size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-bold mb-2">Visibility Movement Summary — {svc.name}</div>
                        <ul className="space-y-1.5">
                          {svc.summary.map((item: string) => (
                            <li key={item} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              );
            })}
          </Tabs>
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

      {/* SECTION 3 — GOOGLE BUSINESS PROFILE PERFORMANCE INTELLIGENCE */}
      <section className="section-light">
        <div className="container-main py-20">
          <SectionHeader
            eyebrow="Section 03 · Google Business Profile Intelligence"
            title="Google Business Profile Performance Intelligence"
            description="Monthly engagement analytics and customer interaction trends across Google Business Profile visibility channels."
          />

          {/* ROW 1 — KPI COMPARISON CARDS (March vs April 2026) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: "Total Interactions", icon: BarChart3, mar: "224", apr: "222", delta: "−0.9% MoM", tone: "neutral", note: "+13.1% YoY (Mar)" },
              { label: "Calls Generated", icon: Phone, mar: "19", apr: "21", delta: "+10.5% MoM", tone: "up", note: "Direct phone actions" },
              { label: "Direction Requests", icon: Navigation, mar: "173", apr: "154", delta: "−11.0% MoM", tone: "down", note: "+24.5% YoY (Mar) · +2.0% YoY (Apr)" },
              { label: "Website Clicks", icon: MousePointerClick, mar: "32", apr: "47", delta: "+46.9% MoM", tone: "up", note: "+30.6% YoY (Apr)" },
            ].map((k) => {
              const Icon = k.icon;
              const toneClass =
                k.tone === "up" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                k.tone === "down" ? "text-rose-600 bg-rose-50 border-rose-200" :
                "text-muted-foreground bg-muted border-border";
              return (
                <div key={k.label} className="card-elevated p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="icon-box-sm"><Icon size={18} className="text-primary" /></div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${toneClass}`}>{k.delta}</span>
                  </div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">{k.label}</div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">March</div>
                      <div className="text-2xl font-bold leading-tight">{k.mar}</div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 px-3 py-2">
                      <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">April</div>
                      <div className="text-2xl font-bold leading-tight">{k.apr}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-auto">{k.note}</div>
                </div>
              );
            })}
          </div>

          {/* SECONDARY SIGNALS */}
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {[
              { label: "Engagement Growth", value: "+13.1%", note: "Business Profile Interactions YoY", icon: TrendingUp },
              { label: "Local Visibility Signals", value: "Strong", note: "Consistent map pack presence across the main service city", icon: Activity },
              { label: "Buyer Intent Actions", value: "+46.9%", note: "Website clicks MoM growth", icon: Sparkles },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="card-elevated p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="icon-box-sm"><Icon size={18} className="text-primary" /></div>
                    <div className="text-sm font-semibold text-muted-foreground">{m.label}</div>
                  </div>
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{m.value}</div>
                  <div className="text-xs text-muted-foreground">{m.note}</div>
                </div>
              );
            })}
          </div>

          {/* ROW 2 — TREND CHARTS (March + April screenshots) */}
          <div className="space-y-8 mb-12">
            {[
              {
                month: "March 2026",
                accent: "Baseline reporting period",
                charts: [
                  { title: "Business Profile Interactions", value: "224", trend: "+13.1% vs Mar 2025", img: gbpMarchOverview, tone: "up" },
                  { title: "Calls", value: "19", trend: "−29.6% vs Mar 2025", img: gbpMarchCalls, tone: "down" },
                  { title: "Direction Requests", value: "173", trend: "+24.5% vs Mar 2025", img: gbpMarchDirections, tone: "up" },
                  { title: "Website Clicks", value: "32", trend: "+0.0% vs Mar 2025", img: gbpMarchWebsite, tone: "neutral" },
                ],
              },
              {
                month: "April 2026",
                accent: "Current reporting period",
                charts: [
                  { title: "Calls", value: "21", trend: "−36.4% vs Apr 2025", img: gbpAprilCalls, tone: "down" },
                  { title: "Direction Requests", value: "154", trend: "+2.0% vs Apr 2025", img: gbpAprilDirections, tone: "up" },
                  { title: "Website Clicks", value: "47", trend: "+30.6% vs Apr 2025", img: gbpAprilWebsite, tone: "up" },
                ],
              },
            ].map((block) => (
              <div key={block.month} className="rounded-2xl border border-border card-elevated overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <BarChart3 size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-base font-bold">{block.month}</div>
                      <div className="text-xs text-muted-foreground">{block.accent}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">GBP Insights</span>
                </div>
                <div className={`grid gap-5 p-6 ${block.charts.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
                  {block.charts.map((c) => {
                    const tc =
                      c.tone === "up" ? "text-emerald-600" :
                      c.tone === "down" ? "text-rose-600" :
                      "text-muted-foreground";
                    return (
                      <div key={c.title} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="px-4 pt-4 pb-2">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <div className="text-2xl font-bold">{c.value}</div>
                            <div className={`text-xs font-semibold ${tc}`}>{c.trend}</div>
                          </div>
                        </div>
                        <div className="bg-[#0b1220] mx-4 mb-4 mt-2 rounded-lg overflow-hidden border border-border/40">
                          <img src={c.img} alt={`${block.month} ${c.title} trend chart`} className="w-full h-auto block" loading="lazy" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* INSIGHT + SIGNALS GRID */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Strategic Insight */}
            <div className="rounded-2xl card-elevated overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-white flex items-center gap-3">
                <Lightbulb size={18} />
                <div>
                  <div className="text-base font-bold">Google Engagement Analysis</div>
                  <div className="text-xs opacity-90">Strategic visibility commentary · April 2026</div>
                </div>
              </div>
              <ul className="p-6 space-y-3">
                {[
                  "Google Business Profile engagement remained strong throughout the reporting period.",
                  "Website click activity increased month-over-month, indicating stronger buyer intent from local search users.",
                  "Direction requests continued showing strong local brand recognition and trust signals.",
                  "User engagement patterns suggest growing visibility for restoration-related search terms throughout the Caseyville market.",
                  "Continued review acquisition and profile activity are helping reinforce local algorithm trust.",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust & Engagement Signals */}
            <div className="rounded-2xl card-elevated overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#0b1d3a] to-[#1a2f5c] text-white flex items-center gap-3">
                <ShieldCheck size={18} />
                <div>
                  <div className="text-base font-bold">Google Trust & Engagement Signals</div>
                  <div className="text-xs opacity-90">Local algorithm reinforcement indicators</div>
                </div>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Review Activity", value: "Active", icon: Star, tone: "up" },
                  { label: "Call Actions", value: "21 / mo", icon: Phone, tone: "up" },
                  { label: "Navigation Requests", value: "154 / mo", icon: Navigation, tone: "up" },
                  { label: "Website Visit Activity", value: "47 / mo", icon: MousePointerClick, tone: "up" },
                  { label: "Customer Interaction Growth", value: "+13.1% YoY", icon: TrendingUp, tone: "up" },
                  { label: "Profile Activity Consistency", value: "Stable", icon: Activity, tone: "up" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} className="text-primary" />
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
                      </div>
                      <div className="text-lg font-bold">{s.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SUBSECTION — REPUTATION & REVIEW GROWTH */}
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                03b · Reputation Intelligence
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
            </div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Reputation &amp; Review Growth</h3>
              <p className="text-muted-foreground">
                Month-over-month review velocity, Google rating progression, and trust signal expansion across the Caseyville profile.
              </p>
            </div>

            {/* TIMELINE CARDS */}
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {[
                { month: "March 2026", rating: 4.4, total: 123, growth: null, label: "Baseline", highlight: false },
                { month: "April 2026", rating: 4.6, total: 150, growth: "+27 reviews", pct: "+22.0%", label: "Acceleration", highlight: true },
                { month: "May 2026", rating: 4.6, total: 158, growth: "+8 reviews", pct: "+5.3%", label: "Sustained Growth", highlight: false },
              ].map((m) => {
                const filled = Math.floor(m.rating);
                const half = m.rating - filled >= 0.25 && m.rating - filled < 0.75;
                return (
                  <div
                    key={m.month}
                    className={`card-elevated p-6 relative overflow-hidden ${m.highlight ? "ring-2 ring-primary/30" : ""}`}
                  >
                    {m.highlight && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
                        Peak Velocity
                      </span>
                    )}
                    <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">{m.label}</div>
                    <div className="text-lg font-bold mb-4">{m.month}</div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i < filled
                                ? "fill-amber-400 text-amber-400"
                                : i === filled && half
                                ? "fill-amber-400/60 text-amber-400"
                                : "text-muted-foreground/30"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold leading-none">{m.rating.toFixed(1)}</span>
                    </div>

                    <div className="rounded-lg bg-muted/40 px-4 py-3 mb-3">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Reviews</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {m.total}
                        </div>
                        {m.pct && (
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                            <TrendingUp size={12} /> {m.pct}
                          </span>
                        )}
                      </div>
                    </div>

                    {m.growth ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 w-fit">
                        <ThumbsUp size={12} /> {m.growth}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Baseline reporting period</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* TREND VISUALIZATION + SCREENSHOT */}
            <div className="grid lg:grid-cols-3 gap-6 mb-10">
              <div className="lg:col-span-2 card-elevated rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <TrendingUp size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-base font-bold">Reputation Trend Visualization</div>
                      <div className="text-xs text-muted-foreground">Total review count progression · Mar → May 2026</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    +35 reviews in 60 days
                  </span>
                </div>
                <div className="p-6">
                  {(() => {
                    const points = [
                      { m: "March 2026", short: "Mar", v: 123, delta: null as string | null, peak: false },
                      { m: "April 2026", short: "Apr", v: 150, delta: "+27", peak: true },
                      { m: "May 2026", short: "May", v: 158, delta: "+8", peak: false },
                    ];
                    const W = 600, H = 180, PAD_X = 40, PAD_Y = 30;
                    const min = 110, max = 165;
                    const xs = points.map((_, i) => PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1));
                    const ys = points.map((p) => H - PAD_Y - ((p.v - min) / (max - min)) * (H - PAD_Y * 2));
                    // Smooth curve via cubic bezier
                    const path = xs.reduce((acc, x, i) => {
                      if (i === 0) return `M ${x} ${ys[i]}`;
                      const cx = (xs[i - 1] + x) / 2;
                      return `${acc} C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${x} ${ys[i]}`;
                    }, "");
                    const area = `${path} L ${xs[xs.length - 1]} ${H - PAD_Y} L ${xs[0]} ${H - PAD_Y} Z`;
                    return (
                      <div>
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48 overflow-visible" data-lightbox="false">
                          <defs>
                            <linearGradient id="repAreaGrad" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="repLineGrad" x1="0" x2="1" y1="0" y2="0">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" />
                            </linearGradient>
                            <filter id="repGlow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="3" result="b" />
                              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                          </defs>
                          {/* gridlines */}
                          {[0, 0.5, 1].map((t) => (
                            <line
                              key={t}
                              x1={PAD_X}
                              x2={W - PAD_X}
                              y1={PAD_Y + t * (H - PAD_Y * 2)}
                              y2={PAD_Y + t * (H - PAD_Y * 2)}
                              stroke="hsl(var(--border))"
                              strokeDasharray="3 4"
                              strokeWidth="1"
                            />
                          ))}
                          {/* area */}
                          <path d={area} fill="url(#repAreaGrad)">
                            <animate attributeName="opacity" from="0" to="1" dur="0.9s" fill="freeze" />
                          </path>
                          {/* line */}
                          <path
                            d={path}
                            fill="none"
                            stroke="url(#repLineGrad)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#repGlow)"
                            style={{ strokeDasharray: 800, strokeDashoffset: 0 }}
                          >
                            <animate attributeName="stroke-dashoffset" from="800" to="0" dur="1.2s" fill="freeze" />
                          </path>
                          {/* deltas between points */}
                          {points.map((p, i) => {
                            if (!p.delta || i === 0) return null;
                            const mx = (xs[i - 1] + xs[i]) / 2;
                            const my = (ys[i - 1] + ys[i]) / 2 - 14;
                            return (
                              <g key={`d-${i}`}>
                                <rect x={mx - 22} y={my - 11} width="44" height="20" rx="10" fill="hsl(var(--primary))" opacity="0.12" />
                                <text x={mx} y={my + 3} textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--primary))">
                                  {p.delta}
                                </text>
                              </g>
                            );
                          })}
                          {/* points */}
                          {points.map((p, i) => (
                            <g key={p.m}>
                              <circle cx={xs[i]} cy={ys[i]} r="10" fill="hsl(var(--primary))" opacity="0.18">
                                <animate attributeName="r" values="8;12;8" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                              </circle>
                              <circle cx={xs[i]} cy={ys[i]} r="5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                              <text x={xs[i]} y={ys[i] - 18} textAnchor="middle" fontSize="13" fontWeight="800" fill="hsl(var(--foreground))">
                                {p.v}
                              </text>
                              <text x={xs[i]} y={H - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--muted-foreground))" className="uppercase tracking-wider">
                                {p.short}
                              </text>
                            </g>
                          ))}
                        </svg>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {points.map((p) => (
                            <div
                              key={p.m}
                              className={`rounded-xl border px-3 py-2.5 flex items-center justify-between transition-all ${
                                p.peak
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-border bg-muted/30"
                              }`}
                            >
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.m}</div>
                                <div className="text-sm font-bold">{p.v} reviews</div>
                              </div>
                              {p.peak && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  Peak
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="card-elevated rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-[#0b1d3a] to-[#1a2f5c] text-white flex items-center gap-3">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                  <div>
                    <div className="text-base font-bold">Live Google Profile</div>
                    <div className="text-xs opacity-90">May 2026 snapshot</div>
                  </div>
                </div>
                <div className="p-4">
                  <img
                    src={mayReviewsImg}
                    alt="PuroClean Caseyville Google Business Profile showing 4.6 rating and 158 reviews"
                    className="w-full h-auto rounded-lg border border-border"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* TRUST SIGNAL CHIPS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Google Rating", value: "4.6 ★", icon: Star, note: "Up from 4.4" },
                { label: "Total Reviews", value: "158", icon: MessageSquare, note: "+35 in 60 days" },
                { label: "Review Velocity", value: "High", icon: TrendingUp, note: "Mar → Apr surge" },
                { label: "Sentiment Stability", value: "Strong", icon: ShieldCheck, note: "Diversified base" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="card-elevated p-5 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                      <div className="text-xl font-bold leading-tight">{s.value}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">{s.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INSIGHTS GRID */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl card-elevated overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-white flex items-center gap-3">
                  <Lightbulb size={18} />
                  <div>
                    <div className="text-base font-bold">Reputation Signal Analysis</div>
                    <div className="text-xs opacity-90">Strategic commentary · Mar – May 2026</div>
                  </div>
                </div>
                <ul className="p-6 space-y-3">
                  {[
                    "Review velocity increased significantly between March and April, with +27 new reviews acquired in a single reporting period.",
                    "Google rating strength improved from 4.4 to 4.6 stars, signaling a meaningful jump in customer satisfaction perception.",
                    "The business continues generating strong positive customer sentiment month over month.",
                    "Increased review activity is directly strengthening local ranking authority and trust signals across the Caseyville map pack.",
                    "Despite receiving a recent 1-star review in May, overall profile sentiment remained highly stable due to strong review diversification and a positive engagement history.",
                    "This type of reputation consistency helps protect local rankings against isolated negative sentiment and short-term volatility.",
                  ].map((line) => (
                    <li key={line} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl card-elevated overflow-hidden bg-gradient-to-br from-amber-50 via-white to-primary/5 border border-amber-200/60">
                <div className="px-6 py-4 border-b border-amber-200/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-400/20 border border-amber-300 flex items-center justify-center">
                    <Award size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="text-base font-bold">Why This Matters</div>
                    <div className="text-xs text-muted-foreground">Google trust signal commentary</div>
                  </div>
                </div>
                <div className="p-6 text-sm text-foreground/85 leading-relaxed">
                  Google increasingly uses engagement and reputation signals as ranking factors inside the Local Map Pack. Strong review growth, consistent customer sentiment, and active engagement behavior help reinforce visibility stability and local search authority.
                </div>
              </div>
            </div>
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
    </LightboxProvider>
  );
};

export default LocalSeoDashboard;
