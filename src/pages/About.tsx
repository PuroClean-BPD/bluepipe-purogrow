import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Target, Eye, Rocket, Users } from "lucide-react";

const values = [
  { icon: Target, title: "Franchise-First", desc: "Every strategy, tool, and process is built specifically for franchise businesses. We understand multi-location marketing." },
  { icon: Eye, title: "Transparency", desc: "No hidden fees, no black-box reporting. You see exactly what we're doing and what it's producing — in real time." },
  { icon: Rocket, title: "Results-Driven", desc: "We measure success by the leads, calls, and revenue our systems generate for your franchise. If it doesn't drive results, we don't do it." },
  { icon: Users, title: "Partnership", desc: "We're not a vendor. We're your marketing partner. Your success is our success, and we're in it for the long haul." },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="section-dark pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <p className="text-sm font-medium text-primary mb-3">About Us</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-dark-surface-foreground mb-6">
              The Marketing Technology Partner for{" "}
              <span className="gradient-text">PuroClean Franchises</span>
            </h1>
            <p className="text-dark-surface-foreground/60 text-lg">
              BluePipe Digital was founded with a single mission: to give PuroClean franchise owners the digital marketing systems they need to grow predictably and profitably.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                BluePipe Digital was born from a simple observation: franchise owners are experts at running their businesses, but the digital marketing landscape is complex, fragmented, and constantly changing.
              </p>
              <p>
                We saw PuroClean franchise owners struggling with generic marketing agencies that didn't understand the restoration industry, wasting money on tactics that didn't produce results, and spending too much time trying to figure out marketing when they should be focused on their operations.
              </p>
              <p>
                So we built something different — a complete digital marketing system designed from the ground up for PuroClean franchise owners. Every strategy, every campaign, every optimization is tailored to help you generate more local restoration leads and grow your business.
              </p>
              <p>
                Today, we serve over 250 franchise locations as the official digital marketing partner for PuroClean, and we're just getting started.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">The Partnership</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Our strategic partnership with PuroClean means franchise owners get marketing solutions that are fully aligned with the PuroClean brand and growth objectives.
              </p>
              <p>
                We work directly with PuroClean's corporate team to ensure our marketing systems complement the national brand strategy while giving individual franchise owners the local visibility they need to win in their markets.
              </p>
              <p>
                This isn't a referral partnership or a loose affiliation — it's a deep, strategic collaboration built on shared goals and mutual accountability. When your franchise grows, we all grow.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-surface-foreground mb-4">Our Values</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              className="flex gap-4"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <value.icon size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-surface-foreground mb-2">{value.title}</h3>
                <p className="text-dark-surface-foreground/60 leading-relaxed">{value.desc}</p>
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
