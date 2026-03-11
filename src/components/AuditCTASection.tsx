import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const AuditCTASection = () => {
  return (
    <section className="section-dark relative overflow-hidden">
      <div className="glow-orb w-[800px] h-[800px] bg-primary/8 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 mesh-gradient" />
      
      <div className="container-main py-28 lg:py-40 text-center relative z-10">
        <div className="badge-pill mx-auto mb-8">
          <Sparkles size={16} />
          <span>Free Marketing Audit</span>
        </div>
        
        <h2 className="text-3xl lg:text-6xl font-bold text-dark-surface-foreground mb-6 max-w-4xl mx-auto leading-tight">
          Ready to Grow Your <span className="gradient-text">PuroClean Franchise</span>?
        </h2>
        <p className="text-dark-surface-foreground/55 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Get a free, no-obligation marketing audit that shows exactly where your franchise stands online and how to generate more local restoration leads.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="gradient" size="xl" asChild>
            <Link to="/free-audit">
              Get Your Free Marketing Audit
              <ArrowRight size={18} className="ml-1" />
            </Link>
          </Button>
          <Button variant="hero-secondary" size="xl" asChild>
            <Link to="/contact">Book a Strategy Call</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AuditCTASection;
