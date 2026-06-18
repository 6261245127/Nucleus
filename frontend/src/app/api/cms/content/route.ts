import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.cMSSetting.findUnique({
      where: { id: 'global-settings' }
    });

    const sections = await prisma.cMSSection.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' }
    });

    const pricingPlans = await prisma.cMSPricingPlan.findMany({
      orderBy: { order: 'asc' }
    });

    const testimonials = await prisma.cMSTestimonial.findMany({
      orderBy: { order: 'asc' }
    });

    const faqs = await prisma.cMSFaq.findMany({
      orderBy: { order: 'asc' }
    });

    const menuItems = await prisma.cMSMenuItem.findMany({
      orderBy: { order: 'asc' }
    });

    const announcements = await prisma.cMSAnnouncement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const seo = await prisma.cMSPageSeo.findMany();

    return NextResponse.json({
      settings,
      sections,
      pricingPlans,
      testimonials,
      faqs,
      menuItems,
      announcements,
      seo
    });
  } catch (error: any) {
    console.error('Error fetching CMS content:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
