import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="section-dark relative overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      
      <div className="container-main pt-32 pb-20 lg:pt-40 lg:pb-32 relative z-10">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-medium text-primary">Official PuroClean Marketing Partner</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-dark-surface-foreground leading-[1.08] mb-6">
            Digital Marketing Built for{" "}
            <span className="gradient-text">PuroClean Franchise Growth</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-dark-surface-foreground/70 max-w-2xl mb-10">
            BluePipe Digital helps PuroClean franchise owners generate more local restoration leads through proven digital marketing systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="gradient" size="xl" asChild>
              <Link to="/free-audit">
                Get Your Free Marketing Audit
                <ArrowRight className="ml-1" size={18} />
              </Link>
            </Button>
            <Button variant="hero-secondary" size="xl" asChild>
              <Link to="/contact">
                <Play size={16} className="mr-1" />
                Book a Strategy Call
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-dark-surface-foreground/10">
            {[
              { value: "250+", label: "Franchise Locations" },
              { value: "47%", label: "Avg. Lead Increase" },
              { value: "$2.1M", label: "Revenue Generated" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <p className="text-2xl lg:text-3xl font-bold text-dark-surface-foreground">{stat.value}</p>
                <p className="text-sm text-dark-surface-foreground/50 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
