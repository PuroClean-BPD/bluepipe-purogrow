import SectionWrapper from "./SectionWrapper";
import { MapPin, Megaphone, Star, Share2, Search, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  {
    icon: MapPin,
    title: "Google Business Profile Management",
    description: "Optimize your Google Business Profile to rank higher in local searches and Google Maps. Be the first thing customers see.",
    highlight: "Local Visibility",
  },
  {
    icon: Megaphone,
    title: "Managed Google Ads & LSA",
    description: "Targeted advertising that puts your franchise in front of homeowners actively searching for restoration services.",
    highlight: "Paid Advertising",
  },
  {
    icon: Star,
    title: "Managed Reputation Management",
    description: "Build a 5-star reputation that converts. Collect, manage, and showcase reviews across all major platforms.",
    highlight: "Trust & Reviews",
  },
  {
    icon: Share2,
    title: "Managed Social Media",
    description: "Consistent, professional social content that keeps your franchise top-of-mind in your local community.",
    highlight: "Brand Awareness",
  },
  {
    icon: Search,
    title: "Search Engine Optimization",
    description: "Rank higher in organic search results for restoration keywords in your service area with franchise-specific SEO.",
    highlight: "Organic Growth",
  },
];

const SolutionsSection = () => {
  return (
    <SectionWrapper id="solutions" mesh>
      <div className="text-center mb-20">
        <div className="badge-pill mx-auto mb-6">Marketing Solutions</div>
        <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-5">
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
            className={`card-elevated p-8 group relative overflow-hidden ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            {/* Subtle gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <solution.icon size={22} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">{solution.highlight}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                {solution.title}
                <ArrowUpRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default SolutionsSection;
