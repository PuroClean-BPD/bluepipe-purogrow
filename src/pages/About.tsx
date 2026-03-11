import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Target, Eye, Rocket, Users } from "lucide-react";

const values = [
  { icon: Target, title: "Franchise-First", desc: "Every strategy, tool, and process is built specifically for franchise businesses. We understand multi-location marketing." },
  { icon: Eye, title: "Transparency", desc: "No hidden fees, no black-box reporting. You see exactly what we're doing and what it's producing — in real time." },
  { icon: Rocket, title: "Results-Driven", desc: "We measure success by the leads, calls, and revenue our systems generate for your franchise." },
  { icon: Users, title: "Partnership", desc: "We're not a vendor. We're your marketing partner. Your success is our success, and we're in it for the long haul." },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="page-header">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <p className="section-label">About Us</p>
            <h1 className="font-bold mb-6" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
              The Marketing Technology Partner for{" "}
              <span className="gradient-text">PuroClean Franchises</span>
            </h1>
            <p className="section-description-dark">
              BluePipe Digital was founded with a single mission: to give PuroClean franchise owners the digital marketing systems they need to grow predictably and profitably.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h2 className="font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                BluePipe Digital was born from a simple observation: franchise owners are experts at running their businesses, but the digital marketing landscape is complex, fragmented, and constantly changing.
              </p>
              <p>
                We saw PuroClean franchise owners struggling with generic marketing agencies that didn't understand the restoration industry, wasting money on tactics that didn't produce results.
              </p>
              <p>
                So we built something different — a complete digital marketing system designed from the ground up for PuroClean franchise owners. Every strategy, every campaign, every optimization is tailored to help you generate more local restoration leads.
              </p>
              <p>
                Today, we serve over 250 franchise locations as the official digital marketing partner for PuroClean, and we're just getting started.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-6">The Partnership</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Our strategic partnership with PuroClean means franchise owners get marketing solutions that are fully aligned with the PuroClean brand and growth objectives.
              </p>
              <p>
                We work directly with PuroClean's corporate team to ensure our marketing systems complement the national brand strategy while giving individual franchise owners the local visibility they need.
              </p>
              <p>
                This isn't a referral partnership or a loose affiliation — it's a deep, strategic collaboration built on shared goals and mutual accountability. When your franchise grows, we all grow.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark">
        <div className="text-center mb-14">
          <p className="section-label">Our Values</p>
          <h2 className="font-bold" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>What Drives Us</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              className="card-dark p-7 flex gap-5"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="icon-box">
                <value.icon size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>{value.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.6)' }}>{value.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <AuditCTASection />
      <Footer />
    </div>
  );
};

export default About;
