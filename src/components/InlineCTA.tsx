import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface InlineCTAProps {
  variant?: "light" | "dark";
  headline?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

const InlineCTA = ({
  variant = "light",
  headline = "See Your Growth Opportunities",
  description = "Get a free, no-obligation marketing audit and discover exactly how to generate more local restoration leads.",
  primaryLabel = "Get Your Free Marketing Audit",
  primaryHref = "/free-audit",
  secondaryLabel = "Book a Strategy Call",
  secondaryHref = "/contact",
}: InlineCTAProps) => {
  const isDark = variant === "dark";

  return (
    <motion.div
      className={`rounded-2xl p-8 lg:p-10 text-center mt-14 ${
        isDark
          ? "border"
          : "bg-gradient-to-br from-[hsl(var(--dark-surface))] to-[hsl(var(--dark-surface-muted))]"
      }`}
      style={isDark ? {
        background: 'hsl(var(--dark-surface-foreground) / 0.04)',
        borderColor: 'hsl(var(--dark-surface-foreground) / 0.1)',
      } : undefined}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <h3
        className="text-xl lg:text-2xl font-bold mb-3"
        style={{ color: isDark ? 'hsl(var(--dark-surface-foreground))' : 'hsl(var(--dark-surface-foreground))' }}
      >
        {headline}
      </h3>
      <p
        className="text-sm lg:text-base max-w-lg mx-auto mb-6 leading-relaxed"
        style={{ color: isDark ? 'hsl(var(--dark-surface-foreground) / 0.6)' : 'hsl(var(--dark-surface-foreground) / 0.6)' }}
      >
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="gradient" size="lg" asChild>
          <Link to={primaryHref}>
            {primaryLabel}
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
        <Button variant="hero-secondary" size="lg" asChild>
          <Link to={secondaryHref}>
            <Phone size={14} className="mr-1" />
            {secondaryLabel}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default InlineCTA;
