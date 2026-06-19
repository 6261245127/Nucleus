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
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const seo = await prisma.cMSPageSeo.findUnique({
      where: { pagePath: '/' }
    });

    if (!seo) {
      return {
        title: 'The Social Bite - Creator Growth & Viewer Rewards',
        description: 'The premier ecosystem for authentic creator growth and viewer rewards.'
      };
    }

    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      keywords: seo.keywords || undefined,
      openGraph: {
        title: seo.ogTitle || seo.metaTitle,
        description: seo.ogDescription || seo.metaDescription,
        images: seo.ogImage ? [{ url: seo.ogImage }] : []
      }
    };
  } catch (error) {
    return {
      title: 'The Social Bite - Creator Growth & Viewer Rewards',
      description: 'The premier ecosystem for authentic creator growth and viewer rewards.'
    };
  }
}

export default async function Home() {
  // Fallbacks if database queries fail or tables are empty
  let settings = null;
  let sections: any[] = [];
  let pricingPlans: any[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];
  let headerMenu: any[] = [];
  let footerMenu: any[] = [];
  let announcement: any = null;

  try {
    // 1. Fetch site global settings
    settings = await prisma.cMSSetting.findUnique({
      where: { id: 'global-settings' }
    });

    // 2. Fetch first active announcement
    announcement = await prisma.cMSAnnouncement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch navigation menu items
    const menuItems = await prisma.cMSMenuItem.findMany({
      orderBy: { order: 'asc' }
    });
    headerMenu = menuItems.filter(item => item.menuType === 'HEADER');
    footerMenu = menuItems.filter(item => item.menuType === 'FOOTER');

    // 4. Fetch visible layout builder sections
    sections = await prisma.cMSSection.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' }
    });

    // 5. Fetch section-related dynamic lists
    const creatorPlans = await prisma.cMSCreatorPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    pricingPlans = creatorPlans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: 'INR',
      period: '/mo',
      features: p.features,
      badgeLabel: p.badgeText || null,
      buttonText: p.buttonText,
      isPopular: !!p.badgeText
    }));

    testimonials = await prisma.cMSTestimonial.findMany({
      orderBy: { order: 'asc' }
    });

    faqs = await prisma.cMSFaq.findMany({
      orderBy: { order: 'asc' }
    });
  } catch (error) {
    console.error('Error loading homepage CMS data:', error);
  }

  // Component Map mapping types to elements
  const renderSection = (sec: any) => {
    switch (sec.type) {
      case 'HERO':
        return <HeroSection key={sec.id} section={sec} />;
      case 'TRUST':
        return <TrustSection key={sec.id} section={sec} />;
      case 'HOW_IT_WORKS':
        return <div key={sec.id} id="how-it-works"><HowItWorks section={sec} /></div>;
      case 'FEATURES':
        return <div key={sec.id} id="features"><FeaturesBento section={sec} /></div>;
      case 'AI_RECOMMENDATIONS':
        return <AIRecommendations key={sec.id} />;
      case 'CREATOR_SHOWCASE':
        return <CreatorShowcase key={sec.id} />;
      case 'MARKETPLACE_PREVIEW':
        return <MarketplacePreview key={sec.id} />;
      case 'EARNINGS':
        return <EarningsSection key={sec.id} />;
      case 'TESTIMONIALS':
        return <Testimonials key={sec.id} section={sec} testimonials={testimonials} />;
      case 'PRICING':
        return <div key={sec.id} id="pricing"><Pricing section={sec} plans={pricingPlans} /></div>;
      case 'FAQ':
        return <div key={sec.id} id="faq"><FAQ section={sec} faqs={faqs} /></div>;
      case 'FINAL_CTA':
        return <FinalCTA key={sec.id} section={sec} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050B22] text-white selection:bg-primary/30 selection:text-white pt-2">
      <LandingNav settings={settings} menuItems={headerMenu} announcement={announcement} />
      
      <main>
        {sections.length > 0 ? (
          sections.map(sec => renderSection(sec))
        ) : (
          <>
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
          </>
        )}
      </main>

      <LandingFooter settings={settings} menuItems={footerMenu} />
    </div>
  );
}
