import SectionWrapper from "./SectionWrapper";
import { MapPin, Megaphone, Star, Share2, Search } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  {
    icon: MapPin,
    title: "Google Business Profile Management",
    description: "Optimize your Google Business Profile to rank higher in local searches and Google Maps. Be the first thing customers see.",
  },
  {
    icon: Megaphone,
    title: "Managed Google Ads & Local Service Ads",
    description: "Targeted advertising that puts your franchise in front of homeowners actively searching for restoration services.",
  },
  {
    icon: Star,
    title: "Managed Reputation Management",
    description: "Build a 5-star reputation that converts. Collect, manage, and showcase reviews across all major platforms.",
  },
  {
    icon: Share2,
    title: "Managed Social Media Posting",
    description: "Consistent, professional content that keeps your franchise top-of-mind in your local community.",
  },
  {
    icon: Search,
    title: "Search Engine Optimization",
    description: "Rank higher in organic search for restoration keywords in your service area with franchise-specific SEO.",
  },
];

const SolutionsSection = () => {
  return (
    <SectionWrapper id="solutions">
      <div className="text-center mb-16">
        <p className="section-label">Marketing Solutions</p>
        <h2 className="font-bold text-foreground mb-5">
          Everything You Need to <span className="gradient-text">Grow Your Franchise</span>
        </h2>
        <p className="section-description mx-auto">
          Five integrated marketing systems designed to help PuroClean franchise owners generate more local restoration leads.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {solutions.map((solution, i) => (
          <motion.div
            key={solution.title}
            className="card-elevated p-7 group"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div className="icon-box mb-5 group-hover:scale-105 transition-transform duration-300">
              <solution.icon size={22} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2.5">{solution.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default SolutionsSection;
