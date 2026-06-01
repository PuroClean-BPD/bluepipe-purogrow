import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import bluepipeLogo from "@/assets/bluepipe-logo.png";
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
  Sparkles,
  Target,
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
    setup: "$500 one-time build fee",
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
    setup: "$500 one-time build fee",
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
    setup: "$500 one-time build fee",
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
  if (v === true) return <Check className="w-4 h-4 mx-auto text-primary" strokeWidth={3} />;
  if (v === false) return <X className="w-3.5 h-3.5 mx-auto opacity-30" />;
  return <span className="text-[13px] font-semibold">{v}</span>;
};

const SeoPackagesPrint = () => {
  return (
    <>
      {/* Print-specific styles — tuned for landscape US Letter, exactly 2 pages */}
      <style>{`
        @page { size: 11in 8.5in; margin: 0.25in; }
        @media print {
          html, body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-page {
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            height: 8in;
            max-height: 8in;
            overflow: hidden;
          }
          .print-page:last-child { page-break-after: auto; break-after: auto; }
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

        {/* ============== PAGE 1 — SEO Growth Packages ============== */}
        <section className="print-page section-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-8 py-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] tracking-[0.18em] font-semibold text-white/80 uppercase">
                    Strategic Digital Marketing Solutions for PuroClean Franchises
                  </span>
                </div>
                <h1 className="text-white font-bold leading-[1.05] text-[2rem]">
                  Local Visibility &amp; <span className="gradient-text">Growth Solutions</span> for{" "}
                  <span style={{ color: PURO_RED }}>PuroClean</span> Franchise Owners
                </h1>
                <p className="mt-2 text-white/65 text-[15px] max-w-3xl leading-snug">
                  BluePipe Digital helps PuroClean franchise owners increase local visibility, generate more
                  qualified restoration leads, and expand market authority using proven digital marketing systems.
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-center justify-center pl-6">
                <img
                  src={bluepipeLogo}
                  alt="BluePipe Digital"
                  className="h-16 w-auto object-contain"
                />
                <div className="mt-1.5 text-white/40 text-[10px]">BluePipeDigital.com</div>
              </div>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {seoPackages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`relative rounded-xl p-4 flex flex-col ${
                    pkg.featured
                      ? "bg-gradient-to-br from-primary/20 via-blue-600/10 to-transparent border-2 border-primary/60 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.6)]"
                      : "bg-white/[0.04] border border-white/10"
                  }`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white text-[10px] font-bold tracking-wider shadow-lg">
                      ★ MOST POPULAR
                    </div>
                  )}
                  <div className="text-[10px] tracking-[0.18em] font-bold text-primary mb-1">
                    {pkg.featured ? "AGGRESSIVE GROWTH" : pkg.label}
                  </div>
                  <h3 className="text-white text-lg font-bold">{pkg.name}</h3>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-white text-3xl font-bold leading-none">${pkg.price}</span>
                    <span className="text-white/50 text-sm">/month</span>
                  </div>
                  <div className="text-white/55 text-[12.5px] mt-1">{pkg.setup}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 w-fit">
                    <span className="text-white/60 text-[11.5px]">First month:</span>
                    <span className="text-white text-[12.5px] font-bold">{pkg.firstMonth}</span>
                  </div>

                  <ul className="mt-3 space-y-1.5 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary mt-[3px] shrink-0" strokeWidth={3} />
                        <span className="text-white/85 text-[13.5px] leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-2 border-t border-white/10">
                    <div className="text-[10px] tracking-wider font-semibold text-white/40 uppercase mb-0.5">
                      Best for
                    </div>
                    <p className="text-white/70 text-[12.5px] leading-snug">{pkg.bestFor}</p>
                  </div>
                </div>
              ))}
            </div>


            {/* Footer strip */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-white/40 text-[10px]">
              <div className="flex items-center gap-2">
                <span style={{ color: PURO_RED }}>●</span>
                <span>BluePipe Digital × PuroClean — Strategic Marketing Partner</span>
              </div>
              
            </div>
          </div>
        </section>

        {/* ============== PAGE 2 — Comparison Chart ============== */}
        <section className="print-page section-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-8 py-5">
            {/* Header */}
            <div className="flex items-end justify-between mb-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 mb-2">
                  <Star className="w-3 h-3 text-primary" />
                  <span className="text-[10px] tracking-[0.18em] font-bold text-primary uppercase">
                    Side-by-Side Comparison
                  </span>
                </div>
                <h1 className="text-white font-bold leading-[1.05] text-[2rem]">
                  Compare <span className="gradient-text">SEO Growth Packages</span>
                </h1>
                <p className="mt-2 text-white/65 text-[15px] max-w-3xl leading-snug">
                  Find the right visibility and expansion strategy for your market goals. Each package
                  scales from foundational local SEO to full multi-market dominance.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-white/40 text-[10px] tracking-wider uppercase">Powered by</div>
                <div className="text-white font-bold">BluePipe Digital</div>
              </div>
            </div>

            {/* Comparison table — full width, more spacious */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white shadow-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[hsl(var(--dark-surface))] to-[hsl(var(--dark-surface-muted))] text-white">
                    <th className="text-left text-[12.5px] font-semibold tracking-wider uppercase px-5 py-3 w-[34%]">
                      Feature
                    </th>
                    <th className="text-center text-[12.5px] font-semibold px-3 py-3">Builder SEO</th>
                    <th className="text-center text-[12.5px] font-semibold px-3 py-3 bg-primary/30 relative">
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                      Booster SEO ★
                    </th>
                    <th className="text-center text-[12.5px] font-semibold px-3 py-3">Dominator SEO</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-secondary/40"}>
                        <td className="px-5 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-[14px] font-medium text-foreground">{row.label}</span>
                          </div>
                        </td>
                        {row.values.map((v, j) => (
                          <td
                            key={j}
                            className={`text-center px-3 py-2 ${j === 1 ? "bg-primary/[0.06]" : ""}`}
                          >
                            <Cell v={v} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="bg-gradient-to-r from-secondary/60 to-secondary/30">
                    <td className="px-5 py-3 text-[14px] font-bold text-foreground">First Month Total</td>
                    <td className="text-center px-3 py-3 text-[14px] font-bold">$1,350</td>
                    <td className="text-center px-3 py-3 text-[14px] font-bold bg-primary/10 text-primary">
                      $1,850
                    </td>
                    <td className="text-center px-3 py-3 text-[14px] font-bold">$2,750</td>
                  </tr>
                </tbody>
              </table>
            </div>


            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-white/40 text-[10px]">
              <div className="flex items-center gap-2">
                <span style={{ color: PURO_RED }}>●</span>
                <span>BluePipeDigital.com · Strategic Marketing Partner for PuroClean</span>
              </div>
              
            </div>
          </div>
        </section>

        {/* ============== PAGE 2 — PipeLine Plus ============== */}
        <section className="print-page section-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-8 py-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 mb-2">
                  <Rocket className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] tracking-[0.18em] font-bold text-primary uppercase">
                    Market Expansion System
                  </span>
                </div>
                <h1 className="text-white font-bold leading-[1.05] text-[2rem]">
                  Expand Beyond Your <span className="gradient-text">Core Territory</span>
                </h1>
                <p className="mt-2 text-white/65 text-[15px] max-w-3xl leading-snug">
                  PipeLine Plus helps PuroClean franchise owners strategically expand visibility into surrounding
                  high-intent markets using advanced local SEO and lead generation systems.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white/40 text-[10px] tracking-wider uppercase">PipeLine Plus</div>
                <div className="text-white font-bold text-base">Expansion System</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5 flex-1">
              {/* Left col */}
              <div className="col-span-7 flex flex-col gap-4">
                {/* Expansion diagram */}
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-5">
                  <div className="text-[10px] tracking-wider font-bold text-white/50 uppercase mb-4">
                    Territory Expansion Flow
                  </div>
                  <div className="flex items-center justify-between gap-2">
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
                            </div>
                            <div className="text-white text-[13px] font-bold mt-2">{node.label}</div>
                            <div className="text-white/45 text-[11px]">{node.sub}</div>
                          </div>
                          {i < arr.length - 1 && (
                            <div className="flex items-center px-1">
                              <ArrowRight className="w-5 h-5 text-primary/70" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Benefits */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-white text-base font-bold mb-2.5">Why PipeLine Plus Works</h3>
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    {[
                      { icon: Globe, title: "Expand Visibility", body: "Reach surrounding markets where customers are actively searching for restoration services." },
                      { icon: TrendingUp, title: "Increase Lead Volume", body: "Generate more high-intent calls and local opportunities." },
                      { icon: Award, title: "Strengthen Authority", body: "Become the dominant restoration brand across multiple service areas." },
                    ].map((b) => {
                      const Icon = b.icon;
                      return (
                        <div key={b.title} className="rounded-xl bg-white/[0.04] border border-white/10 p-4 flex flex-col">
                          <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-2.5">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-white text-[13px] font-bold">{b.title}</div>
                          <p className="text-white/60 text-[11.5px] leading-snug mt-1">{b.body}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strategic callout */}
                <div className="rounded-xl bg-gradient-to-r from-primary/25 via-blue-600/15 to-transparent border border-primary/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-[14px]">More Than an Add-On — A Market Expansion System</div>
                      <p className="text-white/70 text-[12px] mt-1 leading-snug">
                        PipeLine Plus helps PuroClean franchise owners strategically expand into surrounding
                        markets with advanced local SEO, territory-focused visibility strategies, and scalable
                        lead generation systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right col: pricing */}
              <div className="col-span-5 flex flex-col">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden flex flex-col flex-1">
                  <div className="px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-primary/20 to-transparent">
                    <div className="text-[10px] tracking-wider font-bold text-primary uppercase">
                      PipeLine Plus
                    </div>
                    <div className="text-white font-bold text-base">Expansion Pricing</div>
                    <div className="text-white/50 text-[11px]">Priced by target city population</div>
                  </div>
                  <table className="w-full flex-1">
                    <tbody>
                      {pipelineTiers.map((t, i) => (
                        <tr
                          key={t.range}
                          className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                        >
                          <td className="px-5 py-2.5 text-white/85 text-[12.5px]">
                            <span className="inline-flex items-center gap-2">
                              <Target className="w-3 h-3 text-primary/70" />
                              {t.range}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-right text-white font-bold text-[12.5px]">
                            {t.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-white/40 text-[10px]">
              <div className="flex items-center gap-2">
                <span style={{ color: PURO_RED }}>●</span>
                <span>BluePipeDigital.com · Market Expansion System for PuroClean Franchises</span>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SeoPackagesPrint;
