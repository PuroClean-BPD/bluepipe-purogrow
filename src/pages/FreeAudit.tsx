import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Search, Star, MousePointerClick, Globe, BarChart3, Shield, Phone } from "lucide-react";

const auditAreas = [
  {
    icon: Globe,
    title: "Google Business Profile Performance",
    description: "We analyze your GBP listing for completeness, keyword optimization, photo quality, posting frequency, and how you compare to top-ranked competitors in your service area.",
    insights: [
      "Profile completeness score vs. competitors",
      "Category and keyword optimization gaps",
      "Photo and post engagement analysis",
      "Ranking position in Google Maps for key services",
    ],
  },
  {
    icon: Search,
    title: "Local Search Rankings",
    description: "We audit your organic search visibility across the keywords that matter most — emergency restoration, water damage, mold remediation, and fire cleanup in your territory.",
    insights: [
      "Current keyword rankings for your service area",
      "Competitor ranking comparison",
      "On-page SEO issues holding you back",
      "Content and backlink gap analysis",
    ],
  },
  {
    icon: MousePointerClick,
    title: "Google Ads & Local Service Ads",
    description: "If you're running paid ads, we evaluate campaign structure, keyword targeting, ad copy, and cost efficiency. If you're not, we show you what you're leaving on the table.",
    insights: [
      "Ad spend efficiency and cost-per-lead benchmarks",
      "Keyword targeting and negative keyword gaps",
      "Ad copy and extension optimization opportunities",
      "Local Service Ads eligibility and setup review",
    ],
  },
  {
    icon: Star,
    title: "Online Reputation & Reviews",
    description: "Your star rating and review volume directly impact whether customers choose you or a competitor. We assess your reputation health across Google, Yelp, and key directories.",
    insights: [
      "Review volume vs. top local competitors",
      "Average rating trend analysis",
      "Response rate and response quality audit",
      "Reputation management system recommendations",
    ],
  },
  {
    icon: BarChart3,
    title: "Website Lead Generation",
    description: "We evaluate whether your website is converting visitors into calls and form submissions — or losing them. Speed, mobile experience, and conversion paths all matter.",
    insights: [
      "Page speed and mobile usability score",
      "Call-to-action placement and effectiveness",
      "Contact form and click-to-call analysis",
      "Conversion rate benchmarks for your market",
    ],
  },
];

const FreeAudit = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero + Form */}
      <section className="section-dark pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="section-label">Free Marketing Audit</p>
              <h1 className="font-bold mb-6" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
                Discover How Your Franchise <span className="gradient-text">Stacks Up Online</span>
              </h1>
              <p className="section-description-dark mb-8 max-w-lg">
                Get a comprehensive, no-obligation audit of your franchise's digital marketing presence. We'll show you exactly where you stand, where the gaps are, and what to fix first to start generating more leads.
              </p>

              <div className="space-y-3.5 mb-8">
                {[
                  "Google Business Profile analysis",
                  "Local search ranking audit",
                  "Google Ads & LSA performance review",
                  "Online reputation assessment",
                  "Website lead generation audit",
                  "Competitor benchmarking",
                  "Custom growth recommendations",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.8)' }}>
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                <Shield size={20} className="text-primary shrink-0" />
                <p className="text-sm" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.75)' }}>
                  <span className="font-semibold" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>100% free, zero obligation.</span>{" "}
                  Your audit is designed to identify growth opportunities — not pressure you into anything. Results delivered within 48 hours.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-card rounded-2xl p-8 border border-border/60"
              style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-1">Request Your Free Audit</h2>
              <p className="text-sm text-muted-foreground mb-6">Fill out the form and we'll deliver your personalized audit within 48 hours.</p>
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
                  Get My Free Marketing Audit
                  <ArrowRight size={18} className="ml-1" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">No credit card. No commitment. Just insights.</p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <SectionWrapper>
        <div className="text-center mb-14">
          <p className="section-label">What You'll Receive</p>
          <h2 className="font-bold text-foreground mb-4">
            A Complete Picture of Your Digital Presence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your free audit covers the five pillars of local digital marketing — so you know exactly what's working, what's not, and where to focus for maximum growth.
          </p>
        </div>

        <div className="space-y-6">
          {auditAreas.map((area, i) => (
            <motion.div
              key={area.title}
              className="card-elevated p-7"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <area.icon size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{area.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Insights You'll Receive</p>
                  <ul className="space-y-2.5">
                    {area.insights.map((insight) => (
                      <li key={insight} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper>
        <motion.div
          className="text-center rounded-2xl border border-border bg-secondary/40 px-8 py-14 md:py-20"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to See Where You Stand?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Your competitors are already investing in their digital marketing. Find out exactly what they're doing — and how to outperform them — with a free, no-strings-attached audit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Get Your Free Marketing Audit
              <ArrowRight size={16} className="ml-1" />
            </Button>
            <Button variant="secondary-pill" size="lg" asChild>
              <a href="/contact">
                <Phone size={14} className="mr-1" />
                Book a Strategy Call
              </a>
            </Button>
          </div>
        </motion.div>
      </SectionWrapper>

      <Footer />
    </div>
  );
};

export default FreeAudit;
