import SectionWrapper from "./SectionWrapper";
import { Shield, Zap, Users, HeadphonesIcon, BarChart, Award } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  { icon: Shield, title: "Official PuroClean Partner", desc: "The only marketing company built with PuroClean's endorsement." },
  { icon: Zap, title: "Restoration-Specific", desc: "Strategies designed for the restoration industry, not generic marketing." },
  { icon: Users, title: "250+ Franchise Locations", desc: "Proven across hundreds of PuroClean franchise markets." },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "A team that understands your business and speaks your language." },
  { icon: BarChart, title: "Transparent Reporting", desc: "Real-time dashboards so you always know your ROI." },
  { icon: Award, title: "Guaranteed Results", desc: "We stand behind our systems with performance guarantees." },
];

const WhyChooseSection = () => {
  return (
    <SectionWrapper variant="dark">
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-primary mb-3">Why BluePipe</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-dark-surface-foreground mb-4">
          Why Franchise Owners Choose BluePipe Digital
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {reasons.map((reason, i) => (
          <motion.div
            key={reason.title}
            className="flex gap-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <reason.icon size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-surface-foreground mb-1">{reason.title}</h3>
              <p className="text-sm text-dark-surface-foreground/60">{reason.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default WhyChooseSection;
