import SectionWrapper from "./SectionWrapper";
import { Handshake, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { title: "Industry Expertise", desc: "Built exclusively for restoration franchise marketing." },
  { title: "Proven Systems", desc: "Tested and refined across 250+ franchise locations." },
  { title: "Dedicated Support", desc: "A team that understands your business model." },
  { title: "Data-Driven", desc: "Real-time dashboards and transparent reporting." },
];

const PartnershipSection = () => {
  return (
    <SectionWrapper variant="muted">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <p className="section-label">
            <Handshake size={16} className="inline mr-1.5 -mt-0.5" />
            Official Partnership
          </p>
          <h2 className="font-bold text-foreground mb-6">
            BluePipe Digital{" "}
            <span className="text-accent">+</span>{" "}
            PuroClean
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-lg leading-relaxed">
            BluePipe Digital is the official digital marketing technology partner for PuroClean. We provide franchise owners with the tools, systems, and expertise needed to dominate their local markets.
          </p>
          <p className="text-muted-foreground max-w-lg leading-relaxed">
            Our partnership means PuroClean franchise owners receive marketing strategies built specifically for the restoration industry — not generic, one-size-fits-all solutions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {benefits.map((item, i) => (
            <motion.div
              key={item.title}
              className="card-elevated p-6"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="icon-box-sm mb-4">
                <CheckCircle2 size={18} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 text-base">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PartnershipSection;
