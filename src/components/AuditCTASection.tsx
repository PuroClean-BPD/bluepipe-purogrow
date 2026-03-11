import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AuditCTASection = () => {
  return (
    <section className="section-dark relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(to right, hsl(var(--dark-surface-foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--dark-surface-foreground)) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <div className="container-main py-24 lg:py-32 text-center relative z-10">
        <h2 className="font-bold mb-6 max-w-3xl mx-auto" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
          Ready to Grow Your <span className="gradient-text">PuroClean Franchise</span>?
        </h2>
        <p className="section-description-dark mx-auto mb-10">
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
