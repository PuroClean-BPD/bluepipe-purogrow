import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  ArrowRight,
  Printer,
  Star,
  MapPin,
  Building2,
  Rocket,
  TrendingUp,
  Users,
  Sparkles,
  Target,
  BarChart3,
  Search,
  Globe,
  Award,
  Megaphone,
  Link2,
  FileText,
} from "lucide-react";

const PURO_RED = "#d12229";

const seoPackages = [
  {
    label: "FOUNDATION GROWTH",
    name: "Builder SEO",
    price: "850",
    setup: "$500 one-time setup fee",
    firstMonth: "$1,350",
    featured: false,
    features: [
      "Google Business Profile Optimization",
      "Reputation Management",
      "Citation Building",
      "5 SEO Keywords",
      "Local Schema Optimization",
      "Geo-Focused Content",
      "Authority & Backlink Building",
    ],
    bestFor: "Franchise owners looking to establish stronger local visibility.",
    cta: "GET STARTED",
  },
  {
    label: "MOST POPULAR",
    name: "Booster SEO",
    price: "1,350",
    setup: "$500 one-time setup fee",
    firstMonth: "$1,850",
    featured: true,
    features: [
      "Everything in Builder",
      "10 SEO Keywords",
      "Expanded Geo Content",
      "Higher Authority Backlinks",
      "Semi-Annual Press Releases",
      "PipeLine Plus Lead Generation",
      "1 Additional City up to 50K population",
    ],
    bestFor: "Franchise owners ready to aggressively grow local market visibility.",
    cta: "SCALE MY MARKET",
  },
  {
    label: "MARKET DOMINANCE",
    name: "Dominator SEO",
    price: "2,250",
    setup: "$500 one-time setup fee",
    firstMonth: "$2,750",
    featured: false,
    features: [
      "Everything in Booster",
      "15 SEO Keywords",
      "Elite On-Page Optimization",
      "Aggressive Authority Building",
      "Quarterly Press Releases",
      "PipeLine Plus Lead Generation",
      "Up to 3 Cities totaling 150K population",
    ],
    bestFor: "Franchise owners looking to dominate multiple surrounding markets.",
    cta: "DOMINATE YOUR MARKET",
  },
];

const comparisonRows: { icon: any; label: string; values: (string | boolean)[] }[] = [
  { icon: MapPin, label: "GBP Optimization", values: [true, true, true] },
  { icon: Star, label: "Reputation Management", values: [true, true, true] },
  { icon: Link2, label: "Citation Building", values: [true, true, true] },
  { icon: Search, label: "SEO Keywords", values: ["5", "10", "15"] },
  { icon: FileText, label: "Local Schema", values: [true, true, true] },
  { icon: Globe, label: "Geo-Focused Content", values: [true, "Expanded", "Elite"] },
  { icon: Award, label: "Authority Building", values: [true, "Higher", "Aggressive"] },
  { icon: Megaphone, label: "Press Releases", values: [false, "Semi-Annual", "Quarterly"] },
  { icon: Rocket, label: "PipeLine Plus", values: [false, true, true] },
  { icon: TrendingUp, label: "Market Expansion", values: ["—", "1 City (50K)", "Up to 3 Cities (150K)"] },
];

const pipelineTiers = [
  { range: "Under 25K Population", price: "$299/mo" },
  { range: "25K–50K Population", price: "$499/mo" },
  { range: "50K–100K Population", price: "$749/mo" },
  { range: "100K–150K Population", price: "$999/mo" },
  { range: "150K–250K Population", price: "$1,299/mo" },
  { range: "250K–500K Population", price: "$1,799/mo" },
  { range: "500K–750K Population", price: "$2,499/mo" },
  { range: "750K–1M Population", price: "$3,499/mo" },
  { range: "1M+ Population", price: "Custom Quote" },
];

const Cell = ({ v }: { v: string | boolean }) => {
  if (v === true) return <Check className="w-5 h-5 mx-auto text-primary" strokeWidth={3} />;
  if (v === false) return <X className="w-4 h-4 mx-auto opacity-30" />;
  return <span className="text-sm font-semibold">{v}</span>;
};

const SeoPackagesPrint = () => {
  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @page { size: 11in 8.5in; margin: 0.35in; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .print-page {
            page-break-after: always;
            break-after: page;
            min-height: auto !important;
          }
          .print-page:last-child { page-break-after: auto; }
        }
        .print-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>

      <div className="bg-[hsl(var(--dark-surface))] min-h-screen">
        {/* Toolbar */}
        <div className="no-print sticky top-0 z-50 bg-[hsl(var(--dark-surface))]/95 backdrop-blur border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">BluePipe Digital</div>
                <div className="text-white/50 text-xs">SEO Packages Print Sheet</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/pricing" className="text-white/70 hover:text-white text-sm">← Back</Link>
              <Button onClick={() => window.print()} variant="gradient" size="sm">
                <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
              </Button>
            </div>
          </div>
        </div>

        {/* ============== PAGE 1 ============== */}
        <section className="print-page section-dark relative overflow-hidden">
          {/* Grid bg */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Gradient orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-10 py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] tracking-[0.18em] font-semibold text-white/80 uppercase">
                    Strategic Digital Marketing Solutions for PuroClean Franchises
                  </span>
                </div>
                <h1 className="text-white font-bold leading-[1.05] text-[2.4rem]">
                  Local Visibility &amp; <span className="gradient-text">Growth Solutions</span> for{" "}
                  <span style={{ color: PURO_RED }}>PuroClean</span> Franchise Owners
                </h1>
                <p className="mt-4 text-white/65 text-base max-w-2xl leading-relaxed">
                  BluePipe Digital helps PuroClean franchise owners increase local visibility, generate more
                  qualified restoration leads, and expand market authority using proven digital marketing
                  systems.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/free-audit">
                    REQUEST A FREE AUDIT <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <div className="mt-3 text-white/40 text-xs">BluePipeDigital.com</div>
              </div>
            </div>

            {/* Pricing cards */}
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold">Choose Your Growth Strategy</h2>
                <p className="text-white/55 text-sm mt-1">
                  Scalable local SEO solutions designed specifically for restoration businesses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 mt-5">
              {seoPackages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    pkg.featured
                      ? "bg-gradient-to-br from-primary/20 via-blue-600/10 to-transparent border-2 border-primary/60 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)] scale-[1.02]"
                      : "bg-white/[0.04] border border-white/10"
                  }`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white text-[10px] font-bold tracking-wider shadow-lg">
                      ★ MOST POPULAR
                    </div>
                  )}
                  <div className="text-[10px] tracking-[0.18em] font-bold text-primary mb-2">
                    {pkg.featured ? "AGGRESSIVE GROWTH" : pkg.label}
                  </div>
                  <h3 className="text-white text-xl font-bold">{pkg.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-white text-3xl font-bold">${pkg.price}</span>
                    <span className="text-white/50 text-sm">/month</span>
                  </div>
                  <div className="text-white/50 text-xs mt-1">{pkg.setup}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 w-fit">
                    <span className="text-white/60 text-[10px]">First month:</span>
                    <span className="text-white text-xs font-bold">{pkg.firstMonth}</span>
                  </div>

                  <ul className="mt-4 space-y-2 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary mt-1 shrink-0" strokeWidth={3} />
                        <span className="text-white/85 text-[12px] leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-[10px] tracking-wider font-semibold text-white/40 uppercase mb-1">
                      Best for
                    </div>
                    <p className="text-white/70 text-[11px] leading-snug">{pkg.bestFor}</p>
                  </div>

                  <Button
                    asChild
                    variant={pkg.featured ? "gradient" : "outline"}
                    size="sm"
                    className={`mt-4 w-full ${
                      !pkg.featured ? "bg-white/5 border-white/20 text-white hover:bg-white/10" : ""
                    }`}
                  >
                    <Link to="/free-audit">{pkg.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Footer strip */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-white/40 text-[11px]">
              <div className="flex items-center gap-2">
                <span style={{ color: PURO_RED }}>●</span>
                <span>BluePipe Digital × PuroClean — Strategic Marketing Partner</span>
              </div>
              <div>Page 1 of 2 · SEO Growth Packages</div>
            </div>
          </div>
        </section>

        {/* ============== PAGE 1B — Comparison ============== */}
        <section className="print-page bg-white relative">
          <div className="max-w-[1400px] mx-auto px-10 py-10">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-[10px] tracking-[0.18em] font-bold text-primary uppercase mb-2">
                  Side-by-Side Comparison
                </div>
                <h2 className="text-3xl font-bold text-foreground">Compare SEO Growth Packages</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Find the right visibility and expansion strategy for your market goals.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Powered by</div>
                <div className="font-bold text-foreground">BluePipe Digital</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[hsl(var(--dark-surface))] to-[hsl(var(--dark-surface-muted))] text-white">
                    <th className="text-left text-xs font-semibold tracking-wider uppercase px-5 py-3.5 w-[34%]">
                      Feature
                    </th>
                    <th className="text-center text-xs font-semibold px-4 py-3.5">Builder SEO</th>
                    <th className="text-center text-xs font-semibold px-4 py-3.5 bg-primary/30 relative">
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                      Booster SEO ★
                    </th>
                    <th className="text-center text-xs font-semibold px-4 py-3.5">Dominator SEO</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-secondary/40"}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{row.label}</span>
                          </div>
                        </td>
                        {row.values.map((v, j) => (
                          <td
                            key={j}
                            className={`text-center px-4 py-3 ${j === 1 ? "bg-primary/[0.06]" : ""}`}
                          >
                            <Cell v={v} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="bg-gradient-to-r from-secondary/60 to-secondary/30">
                    <td className="px-5 py-3.5 text-sm font-bold text-foreground">First Month Total</td>
                    <td className="text-center px-4 py-3.5 text-sm font-bold">$1,350</td>
                    <td className="text-center px-4 py-3.5 text-sm font-bold bg-primary/10 text-primary">
                      $1,850
                    </td>
                    <td className="text-center px-4 py-3.5 text-sm font-bold">$2,750</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA banner */}
            <div className="mt-7 rounded-2xl bg-gradient-to-r from-[hsl(var(--dark-surface))] via-primary/40 to-[hsl(var(--dark-surface))] p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              <div className="relative">
                <h3 className="text-white text-xl font-bold">Ready to Grow Your Market Visibility?</h3>
                <p className="text-white/75 text-sm mt-1 max-w-2xl">
                  Schedule a complimentary marketing audit and discover where your next growth opportunities exist.
                </p>
              </div>
              <Button variant="gradient" size="lg" asChild className="relative shrink-0">
                <Link to="/free-audit">
                  REQUEST A FREE AUDIT <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-between text-muted-foreground text-[11px]">
              <div className="flex items-center gap-2">
                <span style={{ color: PURO_RED }}>●</span>
                <span>BluePipeDigital.com · Strategic Marketing Partner for PuroClean</span>
              </div>
              <div>Page 1 of 2 · Comparison</div>
            </div>
          </div>
        </section>

        {/* ============== PAGE 2 ============== */}
        <section className="print-page section-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-10 py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 mb-3">
                  <Rocket className="w-3 h-3 text-primary" />
                  <span className="text-[10px] tracking-[0.18em] font-bold text-primary uppercase">
                    Market Expansion System
                  </span>
                </div>
                <h1 className="text-white font-bold leading-[1.05] text-[2.2rem]">
                  Expand Beyond Your <span className="gradient-text">Core Territory</span>
                </h1>
                <p className="mt-3 text-white/65 text-sm max-w-2xl leading-relaxed">
                  PipeLine Plus helps PuroClean franchise owners strategically expand visibility into surrounding
                  high-intent markets using advanced local SEO and lead generation systems.
                </p>
              </div>
              <div className="text-right">
                <div className="text-white/40 text-[10px] tracking-wider uppercase">PipeLine Plus</div>
                <div className="text-white font-bold">Expansion System</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Left col: diagram + benefits */}
              <div className="col-span-7 space-y-5">
                {/* Expansion diagram */}
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
                  <div className="text-[10px] tracking-wider font-bold text-white/50 uppercase mb-4">
                    Territory Expansion Flow
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {[
                      { icon: MapPin, label: "Primary Market", sub: "Core service area" },
                      { icon: Building2, label: "Secondary Market", sub: "Surrounding cities" },
                      { icon: Rocket, label: "Expansion Territory", sub: "New growth zones" },
                    ].map((node, i, arr) => {
                      const Icon = node.icon;
                      return (
                        <div key={node.label} className="flex items-center flex-1">
                          <div className="flex-1 text-center">
                            <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_24px_-4px_hsl(var(--primary))]">
                              <Icon className="w-6 h-6 text-white" />
                              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-md -z-10" />
                            </div>
                            <div className="text-white text-xs font-bold mt-2">{node.label}</div>
                            <div className="text-white/45 text-[10px]">{node.sub}</div>
                          </div>
                          {i < arr.length - 1 && (
                            <div className="flex items-center px-1">
                              <ArrowRight className="w-4 h-4 text-primary/70" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-white text-lg font-bold mb-3">Why PipeLine Plus Works</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Globe, title: "Expand Visibility", body: "Reach surrounding markets where customers are actively searching for restoration services." },
                      { icon: TrendingUp, title: "Increase Lead Volume", body: "Generate more high-intent calls and local opportunities." },
                      { icon: Award, title: "Strengthen Authority", body: "Become the dominant restoration brand across multiple service areas." },
                    ].map((b) => {
                      const Icon = b.icon;
                      return (
                        <div key={b.title} className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-2">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-white text-sm font-bold">{b.title}</div>
                          <p className="text-white/60 text-[11px] leading-snug mt-1">{b.body}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strategic callout */}
                <div className="rounded-2xl bg-gradient-to-r from-primary/25 via-blue-600/15 to-transparent border border-primary/30 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold">More Than an Add-On — A Market Expansion System</div>
                      <p className="text-white/70 text-[12px] mt-1 leading-relaxed">
                        PipeLine Plus helps PuroClean franchise owners strategically expand into surrounding
                        markets with advanced local SEO, territory-focused visibility strategies, and scalable
                        lead generation systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right col: pricing */}
              <div className="col-span-5">
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-transparent">
                    <div className="text-[10px] tracking-wider font-bold text-primary uppercase">
                      PipeLine Plus
                    </div>
                    <div className="text-white font-bold text-lg">Expansion Pricing</div>
                    <div className="text-white/50 text-[11px]">Priced by target city population</div>
                  </div>
                  <table className="w-full">
                    <tbody>
                      {pipelineTiers.map((t, i) => (
                        <tr
                          key={t.range}
                          className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                        >
                          <td className="px-5 py-2.5 text-white/85 text-[12px] flex items-center gap-2">
                            <Target className="w-3 h-3 text-primary/70" />
                            {t.range}
                          </td>
                          <td className="px-5 py-2.5 text-right text-white font-bold text-[12px]">
                            {t.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-primary p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />
              <div className="relative">
                <h3 className="text-white text-xl font-bold">Ready to Expand Into More Local Markets?</h3>
                <p className="text-white/85 text-sm mt-1 max-w-2xl">
                  See where your next growth opportunities exist with a custom market expansion audit.
                </p>
              </div>
              <Button variant="hero-secondary" size="lg" asChild className="relative shrink-0 bg-white text-primary hover:bg-white/90">
                <Link to="/free-audit">
                  REQUEST A MARKET EXPANSION AUDIT <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-5 flex items-center justify-between text-white/40 text-[11px]">
              <div className="flex items-center gap-2">
                <span style={{ color: PURO_RED }}>●</span>
                <span>BluePipeDigital.com · Market Expansion System for PuroClean Franchises</span>
              </div>
              <div>Page 2 of 2 · PipeLine Plus</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SeoPackagesPrint;
