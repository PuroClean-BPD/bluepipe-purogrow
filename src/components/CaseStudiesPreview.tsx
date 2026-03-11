import SectionWrapper from "./SectionWrapper";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Phone } from "lucide-react";
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <p className="section-label">Case Studies</p>
          <h2 className="font-bold text-foreground">
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

      <div className="grid md:grid-cols-3 gap-5">
        {caseStudies.map((study, i) => (
          <motion.div
            key={study.location}
            className="card-elevated p-7"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div className="flex items-center gap-2 text-primary mb-5">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">{study.location}</span>
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">{study.metric}</p>
            <p className="text-sm text-muted-foreground mb-4">{study.metricLabel}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{study.description}</p>
            <div className="flex flex-wrap gap-2">
              {study.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA after case study metrics */}
      <motion.div
        className="mt-14 text-center"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground mb-5">
          Want results like these for your franchise?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gradient" size="lg" asChild>
            <Link to="/free-audit">
              See Your Growth Opportunities
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
          <Button variant="secondary-pill" size="lg" asChild>
            <Link to="/contact">
              <Phone size={14} className="mr-1" />
              Book a Strategy Call
            </Link>
          </Button>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default CaseStudiesPreview;
