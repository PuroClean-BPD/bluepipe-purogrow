import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditCTASection from "@/components/AuditCTASection";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="page-header">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <p className="section-label">Contact Us</p>
            <h1 className="font-bold mb-5" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
              Let's Talk About Growing Your Franchise
            </h1>
            <p className="section-description-dark">
              Ready to take the next step? Reach out and we'll schedule a strategy call to discuss how BluePipe Digital can help your PuroClean franchise generate more leads.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-light py-24 lg:py-32">
        <div className="container-main">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              <motion.div
                className="card-elevated p-8"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-foreground">First Name</label>
                      <input className="form-input" placeholder="John" />
                    </div>
                    <div>
                      <label className="form-label text-foreground">Last Name</label>
                      <input className="form-input" placeholder="Smith" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-foreground">Email</label>
                    <input type="email" className="form-input" placeholder="john@puroclean.com" />
                  </div>
                  <div>
                    <label className="form-label text-foreground">Phone</label>
                    <input type="tel" className="form-input" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="form-label text-foreground">How can we help?</label>
                    <textarea rows={4} className="form-input resize-none" placeholder="Tell us about your franchise and marketing goals..." />
                  </div>
                  <Button variant="gradient" size="xl" className="w-full" type="submit">
                    Send Message
                    <ArrowRight size={18} className="ml-1" />
                  </Button>
                </form>
              </motion.div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-5">Get in Touch</h3>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: "Email", value: "hello@bluepipedigital.com" },
                    { icon: Phone, label: "Phone", value: "(555) 123-4567" },
                    { icon: MapPin, label: "Office", value: "United States" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="icon-box-sm">
                        <item.icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="card-elevated p-6"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <h3 className="font-semibold text-foreground mb-2">Want a Free Audit Instead?</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  See exactly where your franchise stands online with a comprehensive, no-obligation marketing audit.
                </p>
                <Button variant="gradient" size="lg" className="w-full" asChild>
                  <Link to="/free-audit">
                    Get Your Free Marketing Audit
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="card-elevated p-6"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="font-semibold text-foreground mb-2">Prefer a Call?</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Schedule a free 30-minute strategy call to discuss your franchise's marketing goals.
                </p>
                <Button variant="secondary-pill" size="lg" className="w-full">
                  <Phone size={14} className="mr-1" />
                  Book a Strategy Call
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
