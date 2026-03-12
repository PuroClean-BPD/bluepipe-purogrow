import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { TrendingUp, ArrowUpRight, Phone, MapPin, AlertTriangle, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const caseStudies = [
  {
    location: "PuroClean of Southwest Houston",
    region: "Houston, TX",
    challenge: "Low visibility in a saturated restoration market with minimal online presence and inconsistent lead flow from digital channels.",
    strategies: [
      "Full Google Business Profile optimization",
      "Targeted Local Service Ads campaigns",
      "Local SEO with geo-focused landing pages",
      "Citation building across 60+ directories",
    ],
    metrics: [
      { value: "+63%", label: "Qualified Leads" },
      { value: "-42%", label: "Cost Per Lead" },
      { value: "Top 3", label: "Google Maps Ranking" },
      { value: "90", label: "Days to Results" },
    ],
    tags: ["Google Ads", "GBP", "SEO"],
    highlight: "+63% increase in qualified local leads within 90 days",
  },
  {
    location: "PuroClean of North Dallas",
    region: "Dallas, TX",
    challenge: "Weak online reputation with few reviews, losing jobs to competitors who had stronger social proof and higher star ratings.",
    strategies: [
      "Automated review request system",
      "Reputation monitoring & response management",
      "Google Business Profile optimization",
      "Review generation training for field teams",
    ],
    metrics: [
      { value: "+142", label: "New 5-Star Reviews" },
      { value: "4.9", label: "Average Star Rating" },
      { value: "#1", label: "Rated in Market" },
      { value: "6", label: "Months to Achieve" },
    ],
    tags: ["Reputation", "Reviews", "GBP"],
    highlight: "Became the highest-rated restoration company in their market",
  },
  {
    location: "PuroClean of Tampa Bay",
    region: "Tampa, FL",
    challenge: "No unified marketing strategy — fragmented ad spend, no SEO foundation, and zero tracking on which channels were actually driving revenue.",
    strategies: [
      "Full-stack marketing system deployment",
      "Google Ads with conversion tracking",
      "SEO targeting 15 high-intent keywords",
      "Social media content for brand authority",
    ],
    metrics: [
      { value: "$380K", label: "Attributable Revenue" },
      { value: "12x", label: "Return on Ad Spend" },
      { value: "+89%", label: "Web Traffic Growth" },
      { value: "Year 1", label: "Timeline" },
    ],
    tags: ["Full System", "Google Ads", "SEO"],
    highlight: "$380K in trackable revenue from marketing in the first year",
  },
  {
    location: "PuroClean of Denver Metro",
    region: "Denver, CO",
    challenge: "Phone wasn't ringing despite having a well-run operation. The franchise needed more inbound calls from homeowners and property managers.",
    strategies: [
      "Google Ads call-focused campaigns",
      "Click-to-call ad extensions",
      "GBP optimization for call conversions",
      "Keyword targeting for emergency services",
    ],
    metrics: [
      { value: "+91%", label: "Inbound Phone Calls" },
      { value: "56%", label: "Call-to-Job Rate" },
      { value: "3.2x", label: "ROI in Month One" },
      { value: "4", label: "Months of Growth" },
    ],
    tags: ["Google Ads", "GBP"],
    highlight: "91% more inbound calls with a 56% conversion rate",
  },
  {
    location: "PuroClean of Orlando East",
    region: "Orlando, FL",
    challenge: "Almost no organic search traffic — the website was invisible to Google and the franchise relied entirely on paid ads and referrals.",
    strategies: [
      "Technical SEO audit and fixes",
      "Content strategy targeting local queries",
      "On-page optimization for 18 keywords",
      "Monthly blog and service page creation",
    ],
    metrics: [
      { value: "320+", label: "New Monthly Visitors" },
      { value: "18", label: "Page 1 Keywords" },
      { value: "+45%", label: "Organic Lead Growth" },
      { value: "5", label: "Months to Page 1" },
    ],
    tags: ["SEO", "Content"],
    highlight: "18 keywords ranking on page 1 of Google within 5 months",
  },
  {
    location: "PuroClean of Phoenix West",
    region: "Phoenix, AZ",
    challenge: "Needed to build brand awareness in a new territory with no existing customer base, no reviews, and no digital footprint.",
    strategies: [
      "Full marketing system from day one",
      "Social media content calendar (20 posts/mo)",
      "Reputation management from launch",
      "Google Ads for immediate lead flow",
    ],
    metrics: [
      { value: "$52K", label: "Monthly Revenue Growth" },
      { value: "200+", label: "Social Followers Gained" },
      { value: "4.8", label: "Star Rating Achieved" },
      { value: "6", label: "Months to Scale" },
    ],
    tags: ["Full System", "Social Media", "Reputation"],
    highlight: "$52K in monthly revenue growth within 6 months of launch",
  },
];

const CaseStudies = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="page-header">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="section-label">Case Studies</p>
            <h1 className="font-bold mb-5" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
              Real Results for Real Franchises
            </h1>
            <p className="section-description-dark max-w-2xl">
              See how BluePipe Digital's marketing systems are helping PuroClean franchise owners generate more leads, win more jobs, and grow their businesses — with the metrics to prove it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Aggregate stats banner */}
      <SectionWrapper className="!pt-0 -mt-8 relative z-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {[
            { value: "6", label: "Franchise Partners" },
            { value: "$380K+", label: "Revenue Generated" },
            { value: "142+", label: "5-Star Reviews Added" },
            { value: "12x", label: "Avg. Return on Ad Spend" },
          ].map((stat) => (
            <div key={stat.label} className="card-elevated p-5 text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Case study cards */}
      <SectionWrapper>
        <div className="space-y-8">
          {caseStudies.map((study, i) => (
            <motion.div
              key={study.location}
              className="card-elevated overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
            >
              {/* Header */}
              <div className="bg-secondary/60 border-b border-border px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <TrendingUp size={16} />
                    <span className="text-sm font-semibold">{study.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    {study.region}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {study.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="p-7">
                {/* Highlight banner */}
                <div className="rounded-lg bg-primary/5 border border-primary/10 px-5 py-3 mb-7">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <BarChart3 size={15} className="shrink-0" />
                    {study.highlight}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-7">
                  {/* Left: Challenge + Strategy */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <AlertTriangle size={14} className="text-accent" />
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">The Challenge</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{study.challenge}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <Target size={14} className="text-primary" />
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Strategies Implemented</h3>
                      </div>
                      <ul className="space-y-2">
                        {study.strategies.map((s) => (
                          <li key={s} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <ArrowUpRight size={13} className="text-primary shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: Metrics grid */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 size={14} className="text-primary" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Measurable Results</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {study.metrics.map((m) => (
                        <div key={m.label} className="rounded-lg border border-border bg-secondary/40 p-4 text-center">
                          <p className="text-2xl font-bold text-foreground">{m.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <AuditCTASection />
      <Footer />
    </div>
  );
};

export default CaseStudies;
