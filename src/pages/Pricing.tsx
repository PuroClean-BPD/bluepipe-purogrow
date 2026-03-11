import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$997",
    period: "/month",
    description: "Perfect for new franchise locations looking to establish their online presence.",
    features: [
      "Google Business Profile Management",
      "Basic Reputation Management",
      "Monthly Performance Report",
      "Dedicated Account Manager",
      "Email Support",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Growth",
    price: "$1,997",
    period: "/month",
    description: "For franchise owners serious about dominating their local market.",
    features: [
      "Everything in Starter",
      "Managed Google Ads & LSA",
      "Advanced Reputation Management",
      "Social Media Management",
      "Weekly Performance Reports",
      "Priority Support",
      "Quarterly Strategy Reviews",
    ],
    cta: "Start Growing",
    featured: true,
  },
  {
    name: "Dominate",
    price: "$3,497",
    period: "/month",
    description: "The complete marketing system for maximum market domination.",
    features: [
      "Everything in Growth",
      "Full SEO Program",
      "Content Marketing",
      "Advanced Analytics Dashboard",
      "Competitor Monitoring",
      "Monthly Strategy Calls",
      "Custom Landing Pages",
      "Performance Guarantees",
    ],
    cta: "Dominate Your Market",
    featured: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="page-header">
        <div className="container-main text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="section-label">Pricing</p>
            <h1 className="font-bold mb-5" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
              Simple, Transparent Pricing
            </h1>
            <p className="section-description-dark mx-auto">
              Choose the marketing system that fits your franchise. All plans include a dedicated account manager and transparent reporting.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl p-7 border transition-all duration-300 ${
                plan.featured
                  ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary)),0_16px_48px_-12px_hsla(210,100%,50%,0.2)] relative bg-card"
                  : "card-elevated"
              }`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-7 leading-relaxed">{plan.description}</p>

              <Button
                variant={plan.featured ? "gradient" : "secondary-pill"}
                size="lg"
                className="w-full mb-7"
                asChild
              >
                <Link to="/free-audit">
                  {plan.cta}
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <AuditCTASection />
      <Footer />
    </div>
  );
};

export default Pricing;
