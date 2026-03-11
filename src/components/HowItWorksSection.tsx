import SectionWrapper from "./SectionWrapper";
import { motion } from "framer-motion";
import { ClipboardCheck, Rocket, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Free Marketing Audit",
    description: "We analyze your current online visibility, advertising performance, reputation, and SEO. You get a detailed report showing exactly where the opportunities are.",
  },
  {
    number: "02",
    icon: Rocket,
    title: "Launch Your Growth System",
    description: "We implement a custom marketing system tailored to your franchise location. Every channel is optimized to drive local restoration leads.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track Results & Scale",
    description: "Real-time dashboards show exactly how many leads, calls, and jobs your marketing generates. We continuously optimize to improve ROI.",
  },
];

const HowItWorksSection = () => {
  return (
    <SectionWrapper variant="dark">
      {/* Background orb */}
      <div className="glow-orb w-[500px] h-[500px] bg-primary/6 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" style={{ position: 'absolute' }} />
      
      <div className="text-center mb-20">
        <div className="badge-pill mx-auto mb-6">How It Works</div>
        <h2 className="text-3xl lg:text-5xl font-bold text-dark-surface-foreground mb-5">
          Your Path to <span className="gradient-text">Predictable Growth</span>
        </h2>
        <p className="text-dark-surface-foreground/55 text-lg max-w-2xl mx-auto">
          Three simple steps to transform your franchise's digital marketing.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="card-dark p-8 relative text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
          >
            <div className="number-badge mx-auto mb-6">{step.number}</div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <step.icon size={26} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-dark-surface-foreground mb-3">{step.title}</h3>
            <p className="text-dark-surface-foreground/55 leading-relaxed text-sm">{step.description}</p>
            
            {i < steps.length - 1 && (
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight size={18} className="text-primary/30" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default HowItWorksSection;
