import SectionWrapper from "./SectionWrapper";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const NewsletterSection = () => {
  return (
    <SectionWrapper>
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Mail size={22} className="text-primary" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Get Marketing Insights for Your Franchise
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Join hundreds of PuroClean franchise owners receiving weekly digital marketing tips, industry trends, and growth strategies.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
          <Button variant="gradient" size="lg" type="submit">
            Subscribe
          </Button>
        </form>
        <p className="text-xs text-muted-foreground/60 mt-3">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </SectionWrapper>
  );
};

export default NewsletterSection;
