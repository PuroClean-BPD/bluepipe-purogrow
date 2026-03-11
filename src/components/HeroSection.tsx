import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="section-dark relative overflow-hidden">
      {/* Mesh gradient orbs */}
      <div className="glow-orb w-[800px] h-[800px] bg-primary/8 top-[-300px] right-[-200px]" />
      <div className="glow-orb w-[600px] h-[600px] bg-accent/5 bottom-[-200px] left-[-100px]" />
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--dark-surface-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--dark-surface-foreground)) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />
      
      <div className="container-main pt-36 pb-24 lg:pt-44 lg:pb-36 relative z-10">
        <div className="grid lg:grid-cols-[1fr,0.8fr] gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <div className="badge-pill mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Official PuroClean Marketing Partner</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-dark-surface-foreground leading-[1.06] mb-8">
              Digital Marketing Built for{" "}
              <span className="gradient-text">PuroClean Franchise Growth</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-dark-surface-foreground/65 max-w-xl mb-10 leading-relaxed">
              BluePipe Digital helps PuroClean franchise owners generate more local restoration leads through proven digital marketing systems.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
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

            {/* Trust signals */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-dark-surface-foreground/50 text-sm">
              {["No contracts required", "Results in 30 days", "Franchise-specific strategies"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats dashboard preview */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              <div className="card-dark p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark-surface-foreground/70">Growth Dashboard</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">Live</span>
                </div>
                
                {[
                  { value: "250+", label: "Franchise Locations", change: "+12%" },
                  { value: "47%", label: "Avg. Lead Increase", change: "+8.3%" },
                  { value: "$2.1M", label: "Revenue Generated", change: "+23%" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center justify-between py-4 border-b border-dark-surface-foreground/5 last:border-0"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  >
                    <div>
                      <p className="text-2xl font-bold text-dark-surface-foreground">{stat.value}</p>
                      <p className="text-sm text-dark-surface-foreground/45 mt-0.5">{stat.label}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                      {stat.change}
                    </span>
                  </motion.div>
                ))}
              </div>
              
              {/* Floating accent card */}
              <motion.div 
                className="absolute -bottom-6 -left-6 card-dark p-4 flex items-center gap-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <ArrowRight size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark-surface-foreground">+63% Leads</p>
                  <p className="text-xs text-dark-surface-foreground/45">This quarter</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
