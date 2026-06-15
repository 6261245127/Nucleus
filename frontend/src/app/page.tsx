import HeroSection from '@/components/landing/HeroSection';
import TrustSection from '@/components/landing/TrustSection';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesBento from '@/components/landing/FeaturesBento';
import AIRecommendations from '@/components/landing/AIRecommendations';
import CreatorShowcase from '@/components/landing/CreatorShowcase';
import MarketplacePreview from '@/components/landing/MarketplacePreview';
import EarningsSection from '@/components/landing/EarningsSection';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050B22] text-white selection:bg-primary/30 selection:text-white">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustSection />
        <div id="how-it-works"><HowItWorks /></div>
        <div id="features"><FeaturesBento /></div>
        <AIRecommendations />
        <CreatorShowcase />
        <MarketplacePreview />
        <EarningsSection />
        <Testimonials />
        <div id="pricing"><Pricing /></div>
        <div id="faq"><FAQ /></div>
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
