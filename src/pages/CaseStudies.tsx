import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { TrendingUp, ArrowUpRight, Phone, MapPin, AlertTriangle, Wrench, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const caseStudies = [
  {
    location: "PuroClean of Southwest Houston",
    challenge: "This franchise was invisible in local search results. Despite serving a large metro area, they weren't appearing in Google Maps or generating inbound leads from online searches. Their Google Business Profile was incomplete, and they had no paid advertising strategy.",
    strategies: [
      "Full Google Business Profile optimization with service-area targeting",
      "Launched targeted Google Local Service Ads campaigns",
      "Built local citations across 40+ directories",
      "Implemented structured review request system",
    ],
    metrics: [
      { value: "+63%", label: "Qualified Leads" },
      { value: "-42%", label: "Cost Per Lead" },
      { value: "Top 3", label: "Google Maps Rank" },
    ],
    timeframe: "90 days",
    tags: ["Google Ads", "GBP", "SEO"],
  },
  {
    location: "PuroClean of North Dallas",
    challenge: "With only 12 Google reviews and a 3.8-star rating, this franchise was losing jobs to competitors with stronger online reputations. Homeowners and insurance adjusters were choosing higher-rated companies in the area.",
    strategies: [
      "Deployed automated review request system via SMS and email",
      "Created a frictionless review funnel for completed jobs",
      "Monitored and responded to all reviews within 24 hours",
      "Trained field technicians on review request best practices",
    ],
    metrics: [
      { value: "+142", label: "New 5-Star Reviews" },
      { value: "4.9", label: "Average Star Rating" },
      { value: "#1", label: "Rated in Market" },
    ],
    timeframe: "6 months",
    tags: ["Reputation", "Reviews"],
  },
  {
    location: "PuroClean of Tampa Bay",
    challenge: "This franchise had invested in marketing before but couldn't attribute revenue to any specific channel. They needed a full-stack system that tied every lead back to its source and proved ROI across Google Ads, SEO, and social media.",
    strategies: [
      "Built a comprehensive marketing system with full attribution tracking",
      "Managed Google Ads with conversion-optimized landing pages",
      "Executed local SEO targeting 10 high-intent keywords",
      "Maintained consistent social media presence for brand authority",
    ],
    metrics: [
      { value: "$380K", label: "Attributable Revenue" },
      { value: "12x", label: "Return on Ad Spend" },
      { value: "+89%", label: "Web Traffic Growth" },
    ],
    timeframe: "12 months",
    tags: ["Full System", "Google Ads", "SEO"],
  },
  {
    location: "PuroClean of Denver Metro",
    challenge: "Despite strong field operations, this franchise wasn't generating enough inbound phone calls to keep crews busy. Their Google Ads campaigns were poorly structured with broad keywords and low-quality traffic eating up budget.",
    strategies: [
      "Restructured Google Ads with hyper-local keyword targeting",
      "Optimized GBP for click-to-call conversions",
      "Implemented call tracking to measure lead quality",
      "A/B tested ad copy focused on emergency restoration urgency",
    ],
    metrics: [
      { value: "+91%", label: "Inbound Phone Calls" },
      { value: "56%", label: "Call Conversion Rate" },
      { value: "3.2x", label: "ROI in Month One" },
    ],
    timeframe: "4 months",
    tags: ["Google Ads", "GBP"],
  },
  {
    location: "PuroClean of Orlando East",
    challenge: "This franchise had zero organic search presence. They weren't ranking for any restoration-related keywords, and 100% of their leads came from paid ads or referrals — leaving them vulnerable to rising ad costs.",
    strategies: [
      "Targeted 18 local SEO keywords across service categories",
      "Created geo-focused service pages for each coverage area",
      "Built authority through local backlinks and press coverage",
      "Implemented technical SEO fixes including schema markup",
    ],
    metrics: [
      { value: "320+", label: "New Monthly Visitors" },
      { value: "18", label: "Page 1 Keywords" },
      { value: "+45%", label: "Organic Lead Increase" },
    ],
    timeframe: "8 months",
    tags: ["SEO", "Content"],
  },
  {
    location: "PuroClean of Phoenix West",
    challenge: "A newer franchise struggling to establish market presence in a competitive metro area. They had no reviews, no search visibility, and no consistent brand messaging across digital channels.",
    strategies: [
      "Launched full-stack marketing: Google Ads, SEO, social, and reputation",
      "Built social media presence with consistent community-focused content",
      "Deployed reputation management system from day one",
      "Managed Google Ads with budget optimization for new market entry",
    ],
    metrics: [
      { value: "$52K", label: "Monthly Revenue Growth" },
      { value: "200+", label: "Social Followers Gained" },
      { value: "4.8★", label: "Star Rating Achieved" },
    ],
    timeframe: "6 months",
    tags: ["Full System", "Social Media", "Reputation"],
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
            <p className="section-description-dark">
              See how BluePipe Digital's marketing systems are helping PuroClean franchise owners generate more leads, win more jobs, and grow their businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Aggregate metrics bar */}
      <SectionWrapper className="!pt-0 -mt-8 relative z-10">
        <motion.div
          className="card-elevated p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { value: "$432K+", label: "Revenue Generated" },
            { value: "142+", label: "5-Star Reviews Added" },
            { value: "91%", label: "Avg. Call Increase" },
            { value: "12x", label: "Best ROAS Achieved" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Case studies */}
      <SectionWrapper>
        <div className="space-y-10">
          {caseStudies.map((study, i) => (
            <motion.div
              key={study.location}
              className="card-elevated overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              {/* Header */}
              <div className="bg-secondary/50 px-7 py-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{study.location}</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    Results in {study.timeframe}
                  </span>
                  {study.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="p-7">
                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {study.metrics.map((m) => (
                    <div key={m.label} className="bg-secondary/60 rounded-xl p-4 text-center">
                      <p className="text-2xl md:text-3xl font-bold text-primary">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Challenge */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={15} className="text-accent" />
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">The Challenge</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{study.challenge}</p>
                  </div>

                  {/* Strategies */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench size={15} className="text-primary" />
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">What We Did</h4>
                    </div>
                    <ul className="space-y-2">
                      {study.strategies.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ArrowUpRight size={13} className="text-primary mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
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
