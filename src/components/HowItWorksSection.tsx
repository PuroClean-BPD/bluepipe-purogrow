import SectionWrapper from "./SectionWrapper";
import { motion } from "framer-motion";
import { ClipboardCheck, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Free Marketing Audit",
    description: "We analyze your current online visibility, advertising performance, reputation, and SEO. You get a detailed report showing exactly where you stand and where the opportunities are.",
  },
  {
    number: "02",
    icon: Rocket,
    title: "Launch Your Growth System",
    description: "We implement a custom marketing system tailored to your franchise location. From Google Ads to reputation management, every channel is optimized to drive local restoration leads.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track Results & Scale",
    description: "Real-time dashboards show you exactly how many leads, calls, and jobs your marketing is generating. We continuously optimize to improve your ROI month over month.",
  },
];

const HowItWorksSection = () => {
  return (
    <SectionWrapper variant="dark">
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-primary mb-3">How It Works</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-dark-surface-foreground mb-4">
          Your Path to Predictable Growth
        </h2>
        <p className="text-dark-surface-foreground/60 text-lg max-w-2xl mx-auto">
          Three simple steps to transform your franchise's digital marketing.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="relative"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <step.icon size={22} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-dark-surface-foreground mb-3">{step.title}</h3>
            <p className="text-dark-surface-foreground/60 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default HowItWorksSection;
