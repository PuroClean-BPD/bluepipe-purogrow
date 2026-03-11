import SectionWrapper from "./SectionWrapper";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const caseStudies = [
  {
    location: "PuroClean of Southwest Houston",
    metric: "+63%",
    metricLabel: "Increase in Local Leads",
    description: "By optimizing their Google Business Profile and launching targeted Local Service Ads, this franchise saw a 63% increase in qualified leads within 90 days.",
    tags: ["Google Ads", "GBP", "SEO"],
    color: "from-primary/10 to-primary/5",
  },
  {
    location: "PuroClean of North Dallas",
    metric: "+142",
    metricLabel: "New 5-Star Reviews",
    description: "Our reputation management system helped this franchise collect over 142 new 5-star reviews in 6 months, becoming the highest-rated in their market.",
    tags: ["Reputation", "Reviews"],
    color: "from-accent/10 to-accent/5",
  },
  {
    location: "PuroClean of Tampa Bay",
    metric: "$380K",
    metricLabel: "Revenue from Marketing",
    description: "A comprehensive marketing system combining Google Ads, SEO, and social media generated over $380K in attributable revenue in year one.",
    tags: ["Full System", "Google Ads", "SEO"],
    color: "from-emerald-500/10 to-emerald-500/5",
  },
];

const CaseStudiesPreview = () => {
  return (
    <SectionWrapper variant="light-alt">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="badge-pill mb-6">Case Studies</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Real Results for <span className="gradient-text">Real Franchises</span>
          </h2>
        </div>
        <Button variant="secondary-pill" size="lg" asChild>
          <Link to="/case-studies">
            View All Case Studies
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {caseStudies.map((study, i) => (
          <motion.div
            key={study.location}
            className="card-elevated p-8 relative overflow-hidden group"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            {/* Gradient accent top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${study.color}`} />
            
            <div className="flex items-center gap-2 text-primary mb-8">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">{study.location}</span>
            </div>
            <p className="text-5xl font-bold text-foreground mb-1">{study.metric}</p>
            <p className="text-sm font-medium text-muted-foreground mb-5">{study.metricLabel}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">{study.description}</p>
            <div className="flex flex-wrap gap-2">
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default CaseStudiesPreview;
