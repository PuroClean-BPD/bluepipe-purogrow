import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, BookOpen, TrendingUp, Lightbulb } from "lucide-react";

const articles = [
  {
    icon: TrendingUp,
    category: "Growth",
    title: "5 Ways PuroClean Franchises Can Dominate Local Search in 2026",
    preview: "Local search is the #1 driver of restoration leads. Here are the five strategies top-performing franchises use to stay ahead.",
    date: "March 5, 2026",
  },
  {
    icon: BookOpen,
    category: "Guides",
    title: "The Complete Guide to Google Business Profile for Restoration Companies",
    preview: "Your GBP is your most valuable digital asset. Learn how to optimize every section for maximum visibility.",
    date: "February 28, 2026",
  },
  {
    icon: Lightbulb,
    category: "Strategy",
    title: "How to Build a 5-Star Reputation That Converts",
    preview: "Reviews are the new word-of-mouth. Discover the system that helps franchise owners collect 20+ reviews per month.",
    date: "February 20, 2026",
  },
  {
    icon: TrendingUp,
    category: "Advertising",
    title: "Google Ads vs Local Service Ads: Which Is Right for Your Franchise?",
    preview: "Both channels drive leads, but the right mix depends on your market. We break down the pros, cons, and when to use each.",
    date: "February 12, 2026",
  },
  {
    icon: BookOpen,
    category: "Social Media",
    title: "Social Media Content Calendar for Restoration Businesses",
    preview: "Struggling with what to post? Download our proven content framework designed specifically for restoration franchises.",
    date: "February 5, 2026",
  },
  {
    icon: Lightbulb,
    category: "SEO",
    title: "Keyword Strategy for Multi-Location Restoration Franchises",
    preview: "Ranking in multiple service areas requires a different approach. Learn the SEO tactics that work for franchise businesses.",
    date: "January 29, 2026",
  },
];

const Newsletter = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="section-dark pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-medium text-primary mb-3">Newsletter</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-dark-surface-foreground mb-4">
              Marketing Insights for Franchise Growth
            </h1>
            <p className="text-dark-surface-foreground/60 text-lg max-w-2xl mb-8">
              Weekly tips, strategies, and industry insights designed specifically for PuroClean franchise owners who want to grow their businesses.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg bg-dark-surface-foreground/10 border border-dark-surface-foreground/20 px-4 py-3 text-sm text-dark-surface-foreground placeholder:text-dark-surface-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button variant="gradient" size="lg" type="submit">
                <Mail size={16} className="mr-1" />
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.title}
              className="card-elevated p-6 cursor-pointer"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <article.icon size={16} className="text-primary" />
                <span className="text-xs font-medium text-primary">{article.category}</span>
                <span className="text-xs text-muted-foreground ml-auto">{article.date}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 leading-snug">{article.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.preview}</p>
            </motion.article>
          ))}
        </div>
      </SectionWrapper>

      <Footer />
    </div>
  );
};

export default Newsletter;
