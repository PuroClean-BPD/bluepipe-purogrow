import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Shield, MapPin, Users, Wrench } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="section-dark relative overflow-hidden">
      {/* Background grid lines */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(var(--dark-surface-foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--dark-surface-foreground)) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      {/* Subtle gradient orb */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[140px] -translate-y-1/3 translate-x-1/4" style={{ background: 'hsl(var(--primary) / 0.06)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" style={{ background: 'hsl(230 100% 65% / 0.04)' }} />
      
      <div className="container-main pt-36 pb-24 lg:pt-44 lg:pb-36 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8" style={{ background: 'hsl(var(--primary) / 0.08)', borderColor: 'hsl(var(--primary) / 0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>Official PuroClean Marketing Partner</span>
          </div>
          
          <h1 className="font-bold leading-[1.06] mb-6">
            <span style={{ color: 'hsl(var(--primary))' }}>Digital Marketing Built for</span>{" "}
            <span className="font-extrabold" style={{ color: '#d12229' }}>PuroClean</span>{" "}
            <span style={{ color: 'hsl(var(--dark-surface-foreground))' }}>Franchise Growth</span>
          </h1>
          
          <p className="text-lg lg:text-xl leading-relaxed max-w-2xl mb-10" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.65)' }}>
            BluePipe Digital helps PuroClean franchise owners generate more local restoration leads through proven digital marketing systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

          {/* Quick trust signals */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 justify-center lg:justify-start">
            {["Strategic Digital Marketing Partner for PuroClean", "Results in 30 days", "Franchise-specific strategies"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={15} style={{ color: 'hsl(var(--dark-surface-foreground) / 0.4)' }} />
                <span className="text-sm" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.5)' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Credibility proof strip */}
          <motion.div
            className="mt-12 pt-10 border-t"
            style={{ borderColor: 'hsl(var(--dark-surface-foreground) / 0.08)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Shield, text: "Strategic Digital Marketing Partner for PuroClean" },
                { icon: Wrench, text: "Built Specifically for Restoration Companies" },
                { icon: MapPin, text: "Local Search & Lead Generation Specialists" },
                { icon: Users, text: "Trusted by Franchise Owners" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                  style={{ background: 'hsl(var(--dark-surface-foreground) / 0.03)', border: '1px solid hsl(var(--dark-surface-foreground) / 0.06)' }}
                >
                  <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                    <Icon size={14} style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <span className="text-xs font-medium leading-snug" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.6)' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
