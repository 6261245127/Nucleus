const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pages = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `# Privacy Policy\n\nWelcome to The Social Bite. This privacy policy explains how we collect, use, and protect your data across our SaaS platform, creator marketplace, and rewards systems.\n\n## 1. Information We Collect\nWe collect information you provide directly, such as your name, email, payment details (for creators), and withdrawal details (for viewers).\n\n## 2. How We Use Information\nWe use the collected information to operate our platform, process transactions, prevent fraud, and comply with legal obligations.\n\n## 3. Data Rights\nIn accordance with GDPR and CCPA, you have the right to access, update, or delete your personal data. Contact our support team to exercise these rights.\n\n## 4. Admin Moderation\nPlatform administrators have access to specific user data to investigate fraud, monitor campaign compliance, and resolve disputes.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Privacy Policy | The Social Bite',
    metaDescription: 'Read our Privacy Policy to understand how we protect your data.'
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    content: `# Terms of Service\n\nThese Terms of Service govern your use of The Social Bite.\n\n## 1. Account Responsibilities\nYou are responsible for maintaining the security of your account. You must not use the platform for any illegal activities.\n\n## 2. Creator Campaigns\nCreators must ensure that all promoted content complies with platform guidelines. We reserve the right to suspend or reject any campaign that violates our terms.\n\n## 3. Viewer Rewards\nViewers earn coins for completing tasks. Any attempt to automate or manipulate the reward system will result in immediate account termination and forfeiture of all earnings.\n\n## 4. Termination\nWe reserve the right to suspend or terminate your account at any time for violating these terms.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Terms of Service | The Social Bite',
    metaDescription: 'Our Terms of Service govern the use of The Social Bite platform.'
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    content: `# Cookie Policy\n\nWe use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. You can control cookies through your browser settings.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Cookie Policy | The Social Bite',
    metaDescription: 'Information about how we use cookies.'
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    content: `# Refund Policy\n\nFor Creators: Campaign funds are non-refundable once tasks have been completed by viewers. Unused budgets from paused or cancelled campaigns can be withdrawn or applied to future campaigns, subject to an administrative review.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Refund Policy | The Social Bite',
    metaDescription: 'Our refund policy for creators and advertisers.'
  },
  {
    slug: 'earnings-rewards-policy',
    title: 'Earnings & Rewards Policy',
    content: `# Earnings & Rewards Policy\n\nViewers earn rewards by engaging with creator campaigns. \n\n## Rules\n1. No bots or automated scripts.\n2. Minimum withdrawal thresholds apply.\n3. We may hold funds during fraud investigations.\n4. Withdrawal requests are processed within 3-5 business days.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Earnings Policy | The Social Bite',
    metaDescription: 'Rules regarding earning and withdrawing rewards.'
  },
  {
    slug: 'creator-campaign-policy',
    title: 'Creator Campaign Policy',
    content: `# Creator Campaign Policy\n\nCreators are expected to foster a safe and respectful environment. Campaigns promoting violence, hate speech, explicit content, or scams will be immediately removed and the creator account may be banned.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Campaign Policy | The Social Bite',
    metaDescription: 'Guidelines for running campaigns on our platform.'
  },
  {
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    content: `# Community Guidelines\n\nOur platform thrives on authenticity. Be respectful, do not spam, and ensure your interactions on social platforms are genuine. Admins monitor activity to keep the community safe.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'Community Guidelines | The Social Bite',
    metaDescription: 'Guidelines for participating in our community.'
  },
  {
    slug: 'dmca-copyright-policy',
    title: 'DMCA / Copyright Policy',
    content: `# DMCA Policy\n\nWe respect intellectual property rights. If you believe your copyrighted work is being infringed upon by a campaign on our platform, please submit a DMCA takedown notice to our support team with proof of ownership.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'DMCA Policy | The Social Bite',
    metaDescription: 'Our copyright and DMCA takedown policy.'
  },
  {
    slug: 'gdpr-data-rights',
    title: 'GDPR & Data Rights Policy',
    content: `# GDPR & Data Rights\n\nIf you are an EU resident, you have the right to request a copy of your data, request corrections, or request deletion ("Right to be Forgotten"). We process these requests within 30 days.`,
    isPublished: true,
    effectiveDate: new Date(),
    metaTitle: 'GDPR Policy | The Social Bite',
    metaDescription: 'Information for EU residents regarding GDPR.'
  }
];

async function seed() {
  console.log('Seeding Legal Pages...');
  for (const page of pages) {
    await prisma.cMSLegalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    });
  }
  console.log('Finished seeding 9 legal pages.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
