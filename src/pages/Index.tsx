import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PartnershipSection from "@/components/PartnershipSection";
import SolutionsSection from "@/components/SolutionsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CaseStudiesPreview from "@/components/CaseStudiesPreview";
import WhyChooseSection from "@/components/WhyChooseSection";
import NewsletterSection from "@/components/NewsletterSection";
import AuditCTASection from "@/components/AuditCTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PartnershipSection />
      <SolutionsSection />
      <HowItWorksSection />
      <CaseStudiesPreview />
      <WhyChooseSection />
      <NewsletterSection />
      <AuditCTASection />
      <Footer />
    </div>
  );
};

export default Index;
