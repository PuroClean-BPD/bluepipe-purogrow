import SectionWrapper from "./SectionWrapper";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  return (
    <SectionWrapper mesh>
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Mail size={28} className="text-primary" />
        </div>
        <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-5">
          Get Marketing Insights for Your Franchise
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
          Join hundreds of PuroClean franchise owners receiving weekly digital marketing tips, industry trends, and growth strategies.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-xl border border-border bg-background px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <Button variant="gradient" size="lg" type="submit">
            Subscribe
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground/50 mt-4">
          No spam. Unsubscribe anytime. Trusted by 500+ franchise owners.
        </p>
      </div>
    </SectionWrapper>
  );
};

export default NewsletterSection;
