import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CMS data...');

  // 1. Seed global settings
  await prisma.cMSSetting.upsert({
    where: { id: 'global-settings' },
    update: {},
    create: {
      id: 'global-settings',
      websiteName: 'The Social Bite',
      websiteUrl: 'http://localhost:3000',
      supportEmail: 'support@thesocialbite.com',
      contactNumber: '+91 99999 88888',
      socialLinks: {
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
      },
      copyrightText: '© 2026 The Social Bite Inc. All rights reserved.',
    },
  });
  console.log('Global settings seeded.');

  // 2. Seed page sections
  const sections = [
    {
      type: 'HERO',
      title: 'Where Creators Grow & Viewers Earn',
      subtitle: 'The premier ecosystem for authentic creator growth and viewer rewards.',
      content: {
        ctaText: 'Get Started',
        ctaLink: '/register',
        secondaryCtaText: 'Learn More',
        secondaryCtaLink: '#how-it-works',
        heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=675&fit=crop',
      },
      order: 0,
      isVisible: true,
    },
    {
      type: 'TRUST',
      title: 'Trusted by top platforms and creators',
      subtitle: '',
      content: {
        stats: [
          { label: 'Active Users', value: '100k+' },
          { label: 'Paid Out', value: '₹50L+' },
          { label: 'Campaigns Launched', value: '10k+' },
        ],
      },
      order: 1,
      isVisible: true,
    },
    {
      type: 'HOW_IT_WORKS',
      title: 'How It Works',
      subtitle: 'Simple. Transparent. Rewarding.',
      content: {
        steps: [
          { title: '1. Join the Platform', description: 'Sign up as a Creator or Viewer in seconds.' },
          { title: '2. Complete/Launch Tasks', description: 'Creators set budgets; viewers perform genuine engagement tasks.' },
          { title: '3. Get Rewarded', description: 'Viewers withdraw earnings; creators see authentic channel growth.' },
        ],
      },
      order: 2,
      isVisible: true,
    },
    {
      type: 'FEATURES',
      title: 'Powering the Creator Economy',
      subtitle: 'Advanced tools for both sides of the ecosystem.',
      content: {
        features: [
          { title: 'Authentic Engagement', description: 'Real users, real retention, no bot farms.' },
          { title: 'AI Recommendations', description: 'Get matched with the perfect audience.' },
          { title: 'Secure Ledgers', description: 'Transparent earnings and transaction audit trails.' },
        ],
      },
      order: 3,
      isVisible: true,
    },
    {
      type: 'AI_RECOMMENDATIONS',
      title: 'Smart Matching System',
      subtitle: 'Our AI engine connects creators with the viewers most likely to love their content.',
      content: {},
      order: 4,
      isVisible: true,
    },
    {
      type: 'CREATOR_SHOWCASE',
      title: 'Creator Spotlight',
      subtitle: 'Featured creators crushing it on The Social Bite.',
      content: {},
      order: 5,
      isVisible: true,
    },
    {
      type: 'MARKETPLACE_PREVIEW',
      title: 'Live Campaign Feed',
      subtitle: 'Browse real-time tasks available right now.',
      content: {},
      order: 6,
      isVisible: true,
    },
    {
      type: 'EARNINGS',
      title: 'Start Earning Today',
      subtitle: 'How much can you make by engaging with content?',
      content: {},
      order: 7,
      isVisible: true,
    },
    {
      type: 'TESTIMONIALS',
      title: 'Loved by Thousands',
      subtitle: "Don't just take our word for it. Hear from the creators and viewers who use The Social Bite daily.",
      content: {},
      order: 8,
      isVisible: true,
    },
    {
      type: 'PRICING',
      title: 'Simple, Transparent Pricing',
      subtitle: 'Viewers earn for free forever. Creators pay a simple flat rate or scale up for advanced features.',
      content: {},
      order: 9,
      isVisible: true,
    },
    {
      type: 'FAQ',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about The Social Bite.',
      content: {},
      order: 10,
      isVisible: true,
    },
    {
      type: 'FINAL_CTA',
      title: 'Ready to Supercharge Your Social Growth?',
      subtitle: 'Join thousands of creators and viewers today.',
      content: {
        ctaText: 'Sign Up Now',
        ctaLink: '/register',
      },
      order: 11,
      isVisible: true,
    },
  ];

  for (const sec of sections) {
    const existing = await prisma.cMSSection.findFirst({ where: { type: sec.type } });
    if (!existing) {
      await prisma.cMSSection.create({ data: sec });
    }
  }
  console.log('Homepage sections seeded.');

  // 3. Seed Pricing plans
  const pricingPlans = [
    {
      name: 'Creator',
      price: 0,
      currency: 'INR',
      period: '',
      features: ['Access to basic viewers', 'Standard analytics', 'Up to 3 active campaigns', 'Email support'],
      badgeLabel: '',
      buttonText: 'Start For Free',
      isPopular: false,
      order: 0,
    },
    {
      name: 'Pro Creator',
      price: 3999,
      currency: 'INR',
      period: '/mo',
      features: ['Access to Premium viewers', 'Real-time ROI dashboard', 'Unlimited active campaigns', 'Priority AI Recommendations', '24/7 Priority support'],
      badgeLabel: 'Most Popular',
      buttonText: 'Get Pro',
      isPopular: true,
      order: 1,
    },
    {
      name: 'Agency',
      price: 24999,
      currency: 'INR',
      period: '/mo',
      features: ['Everything in Pro', 'White-labeled dashboard', 'Dedicated account manager', 'API Access', 'Custom viewer targeting'],
      badgeLabel: '',
      buttonText: 'Contact Sales',
      isPopular: false,
      order: 2,
    },
  ];

  for (const plan of pricingPlans) {
    const existing = await prisma.cMSPricingPlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.cMSPricingPlan.create({ data: plan });
    }
  }
  console.log('Pricing plans seeded.');

  // 4. Seed Testimonials
  const testimonials = [
    {
      name: 'Tech Reviewer Max',
      role: 'YouTube Creator',
      company: '',
      review: 'The Social Bite helped me jump from 10k to 50k subscribers in just two months. The engagement is completely real and my retention rates actually went up.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
      order: 0,
    },
    {
      name: 'Sarah Jenkins',
      role: 'Viewer & Earner',
      company: '',
      review: "I earn about $50 a week just by watching videos in my niche during my commute. It's the most transparent reward platform I've ever used.",
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      order: 1,
    },
    {
      name: 'David Chen',
      role: 'Marketing Director',
      company: '',
      review: 'As a brand, finding micro-influencers was a nightmare. Now we just launch a campaign and let the platform find the perfect audience for us.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      order: 2,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.cMSTestimonial.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.cMSTestimonial.create({ data: t });
    }
  }
  console.log('Testimonials seeded.');

  // 5. Seed FAQs
  const faqs = [
    {
      question: 'How do Viewers make money?',
      answer: 'Viewers earn coins by completing engagement tasks like watching YouTube videos, liking Instagram posts, or sharing content. Once you reach the minimum threshold, you can withdraw your coins for real cash via PayPal or Crypto.',
      order: 0,
    },
    {
      question: 'Are the views and engagement real?',
      answer: 'Yes. 100% real. We use advanced anti-cheat mechanisms, proprietary video players, and strict verification algorithms to ensure every task is completed by a real human being.',
      order: 1,
    },
    {
      question: 'How much does it cost to launch a campaign?',
      answer: 'You set your own budget! The cost per engagement varies depending on the platform and duration, but you can start a campaign with as little as $10.',
      order: 2,
    },
    {
      question: 'Can I use my earned coins to fund my own campaigns?',
      answer: 'Absolutely. Many creators start as viewers to earn coins, and then reinvest those coins to launch campaigns for their own content.',
      order: 3,
    },
    {
      question: 'Is this safe for my YouTube/Instagram account?',
      answer: 'Yes. Because all engagement comes from real humans interacting naturally through our platform, it complies with standard platform terms of service regarding genuine engagement.',
      order: 4,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.cMSFaq.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.cMSFaq.create({ data: faq });
    }
  }
  console.log('FAQs seeded.');

  // 6. Seed Menus
  const menuItems = [
    // Header Menu
    { menuType: 'HEADER', title: 'Features', url: '#features', order: 0 },
    { menuType: 'HEADER', title: 'Pricing', url: '#pricing', order: 1 },
    { menuType: 'HEADER', title: 'How it Works', url: '#how-it-works', order: 2 },
    // Footer Menu
    { menuType: 'FOOTER', title: 'Privacy Policy', url: '/privacy', order: 0 },
    { menuType: 'FOOTER', title: 'Terms of Service', url: '/terms', order: 1 },
    { menuType: 'FOOTER', title: 'Contact', url: '/contact', order: 2 },
  ];

  for (const item of menuItems) {
    const existing = await prisma.cMSMenuItem.findFirst({
      where: { menuType: item.menuType, title: item.title },
    });
    if (!existing) {
      await prisma.cMSMenuItem.create({ data: item });
    }
  }
  console.log('Menu items seeded.');

  // 7. Seed SEO
  const seoItems = [
    {
      pagePath: '/',
      metaTitle: 'The Social Bite - Creator Growth & Viewer Rewards',
      metaDescription: 'The premier ecosystem for authentic creator growth and viewer rewards. Connecting audiences with the creators they love.',
      ogTitle: 'The Social Bite - Grow & Earn',
      ogDescription: 'Grow your social media channel or earn rewards for genuine engagement.',
      keywords: 'creator growth, social media engagement, earn coins, rewards, YouTube growth, Instagram likes',
    },
    {
      pagePath: '/terms',
      metaTitle: 'Terms of Service - The Social Bite',
      metaDescription: 'Read the terms of service governing the use of The Social Bite platform.',
      ogTitle: 'Terms of Service - The Social Bite',
      ogDescription: 'Read the terms of service governing the use of The Social Bite platform.',
      keywords: 'terms of service, legal, policy',
    },
    {
      pagePath: '/privacy',
      metaTitle: 'Privacy Policy - The Social Bite',
      metaDescription: 'Read the privacy policy of The Social Bite.',
      ogTitle: 'Privacy Policy - The Social Bite',
      ogDescription: 'Read the privacy policy of The Social Bite.',
      keywords: 'privacy policy, security, data protection',
    },
    {
      pagePath: '/contact',
      metaTitle: 'Contact Us - The Social Bite',
      metaDescription: 'Get in touch with support or sales at The Social Bite.',
      ogTitle: 'Contact Us - The Social Bite',
      ogDescription: 'Get in touch with support or sales at The Social Bite.',
      keywords: 'contact, support, sales, email',
    },
  ];

  for (const seo of seoItems) {
    await prisma.cMSPageSeo.upsert({
      where: { pagePath: seo.pagePath },
      update: {},
      create: seo,
    });
  }
  console.log('SEO metadata seeded.');

  console.log('CMS Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
