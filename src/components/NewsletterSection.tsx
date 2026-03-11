import SectionWrapper from "./SectionWrapper";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const NewsletterSection = () => {
  return (
    <SectionWrapper variant="muted">
      <div className="max-w-2xl mx-auto text-center">
        <div className="icon-box mx-auto mb-6">
          <Mail size={22} className="text-primary" />
        </div>
        <h2 className="font-bold text-foreground mb-4">
          Get Marketing Insights for Your Franchise
        </h2>
        <p className="section-description mx-auto mb-8">
          Join hundreds of PuroClean franchise owners receiving weekly digital marketing tips, industry trends, and growth strategies.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="form-input flex-1"
          />
          <Button variant="gradient" size="lg" type="submit">
            Subscribe
          </Button>
        </form>
        <p className="text-xs text-muted-foreground/60 mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </SectionWrapper>
  );
};

export default NewsletterSection;
