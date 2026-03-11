import SectionWrapper from "./SectionWrapper";
import { motion } from "framer-motion";
import { ClipboardCheck, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Free Marketing Audit",
    description: "We analyze your current online visibility, advertising performance, reputation, and SEO. You get a detailed report showing exactly where you stand.",
  },
  {
    number: "02",
    icon: Rocket,
    title: "Launch Your Growth System",
    description: "We implement a custom marketing system tailored to your franchise. Every channel is optimized to drive local restoration leads.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track Results & Scale",
    description: "Real-time dashboards show your leads, calls, and jobs. We continuously optimize to improve your ROI month over month.",
  },
];

const HowItWorksSection = () => {
  return (
    <SectionWrapper variant="dark">
      <div className="text-center mb-16">
        <p className="section-label">How It Works</p>
        <h2 className="font-bold mb-5" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
          Your Path to Predictable Growth
        </h2>
        <p className="section-description-dark mx-auto">
          Three simple steps to transform your franchise's digital marketing.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="card-dark p-8 relative"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="text-5xl font-bold mb-5" style={{ color: 'hsl(var(--primary) / 0.15)' }}>{step.number}</div>
            <div className="icon-box mb-5">
              <step.icon size={22} className="text-primary" />
            </div>
            <h3 className="font-semibold mb-3" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>{step.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.6)' }}>{step.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default HowItWorksSection;
