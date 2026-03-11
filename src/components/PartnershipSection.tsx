import SectionWrapper from "./SectionWrapper";
import { Handshake } from "lucide-react";

const PartnershipSection = () => {
  return (
    <SectionWrapper>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
            <Handshake size={18} />
            Official Partnership
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            BluePipe Digital{" "}
            <span className="text-accent">+</span>{" "}
            PuroClean
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-lg">
            BluePipe Digital is the official digital marketing technology partner for PuroClean. We provide franchise owners with the tools, systems, and expertise needed to dominate their local markets.
          </p>
          <p className="text-muted-foreground max-w-lg">
            Our partnership means PuroClean franchise owners receive marketing strategies built specifically for the restoration industry — not generic, one-size-fits-all solutions. Every campaign, every optimization, and every insight is tailored to drive more restoration jobs to your door.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { title: "Industry Expertise", desc: "Built exclusively for restoration franchise marketing." },
            { title: "Proven Systems", desc: "Tested and refined across 250+ franchise locations." },
            { title: "Dedicated Support", desc: "A team that understands your business model." },
            { title: "Data-Driven", desc: "Real-time dashboards and transparent reporting." },
          ].map((item) => (
            <div key={item.title} className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PartnershipSection;
