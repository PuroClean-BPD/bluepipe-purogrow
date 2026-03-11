import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const caseStudies = [
  {
    location: "PuroClean of Southwest Houston",
    metric: "+63%",
    metricLabel: "Increase in Local Leads",
    description: "By optimizing their Google Business Profile and launching targeted Local Service Ads, this franchise saw a 63% increase in qualified leads within 90 days.",
    results: ["63% more qualified leads", "42% lower cost per lead", "Top 3 Google Maps ranking"],
    tags: ["Google Ads", "GBP", "SEO"],
  },
  {
    location: "PuroClean of North Dallas",
    metric: "+142",
    metricLabel: "New 5-Star Reviews",
    description: "Our reputation management system helped this franchise collect over 142 new 5-star reviews in 6 months, making them the highest-rated restoration company in their market.",
    results: ["142 new 5-star reviews", "4.9 average rating", "#1 rated in market"],
    tags: ["Reputation", "Reviews"],
  },
  {
    location: "PuroClean of Tampa Bay",
    metric: "$380K",
    metricLabel: "Revenue from Marketing",
    description: "A comprehensive marketing system combining Google Ads, SEO, and social media generated over $380K in attributable revenue in the first year.",
    results: ["$380K attributable revenue", "12x return on ad spend", "89% increase in web traffic"],
    tags: ["Full System", "Google Ads", "SEO"],
  },
  {
    location: "PuroClean of Denver Metro",
    metric: "+91%",
    metricLabel: "Increase in Phone Calls",
    description: "Strategic Google Ads campaigns combined with GBP optimization resulted in a 91% increase in inbound phone calls from potential customers in just 4 months.",
    results: ["91% more phone calls", "56% conversion rate", "3.2x ROI in month one"],
    tags: ["Google Ads", "GBP"],
  },
  {
    location: "PuroClean of Orlando East",
    metric: "320+",
    metricLabel: "Monthly Website Visitors",
    description: "SEO optimization and content strategy increased organic website traffic by over 320 monthly visitors, establishing this franchise as the local authority for restoration services.",
    results: ["320+ new monthly visitors", "18 keywords on page 1", "45% organic lead increase"],
    tags: ["SEO", "Content"],
  },
  {
    location: "PuroClean of Phoenix West",
    metric: "$52K",
    metricLabel: "Monthly Revenue Growth",
    description: "Full-stack marketing including social media, reputation management, and Google Ads drove $52K in monthly revenue growth within the first 6 months of partnership.",
    results: ["$52K monthly growth", "200+ social followers gained", "4.8 star rating achieved"],
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

      <SectionWrapper>
        <div className="grid md:grid-cols-2 gap-5">
          {caseStudies.map((study, i) => (
            <motion.div
              key={study.location}
              className="card-elevated p-7"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2 text-primary mb-4">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">{study.location}</span>
              </div>
              <p className="text-4xl font-bold text-foreground mb-1">{study.metric}</p>
              <p className="text-sm text-muted-foreground mb-4">{study.metricLabel}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{study.description}</p>
              
              <div className="space-y-2.5 mb-6">
                {study.results.map((result) => (
                  <div key={result} className="flex items-center gap-2.5 text-sm text-foreground">
                    <ArrowUpRight size={14} className="text-primary shrink-0" />
                    {result}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {study.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
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
