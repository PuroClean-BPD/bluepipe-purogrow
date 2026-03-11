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
      <section className="section-dark pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-sm font-medium text-primary mb-3">Free Marketing Audit</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-dark-surface-foreground mb-6">
                Discover How Your Franchise <span className="gradient-text">Stacks Up Online</span>
              </h1>
              <p className="text-dark-surface-foreground/60 text-lg mb-8 max-w-lg">
                Get a comprehensive, no-obligation audit of your franchise's digital marketing presence. See exactly where you stand and where the opportunities are.
              </p>
              <div className="space-y-3">
                {auditIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-dark-surface-foreground/80">
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-background rounded-2xl p-8 shadow-2xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-6">Request Your Free Audit</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                    <input className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                    <input className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="john@puroclean.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <input type="tel" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Franchise Location</label>
                  <input className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="PuroClean of [Your City]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Website URL (optional)</label>
                  <input type="url" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="https://puroclean.com/your-location" />
                </div>
                <Button variant="gradient" size="xl" className="w-full mt-2" type="submit">
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
