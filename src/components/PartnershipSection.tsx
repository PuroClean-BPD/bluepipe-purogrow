import SectionWrapper from "./SectionWrapper";
import { Handshake, Building2, Target, LineChart } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Building2, title: "Industry Expertise", desc: "Built exclusively for restoration franchise marketing." },
  { icon: Target, title: "Proven Systems", desc: "Tested and refined across 250+ franchise locations." },
  { icon: Handshake, title: "Dedicated Support", desc: "A team that understands your business model." },
  { icon: LineChart, title: "Data-Driven", desc: "Real-time dashboards and transparent reporting." },
];

const PartnershipSection = () => {
  return (
    <SectionWrapper variant="light-alt" mesh>
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div>
          <div className="badge-pill mb-6">
            <Handshake size={16} />
            <span>Official Partnership</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
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

        <div className="grid grid-cols-2 gap-5">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              className="card-elevated p-7 group"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <item.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PartnershipSection;
