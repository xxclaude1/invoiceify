import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/landing/hero-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import TemplatesSection from "@/components/landing/templates-section";
import FeaturesSection from "@/components/landing/features-section";
import CtaSection from "@/components/landing/cta-section";
import FaqSection from "@/components/landing/faq-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <TemplatesSection />
        <FeaturesSection />
        <CtaSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
