import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Calendar, User, ArrowRight, Star, Shield, TrendingUp, MessageSquare, Search, BarChart3 } from "lucide-react";

const pastIssues = [
  {
    month: "February 2026",
    title: "Why Review Velocity Is the #1 Local Ranking Factor in 2026",
    summary: "How consistent review generation creates compounding SEO value for restoration franchises.",
  },
  {
    month: "January 2026",
    title: "Google Local Service Ads: The Hidden Lead Channel Most Franchises Ignore",
    summary: "A breakdown of LSA performance data across PuroClean markets and how to get started.",
  },
];

const Newsletter = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="page-header">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="section-label">Monthly Newsletter</p>
            <h1 className="font-bold mb-5" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
              The PuroClean Growth Bulletin
            </h1>
            <p className="section-description-dark mb-8">
              Monthly insights on Google search, local SEO, reputation management, and digital marketing strategies — written specifically for PuroClean franchise owners who want to grow their restoration business.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input-dark flex-1"
              />
              <Button variant="gradient" size="lg" type="submit">
                <Mail size={16} className="mr-1" />
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="tag">Featured Issue</span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar size={14} />
                March 2026
              </span>
            </div>

            <h2 className="font-bold text-foreground mb-4 leading-tight">
              Why Google Now Cares More About "Popularity" Than Rankings
            </h2>
            <p className="text-lg text-primary font-medium mb-6">
              Google just changed how restoration companies show up in local search. And it's already affecting who gets the call.
            </p>

            <div className="flex items-center gap-3 mb-10 pb-8 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bill — BluePipe Digital</p>
                <p className="text-xs text-muted-foreground">PuroClean Strategic Partner for Local Digital Dominance</p>
              </div>
            </div>
          </motion.div>

          {/* Article Body */}
          <motion.div
            className="prose-article"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Intro */}
            <div className="mb-10">
              <p className="text-foreground/85 leading-relaxed mb-4">
                Hi — Bill from BluePipe Digital here.
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Over the past few months we've been seeing something unusual across restoration markets:
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Some companies are ranking #1 in Google… but the phone isn't ringing.
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Others are ranking well one day — and suddenly disappear from the map pack the next.
              </p>
              <p className="text-foreground/85 leading-relaxed font-semibold mb-4">
                What changed?
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Google quietly shifted how its Local Map Pack algorithm works.
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                For years rankings were driven mostly by:
              </p>
              <ul className="space-y-2 mb-6 ml-1">
                {["Proximity to the searcher", "Backlinks and website authority", "Traditional SEO signals"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-foreground/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Those still matter. But Google is now adding a new major factor:
              </p>

              {/* Highlighted insight */}
              <div className="rounded-xl p-6 mb-6" style={{ background: 'hsl(var(--primary) / 0.06)' }}>
                <p className="text-lg font-bold text-primary mb-3">Popularity & Engagement</p>
                <p className="text-foreground/85 leading-relaxed mb-4">
                  In simple terms, Google now wants proof that real people are interacting with your listing. Things like:
                </p>
                <ul className="space-y-2 ml-1">
                  {["Reading reviews", "Clicking photos", "Asking questions", "Messaging your business", "Requesting directions", "Clicking to call"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-foreground/85">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-foreground/85 leading-relaxed mb-4">
                If your Google Business Profile looks inactive, Google assumes the business isn't relevant — even if your SEO is technically perfect.
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                That means your Google Business Profile is no longer just a listing. It's now an <strong>Engagement Hub</strong>.
              </p>
              <p className="text-foreground/85 leading-relaxed font-semibold">
                Businesses that generate activity rise. Businesses that look quiet fade.
              </p>
            </div>

            {/* In This Edition */}
            <div className="rounded-xl border border-border p-6 mb-10">
              <h3 className="font-bold text-foreground mb-4">In This Edition</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Search size={14} /> Quick Hits
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>AI-generated Q&A on Google profiles</li>
                    <li>The new WhatsApp messaging button</li>
                    <li>Why brand mentions matter less than actual user interaction</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <BarChart3 size={14} /> More Inside
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>How to "feed the algorithm" with engagement signals</li>
                    <li>How one PuroClean owner jumped into the Map Pack Top 3 in a week</li>
                    <li>Why strong reputation signals protect you from spam reviews</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Hits */}
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <div className="icon-box-sm">
                <TrendingUp size={16} className="text-primary" />
              </div>
              Quick Hits
            </h3>

            <div className="space-y-8 mb-12">
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-base">AI-Generated Q&A Is Rolling Out</h4>
                <p className="text-foreground/85 leading-relaxed mb-2">
                  Google is beginning to auto-generate answers to customer questions using data from your website and reviews. That means incorrect or outdated information can show up on your profile without you realizing it.
                </p>
                <p className="text-foreground/85 leading-relaxed">
                  These should be audited before they start influencing customer decisions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 text-base">WhatsApp Messaging Is Now Supported</h4>
                <p className="text-foreground/85 leading-relaxed">
                  With the removal of Google's old Business Chat feature, Google now allows businesses to add a WhatsApp contact button to their profile. For emergency services like restoration, faster contact options can dramatically increase conversions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 text-base">From Prominence to Popularity</h4>
                <p className="text-foreground/85 leading-relaxed">
                  Historically, Google measured "prominence" using backlinks and citations. Now Google is heavily weighting real user engagement. How often people click your listing, read reviews, interact with photos, or request directions now plays a major role in rankings.
                </p>
              </div>
            </div>

            {/* The Deep Dive */}
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <div className="icon-box-sm">
                <Search size={16} className="text-primary" />
              </div>
              The Deep Dive
            </h3>

            <h4 className="font-semibold text-foreground mb-3 text-base">
              Google's Local Algorithm Is Now an "Attention Engine"
            </h4>

            <p className="text-foreground/85 leading-relaxed mb-4">
              Google's AI now monitors what users do after they find your business.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              For example:
            </p>
            <p className="text-foreground/85 leading-relaxed mb-1">
              A homeowner searches "water damage restoration near me."
            </p>
            <p className="text-foreground/85 leading-relaxed mb-1">
              They click your profile…
            </p>
            <p className="text-foreground/85 leading-relaxed mb-1">
              They read a few reviews…
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              Then they click <strong>Call</strong>.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              That sequence sends a powerful signal to Google that your business is relevant and trusted.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              Multiply that behavior across hundreds of searches and Google begins promoting your listing more aggressively. Which means higher visibility and more calls.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              But here's the problem:
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              Many Google Business Profiles in the restoration industry look like ghost towns. No new reviews. Few photos. No activity. No engagement.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              When Google sees inactivity, it assumes the business is less relevant.
            </p>

            <div className="rounded-xl p-6 mb-8" style={{ background: 'hsl(var(--primary) / 0.06)' }}>
              <p className="text-lg font-bold text-primary">
                In 2026, activity is the new authority.
              </p>
              <p className="text-foreground/85 leading-relaxed mt-2">
                Businesses that consistently generate engagement signals become much more resistant to algorithm swings.
              </p>
            </div>

            <h4 className="font-semibold text-foreground mb-4 text-base">
              The Benefits of Engagement-First Optimization
            </h4>

            <div className="space-y-5 mb-12">
              <div className="flex gap-4">
                <div className="icon-box-sm mt-0.5">
                  <Shield size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Ranking Stability</p>
                  <p className="text-foreground/85 leading-relaxed text-sm">
                    Businesses with strong interaction rates are far less vulnerable to sudden ranking drops because Google has real proof customers trust them.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="icon-box-sm mt-0.5">
                  <MessageSquare size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Lower Cost Per Lead</p>
                  <p className="text-foreground/85 leading-relaxed text-sm">
                    Features like messaging, review engagement, and fast call actions allow customers to contact you immediately — reducing friction that often kills conversions.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="icon-box-sm mt-0.5">
                  <Star size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">AI Recommendation Priority</p>
                  <p className="text-foreground/85 leading-relaxed text-sm">
                    Google's new AI-driven search results are more likely to feature businesses with strong review sentiment, frequent activity, and high engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* How BluePipe Helps */}
            <div className="rounded-xl border border-border p-6 mb-12">
              <h4 className="font-semibold text-foreground mb-3 text-base">How BluePipe Helps</h4>
              <p className="text-foreground/85 leading-relaxed mb-4">
                This is exactly why our Managed Google Business Profile and Reputation Management program is included in all three of our SEO packages. It focuses specifically on:
              </p>
              <ul className="space-y-2 ml-1">
                {["Review velocity", "Engagement signals", "Profile activity", "Reputation protection"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-foreground/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-foreground/85 leading-relaxed mt-4">
                These are the signals Google's AI is now prioritizing.
              </p>
            </div>

            {/* Wins of the Month */}
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <div className="icon-box-sm">
                <Star size={16} className="text-primary" />
              </div>
              Wins of the Month
            </h3>

            <div className="card-elevated p-6 mb-12">
              <p className="font-semibold text-foreground mb-1">Paul Reiss — PuroClean of Caseyville, Illinois</p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Paul recently joined our Booster SEO solution. During onboarding we quickly identified two issues holding his rankings back:
              </p>
              <ul className="space-y-2 mb-4 ml-1">
                {["Low review velocity", "Weak engagement signals"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-foreground/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-foreground/85 leading-relaxed mb-4">
                Within the first week we helped generate <strong>25 new 5-star Google reviews</strong>.
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                The impact was immediate. His average Map Pack ranking for water damage restoration searches in his service area moved from <strong>position #9 to consistently within the Top 3</strong>.
              </p>
              <p className="text-foreground/85 leading-relaxed">
                And with that visibility came a noticeable increase in inbound calls.
              </p>
            </div>

            {/* The Hidden Win */}
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <div className="icon-box-sm">
                <Shield size={16} className="text-primary" />
              </div>
              The Hidden Win
            </h3>

            <h4 className="font-semibold text-foreground mb-3 text-base">
              The "Reputation Shield" Effect
            </h4>

            <p className="text-foreground/85 leading-relaxed mb-4">
              One of our contractor clients recently experienced a wave of suspicious 1-star reviews — likely from a competitor or disgruntled former employee.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              Normally that type of activity can damage rankings. But because they had already built a strong web of positive trust signals — reviews, engagement, and brand mentions — Google flagged the negative reviews as outlier sentiment.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-4">
              Their ranking didn't drop at all. Within a week, the spam reviews were removed.
            </p>
            <p className="text-foreground/85 leading-relaxed mb-8">
              That kind of algorithm resilience becomes an insurance policy for your brand. And in competitive markets, it can protect years of hard-earned visibility.
            </p>

            {/* CTA */}
            <div className="rounded-2xl p-8 text-center" style={{ background: 'hsl(var(--primary) / 0.06)' }}>
              <h3 className="font-bold text-foreground mb-3">
                Want to See How Your Location Is Performing?
              </h3>
              <p className="text-foreground/85 leading-relaxed mb-4">
                If you're unsure whether your Google Business Profile is generating the engagement signals Google now expects, we're happy to take a look.
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                BluePipe Digital can run a complimentary <strong>Local Visibility Audit</strong> for your market. In the audit we'll show you:
              </p>
              <ul className="space-y-2 text-left max-w-lg mx-auto mb-6">
                {[
                  "Where your location currently ranks for key restoration searches",
                  "How your Google Business Profile engagement compares to competitors",
                  "Which signals are helping (or hurting) your visibility",
                  "The fastest opportunities to generate more calls from Google",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-foreground/85 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-foreground/85 leading-relaxed mb-6">
                No sales pressure — just a clear picture of where things stand.
              </p>
              <Button variant="gradient" size="lg" asChild>
                <a href="/free-audit">
                  Get Your Free Marketing Audit
                  <ArrowRight size={16} className="ml-1" />
                </a>
              </Button>
            </div>

            {/* Sign-off */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-foreground/85 leading-relaxed mb-1">— Bill</p>
              <p className="text-sm text-muted-foreground">BluePipe Digital</p>
              <p className="text-sm text-muted-foreground">PuroClean Strategic Partner for Local Digital Dominance</p>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Past Issues */}
      <SectionWrapper variant="muted">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-foreground mb-8">Past Issues</h2>
          <div className="space-y-4">
            {pastIssues.map((issue, i) => (
              <motion.div
                key={issue.month}
                className="card-elevated p-6 cursor-pointer group"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <span className="text-xs text-muted-foreground mb-2 block">{issue.month}</span>
                <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{issue.title}</h3>
                <p className="text-sm text-muted-foreground">{issue.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Subscribe CTA */}
      <SectionWrapper>
        <div className="max-w-2xl mx-auto text-center">
          <div className="icon-box mx-auto mb-6">
            <Mail size={22} className="text-primary" />
          </div>
          <h2 className="font-bold text-foreground mb-4">
            Subscribe to The PuroClean Growth Bulletin
          </h2>
          <p className="section-description mx-auto mb-8">
            Join hundreds of PuroClean franchise owners receiving monthly digital marketing insights, algorithm updates, and growth strategies.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input flex-1"
            />
            <Button variant="gradient" size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-muted-foreground/60 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </SectionWrapper>

      <Footer />
    </div>
  );
};

export default Newsletter;
