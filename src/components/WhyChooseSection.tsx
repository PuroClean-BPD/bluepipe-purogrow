import SectionWrapper from "./SectionWrapper";
import { Shield, Zap, Users, HeadphonesIcon, BarChart, Award } from "lucide-react";
import { motion } from "framer-motion";
import InlineCTA from "./InlineCTA";

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
        <p className="section-label">Why BluePipe</p>
        <h2 className="font-bold mb-5" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
          Why Franchise Owners Choose BluePipe Digital
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, i) => (
          <motion.div
            key={reason.title}
            className="card-dark p-6 flex gap-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="icon-box-sm">
              <reason.icon size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1.5 text-base" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>{reason.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.6)' }}>{reason.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <InlineCTA
        variant="dark"
        headline="Ready to Experience the Difference?"
        description="Join 250+ franchise owners already growing with BluePipe Digital. Start with a free audit."
        primaryLabel="Get Your Free Marketing Audit"
        secondaryLabel="Book a Strategy Call"
      />
    </SectionWrapper>
  );
};

export default WhyChooseSection;
