import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  Search,
  Globe,
  Star,
  MapPin,
  FileText,
  Link2,
  Megaphone,
  MousePointerClick,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Share2,
  Heart,
  TrendingUp,
  Target,
  DollarSign,
  Rocket,
  Users,
  Building2,
  Sparkles,
  ArrowDown,
  Compass,
  Zap,
} from "lucide-react";

/* ─── SEO TIER DATA ─── */
const seoTiers = [
  {
    name: "Builder SEO",
    tagline: "Targeted local growth",
    buildFee: 500,
    monthly: 750,
    firstMonth: 1250,
    features: [
      "Full Google Business Profile optimization",
      "Reputation management system",
      "Citation building",
      "Monthly profile updates",
      "5 keyword SEO targeting",
      "On-page optimization",
      "Local schema implementation",
      "Geo-focused content",
      "Press & backlink authority building",
    ],
    keywords: 5,
    featured: false,
  },
  {
    name: "Booster SEO",
    tagline: "Accelerated market reach",
    buildFee: 500,
    monthly: 1350,
    firstMonth: 1850,
    features: [
      "Everything in Builder",
      "10 keyword SEO targeting",
      "Expanded on-page optimization",
      "Advanced geo-focused content",
      "Higher authority backlinks",
      "Semi-annual press releases",
      "Includes PipeLine Plus Lead Generation for 1 city up to 50K population",
    ],
    keywords: 10,
    featured: true,
  },
  {
    name: "Dominator SEO",
    tagline: "Total market domination",
    buildFee: 500,
    monthly: 2250,
    firstMonth: 2750,
    features: [
      "Everything in Booster",
      "15 keyword SEO targeting",
      "Elite on-page optimization",
      "High-frequency geo content",
      "Aggressive backlink strategy",
      "Quarterly press releases",
      "Includes PipeLine Plus Lead Generation for up to 3 cities totaling up to 150K population",
    ],
    keywords: 15,
    featured: false,
  },
];

/* ─── SOCIAL MEDIA DATA ─── */
const socialTiers = [
  { name: "Presence", posts: 10, price: 350, icon: MessageSquare },
  { name: "Growth", posts: 15, price: 450, icon: TrendingUp },
  { name: "Authority", posts: 20, price: 550, icon: Star },
];

/* ─── COMPARISON TABLE FEATURES ─── */
const comparisonRows: {
  label: string;
  icon: React.ElementType;
  values: (string | boolean)[];
}[] = [
  { label: "GBP Optimization", icon: Globe, values: [true, true, true] },
  { label: "Reputation Management", icon: Star, values: [true, true, true] },
  { label: "Citation Building", icon: Link2, values: [true, true, true] },
  { label: "Monthly Profile Updates", icon: FileText, values: [true, true, true] },
  { label: "SEO Keywords Targeted", icon: Search, values: ["5", "10", "15"] },
  { label: "On-Page Optimization", icon: MapPin, values: [true, true, true] },
  { label: "Local Schema Implementation", icon: Globe, values: [true, true, true] },
  { label: "Geo-Focused Content", icon: MapPin, values: ["Standard", "Advanced", "High-Frequency"] },
  { label: "Backlink Authority Building", icon: Link2, values: ["Standard", "Higher", "Aggressive"] },
  { label: "Press Releases", icon: Megaphone, values: [false, "Semi-Annual", "Quarterly"] },
  {
    label: "PipeLine Plus Lead Generation",
    icon: Rocket,
    values: [false, "1 City (up to 50K pop.)", "Up to 3 Cities (150K total pop.)"],
  },
  { label: "Build Fee (one-time)", icon: DollarSign, values: ["$500", "$500", "$500"] },
  { label: "Monthly Management", icon: BarChart3, values: ["$750/mo", "$1,350/mo", "$2,250/mo"] },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

/* ─── COMPONENT ─── */
const Pricing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HEADER ── */}
      <section className="page-header">
        <div className="container-main text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="section-label">Pricing</p>
            <h1 className="font-bold mb-5" style={{ color: "hsl(var(--dark-surface-foreground))" }}>
              Marketing Packages Built for PuroClean
            </h1>
            <p className="section-description-dark mx-auto">
              Transparent pricing designed for franchise owners. No hidden fees — just clear, results-driven marketing
              services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 1 — GBP + SEO PACKAGES            */}
      {/* ═══════════════════════════════════════════ */}
      <SectionWrapper>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <Search size={14} />
            Section 1
          </div>
          <h2 className="text-foreground font-bold mb-3">Google Business Profile &amp; SEO Packages</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
            Combine Google Business Profile optimization with increasing levels of local SEO to dominate your service
            area.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {seoTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`rounded-2xl p-6 border flex flex-col transition-all duration-300 ${
                tier.featured
                  ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary)),0_16px_48px_-12px_hsla(210,100%,50%,0.18)] relative bg-card"
                  : "card-elevated"
              }`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
              <p className="text-xs text-muted-foreground mb-5">{tier.tagline}</p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-foreground">{fmt(tier.monthly)}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                {fmt(tier.buildFee)} one-time build fee · First month {fmt(tier.firstMonth)}
              </p>

              <ul className="space-y-2.5 mb-7 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={15} className="text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button variant={tier.featured ? "gradient" : "secondary-pill"} size="lg" className="w-full" asChild>
                <Link to="/free-audit">
                  Get Your Free Audit
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          className="mt-16 rounded-2xl border bg-card overflow-hidden"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-foreground">Compare GBP &amp; SEO Packages</h3>
            <p className="text-sm text-muted-foreground mt-1">See exactly what's included in each tier.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left py-3 px-5 font-semibold text-foreground">Feature</th>
                  {seoTiers.map((t) => (
                    <th key={t.name} className="text-center py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, ri) => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.label} className={ri % 2 === 0 ? "" : "bg-secondary/30"}>
                      <td className="py-3 px-5 flex items-center gap-2 text-foreground font-medium">
                        <Icon size={14} className="text-muted-foreground shrink-0" />
                        {row.label}
                      </td>
                      {row.values.map((v, vi) => (
                        <td key={vi} className="text-center py-3 px-4">
                          {v === true ? (
                            <Check size={16} className="text-primary mx-auto" />
                          ) : v === false ? (
                            <span className="text-muted-foreground/40">—</span>
                          ) : (
                            <span className="text-foreground text-xs font-medium">{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════ */}
      {/* PIPELINE PLUS — MARKET EXPANSION SYSTEM     */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden section-dark">
        {/* Ambient gradient backdrop */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-[40%] h-[50%] bg-gradient-to-tl from-primary/20 to-transparent blur-3xl rounded-full" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--dark-surface-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--dark-surface-foreground)) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <motion.div
          className="container-main py-24 lg:py-32"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {/* ── HEADER ── */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 border"
              style={{
                background: "hsl(var(--dark-surface-foreground) / 0.06)",
                borderColor: "hsl(var(--dark-surface-foreground) / 0.15)",
                color: "hsl(var(--dark-surface-foreground))",
              }}
            >
              <Sparkles size={14} className="text-primary" />
              PipeLine Plus — Market Expansion System
            </div>
            <h2
              className="font-bold mb-4"
              style={{ color: "hsl(var(--dark-surface-foreground))" }}
            >
              A Scalable Local Market Expansion System
            </h2>
            <p
              className="text-base lg:text-lg leading-relaxed"
              style={{ color: "hsl(var(--dark-surface-foreground) / 0.7)" }}
            >
              Designed to help PuroClean franchise owners grow visibility and lead generation
              <span style={{ color: "hsl(var(--dark-surface-foreground))" }} className="font-semibold"> beyond their primary territory</span>.
            </p>
          </div>

          {/* ── HIGHLIGHTED CALLOUT + EXPANSION DIAGRAM ── */}
          <div className="grid lg:grid-cols-5 gap-6 mb-16 max-w-6xl mx-auto">
            {/* Callout */}
            <motion.div
              className="lg:col-span-3 rounded-2xl p-8 border relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--dark-surface-foreground) / 0.04))",
                borderColor: "hsl(var(--primary) / 0.35)",
              }}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-5 border border-primary/30">
                  <Compass size={22} className="text-primary" />
                </div>
                <h3
                  className="text-xl lg:text-2xl font-bold mb-3"
                  style={{ color: "hsl(var(--dark-surface-foreground))" }}
                >
                  Strategic Territory Expansion
                </h3>
                <p
                  className="text-sm lg:text-base leading-relaxed"
                  style={{ color: "hsl(var(--dark-surface-foreground) / 0.75)" }}
                >
                  <span className="font-semibold" style={{ color: "hsl(var(--dark-surface-foreground))" }}>PipeLine Plus</span> helps PuroClean franchise owners strategically expand into surrounding service areas using advanced local SEO and market-targeted lead generation systems.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-7">
                  {[
                    { icon: Target, label: "Targeted SEO" },
                    { icon: TrendingUp, label: "Lead Growth" },
                    { icon: Zap, label: "Fast Activation" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="rounded-xl border p-3 text-center"
                      style={{
                        background: "hsl(var(--dark-surface-foreground) / 0.04)",
                        borderColor: "hsl(var(--dark-surface-foreground) / 0.1)",
                      }}
                    >
                      <Icon size={16} className="text-primary mx-auto mb-1.5" />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: "hsl(var(--dark-surface-foreground) / 0.85)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Expansion diagram */}
            <motion.div
              className="lg:col-span-2 rounded-2xl p-6 border flex flex-col"
              style={{
                background: "hsl(var(--dark-surface-foreground) / 0.04)",
                borderColor: "hsl(var(--dark-surface-foreground) / 0.12)",
              }}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p
                className="text-[11px] font-semibold tracking-wider uppercase mb-4 text-center"
                style={{ color: "hsl(var(--dark-surface-foreground) / 0.5)" }}
              >
                Territory Expansion Flow
              </p>

              <div className="flex flex-col items-center gap-2 flex-1 justify-center">
                {[
                  { label: "Primary Market", sub: "Your core territory", icon: MapPin, tone: "primary" },
                  { label: "Secondary Market", sub: "Adjacent service area", icon: Building2, tone: "mid" },
                  { label: "Expansion Territory", sub: "New growth markets", icon: Rocket, tone: "accent" },
                ].map((node, i, arr) => {
                  const Icon = node.icon;
                  return (
                    <div key={node.label} className="w-full flex flex-col items-center">
                      <motion.div
                        className="w-full rounded-xl border px-4 py-3 flex items-center gap-3"
                        style={{
                          background:
                            node.tone === "accent"
                              ? "linear-gradient(90deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.08))"
                              : node.tone === "mid"
                              ? "hsl(var(--primary) / 0.1)"
                              : "hsl(var(--dark-surface-foreground) / 0.06)",
                          borderColor:
                            node.tone === "accent"
                              ? "hsl(var(--primary) / 0.5)"
                              : "hsl(var(--dark-surface-foreground) / 0.15)",
                        }}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.15 + i * 0.12 }}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <div className="text-left">
                          <p
                            className="text-sm font-semibold leading-tight"
                            style={{ color: "hsl(var(--dark-surface-foreground))" }}
                          >
                            {node.label}
                          </p>
                          <p
                            className="text-[11px] leading-tight"
                            style={{ color: "hsl(var(--dark-surface-foreground) / 0.55)" }}
                          >
                            {node.sub}
                          </p>
                        </div>
                      </motion.div>
                      {i < arr.length - 1 && (
                        <div className="py-1.5">
                          <ArrowDown size={16} className="text-primary/70" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── PRICING TABLE ── */}
          <motion.div
            className="max-w-4xl mx-auto rounded-2xl border overflow-hidden"
            style={{
              background: "hsl(var(--dark-surface-foreground) / 0.04)",
              borderColor: "hsl(var(--dark-surface-foreground) / 0.12)",
              boxShadow: "0 20px 60px -20px hsla(210,100%,50%,0.35)",
            }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="p-6 border-b flex items-start justify-between gap-4 flex-wrap"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--primary) / 0.15), transparent)",
                borderColor: "hsl(var(--dark-surface-foreground) / 0.1)",
              }}
            >
              <div>
                <h3
                  className="text-lg font-bold flex items-center gap-2"
                  style={{ color: "hsl(var(--dark-surface-foreground))" }}
                >
                  <TrendingUp size={18} className="text-primary" />
                  Market Expansion Pricing
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "hsl(var(--dark-surface-foreground) / 0.6)" }}
                >
                  Scales with target market population — add as many territories as you need.
                </p>
              </div>
              <div
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                style={{
                  color: "hsl(var(--dark-surface-foreground))",
                  background: "hsl(var(--primary) / 0.15)",
                  borderColor: "hsl(var(--primary) / 0.35)",
                }}
              >
                Booster &amp; Dominator Add-On
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      background: "hsl(var(--dark-surface-foreground) / 0.04)",
                      borderColor: "hsl(var(--dark-surface-foreground) / 0.1)",
                    }}
                  >
                    <th
                      className="text-left py-3 px-5 font-semibold"
                      style={{ color: "hsl(var(--dark-surface-foreground))" }}
                    >
                      Market Size
                    </th>
                    <th
                      className="text-right py-3 px-5 font-semibold"
                      style={{ color: "hsl(var(--dark-surface-foreground))" }}
                    >
                      Monthly Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "Under 25K Population", price: "$299/month", icon: Users },
                    { size: "25K – 50K Population", price: "$499/month", icon: Users },
                    { size: "50K – 100K Population", price: "$749/month", icon: MapPin },
                    { size: "100K – 150K Population", price: "$999/month", icon: MapPin },
                    { size: "150K – 250K Population", price: "$1,299/month", icon: Building2 },
                    { size: "250K – 500K Population", price: "$1,799/month", icon: Building2 },
                    { size: "500K – 750K Population", price: "$2,499/month", icon: TrendingUp },
                    { size: "750K – 1M Population", price: "$3,499/month", icon: TrendingUp },
                    { size: "1M+ Population", price: "Custom Quote", icon: Rocket },
                  ].map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <tr
                        key={row.size}
                        className="border-b last:border-0 transition-colors hover:bg-primary/5"
                        style={{
                          borderColor: "hsl(var(--dark-surface-foreground) / 0.06)",
                          background:
                            i % 2 === 0
                              ? "transparent"
                              : "hsl(var(--dark-surface-foreground) / 0.025)",
                        }}
                      >
                        <td className="py-3.5 px-5">
                          <div
                            className="flex items-center gap-2.5 font-medium"
                            style={{ color: "hsl(var(--dark-surface-foreground))" }}
                          >
                            <Icon size={15} className="text-primary shrink-0" />
                            {row.size}
                          </div>
                        </td>
                        <td
                          className="text-right py-3.5 px-5 font-semibold"
                          style={{ color: "hsl(var(--dark-surface-foreground))" }}
                        >
                          {row.price}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── GROWTH MESSAGING ── */}
          <motion.div
            className="max-w-3xl mx-auto mt-16 text-center"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold mb-4 border"
              style={{
                background: "hsl(var(--primary) / 0.12)",
                borderColor: "hsl(var(--primary) / 0.3)",
                color: "hsl(var(--dark-surface-foreground))",
              }}
            >
              <TrendingUp size={12} className="text-primary" />
              Growth Insight
            </div>
            <p
              className="text-base lg:text-lg leading-relaxed"
              style={{ color: "hsl(var(--dark-surface-foreground) / 0.8)" }}
            >
              Many restoration companies dominate their core territory but miss opportunities in surrounding markets.
              <span style={{ color: "hsl(var(--dark-surface-foreground))" }} className="font-semibold"> PipeLine Plus</span> helps franchise owners strategically expand visibility where additional high-intent restoration leads already exist.
            </p>
          </motion.div>

          {/* ── FINAL CTA BLOCK ── */}
          <motion.div
            className="max-w-3xl mx-auto mt-12 rounded-2xl p-8 lg:p-10 text-center border relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.06))",
              borderColor: "hsl(var(--primary) / 0.4)",
            }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <h3
                className="text-2xl lg:text-3xl font-bold mb-3"
                style={{ color: "hsl(var(--dark-surface-foreground))" }}
              >
                Ready to Expand Into More Local Markets?
              </h3>
              <p
                className="text-sm lg:text-base max-w-xl mx-auto mb-7 leading-relaxed"
                style={{ color: "hsl(var(--dark-surface-foreground) / 0.7)" }}
              >
                See where your next growth opportunities exist with a custom market expansion audit.
              </p>
              <Button variant="gradient" size="lg" asChild>
                <Link to="/free-audit">
                  Request a Market Expansion Audit
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 2 — SOCIAL MEDIA                   */}
      {/* ═══════════════════════════════════════════ */}
      <SectionWrapper className="bg-secondary/40">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <Share2 size={14} />
            Section 2
          </div>
          <h2 className="text-foreground font-bold mb-3">Social Media Management</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
            Consistent social media content builds brand credibility, supports SEO visibility, and drives community
            engagement — keeping your franchise top-of-mind in your local market.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {socialTiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                className="rounded-2xl p-6 border card-elevated flex flex-col text-center"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Social Media {tier.name}</h3>
                <p className="text-xs text-muted-foreground mb-5">{tier.posts} posts per month</p>
                <div className="flex items-baseline gap-1 justify-center mb-6">
                  <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>

                <Button variant="secondary-pill" size="lg" className="w-full mt-auto" asChild>
                  <Link to="/free-audit">
                    Get Started
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 3 — GOOGLE ADS + LSA               */}
      {/* ═══════════════════════════════════════════ */}
      <SectionWrapper>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <MousePointerClick size={14} />
            Section 3
          </div>
          <h2 className="text-foreground font-bold mb-3">Google Ads &amp; Local Service Ads Management</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
            Drive immediate leads with managed pay-per-click and Local Service Ads — optimized, monitored, and refined
            every month.
          </p>
        </div>

        <motion.div
          className="max-w-xl mx-auto rounded-2xl border card-elevated p-8"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Managed Google Ads + LSA</h3>
              <p className="text-xs text-muted-foreground">Full-service paid advertising management</p>
            </div>
          </div>

          <ul className="space-y-2.5 mb-8">
            {[
              "Google Ads campaign management",
              "Google Local Service Ads management",
              "Keyword targeting & bid optimization",
              "Ad copy management",
              "Lead quality monitoring",
              "Local Service Ads verification support",
              "Invalid lead dispute management",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check size={15} className="text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <div className="rounded-xl bg-secondary/60 p-5 mb-7">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-foreground">$600</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              $400 one-time build fee · First month $1,000 + ad spend
            </p>
            <p className="text-xs text-muted-foreground">
              Google ad spend is paid directly to Google and is separate from management fees.
            </p>
          </div>

          <Button variant="gradient" size="lg" className="w-full" asChild>
            <Link to="/free-audit">
              Get Your Free Marketing Audit
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </motion.div>
      </SectionWrapper>

      {/* ── BOTTOM CTA ── */}
      <AuditCTASection />
      <Footer />
    </div>
  );
};

export default Pricing;
