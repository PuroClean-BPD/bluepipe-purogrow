import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const auditIncludes = [
  "Google Business Profile analysis",
  "Google Ads performance review",
  "Online reputation assessment",
  "Local SEO audit",
  "Competitor benchmarking",
  "Custom growth recommendations",
];

const FreeAudit = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="section-dark pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="section-label">Free Marketing Audit</p>
              <h1 className="font-bold mb-6" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
                Discover How Your Franchise <span className="gradient-text">Stacks Up Online</span>
              </h1>
              <p className="section-description-dark mb-8 max-w-lg">
                Get a comprehensive, no-obligation audit of your franchise's digital marketing presence. See exactly where you stand and where the opportunities are.
              </p>
              <div className="space-y-3.5">
                {auditIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.8)' }}>
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-card rounded-2xl p-8 border border-border/60"
              style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-6">Request Your Free Audit</h2>
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
                  <label className="form-label text-foreground">Franchise Location</label>
                  <input className="form-input" placeholder="PuroClean of [Your City]" />
                </div>
                <div>
                  <label className="form-label text-foreground">Website URL (optional)</label>
                  <input type="url" className="form-input" placeholder="https://puroclean.com/your-location" />
                </div>
                <Button variant="gradient" size="xl" className="w-full mt-1" type="submit">
                  Get My Free Audit
                  <ArrowRight size={18} className="ml-1" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">No commitment required. Results delivered within 48 hours.</p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FreeAudit;
