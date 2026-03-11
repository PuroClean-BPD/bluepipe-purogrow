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
  },
  {
    location: "PuroClean of North Dallas",
    metric: "+142",
    metricLabel: "New 5-Star Reviews",
    description: "Our reputation management system helped this franchise collect over 142 new 5-star reviews in 6 months, making them the highest-rated restoration company in their market.",
    tags: ["Reputation", "Reviews"],
  },
  {
    location: "PuroClean of Tampa Bay",
    metric: "$380K",
    metricLabel: "Revenue from Marketing",
    description: "A comprehensive marketing system combining Google Ads, SEO, and social media generated over $380K in attributable revenue in the first year.",
    tags: ["Full System", "Google Ads", "SEO"],
  },
];

const CaseStudiesPreview = () => {
  return (
    <SectionWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-sm font-medium text-primary mb-3">Case Studies</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Real Results for Real Franchises
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
            className="card-elevated p-8"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="flex items-center gap-2 text-primary mb-6">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">{study.location}</span>
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">{study.metric}</p>
            <p className="text-sm text-muted-foreground mb-4">{study.metricLabel}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{study.description}</p>
            <div className="flex flex-wrap gap-2">
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
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
