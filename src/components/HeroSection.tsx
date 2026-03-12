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

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 justify-center lg:justify-start">
            {["No contracts required", "Results in 30 days", "Franchise-specific strategies"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={15} style={{ color: 'hsl(var(--dark-surface-foreground) / 0.4)' }} />
                <span className="text-sm" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.5)' }}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
