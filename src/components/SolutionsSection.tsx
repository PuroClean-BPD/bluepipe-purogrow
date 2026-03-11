import SectionWrapper from "./SectionWrapper";
import { MapPin, Megaphone, Star, Share2, Search } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  {
    icon: MapPin,
    title: "Google Business Profile Management",
    description: "Optimize your Google Business Profile to rank higher in local searches and Google Maps. We ensure your franchise is the first thing customers see when they search for restoration services in your area.",
  },
  {
    icon: Megaphone,
    title: "Managed Google Ads & Local Service Ads",
    description: "Targeted advertising campaigns that put your franchise in front of homeowners and property managers actively searching for restoration services. Maximize your ad spend with data-driven optimization.",
  },
  {
    icon: Star,
    title: "Managed Reputation Management",
    description: "Build a 5-star reputation that converts. We help you collect, manage, and showcase customer reviews across all major platforms to build trust and win more jobs.",
  },
  {
    icon: Share2,
    title: "Managed Social Media Posting",
    description: "Consistent, professional social media content that keeps your franchise top-of-mind in your local community. Engage homeowners and referral partners with relevant, branded content.",
  },
  {
    icon: Search,
    title: "Search Engine Optimization",
    description: "Rank higher in organic search results for restoration-related keywords in your service area. Our SEO strategies are built specifically for multi-location franchise businesses.",
  },
];

const SolutionsSection = () => {
  return (
    <SectionWrapper id="solutions">
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-primary mb-3">Marketing Solutions</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Everything You Need to <span className="gradient-text">Grow Your Franchise</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Five integrated marketing systems designed to help PuroClean franchise owners generate more local restoration leads.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((solution, i) => (
          <motion.div
            key={solution.title}
            className="card-elevated p-8 group"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
              <solution.icon size={22} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3">{solution.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default SolutionsSection;
