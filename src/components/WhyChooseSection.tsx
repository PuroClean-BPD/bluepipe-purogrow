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
      <div className="glow-orb w-[600px] h-[600px] bg-primary/5 top-0 right-0" style={{ position: 'absolute' }} />
      
      <div className="text-center mb-20">
        <div className="badge-pill mx-auto mb-6">Why BluePipe</div>
        <h2 className="text-3xl lg:text-5xl font-bold text-dark-surface-foreground mb-5">
          Why Franchise Owners Choose <span className="gradient-text">BluePipe Digital</span>
        </h2>
        <p className="text-dark-surface-foreground/55 text-lg max-w-2xl mx-auto">
          Purpose-built marketing technology for PuroClean franchise growth.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, i) => (
          <motion.div
            key={reason.title}
            className="card-dark p-7 group"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
              <reason.icon size={22} className="text-primary" />
            </div>
            <h3 className="font-semibold text-dark-surface-foreground mb-2 text-lg">{reason.title}</h3>
            <p className="text-sm text-dark-surface-foreground/55 leading-relaxed">{reason.desc}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default WhyChooseSection;
