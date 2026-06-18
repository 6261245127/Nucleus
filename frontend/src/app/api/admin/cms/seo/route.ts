import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const seo = await prisma.cMSPageSeo.findMany({
      orderBy: { pagePath: 'asc' }
    });

    return NextResponse.json({ seo });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching SEO settings', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { pagePath, metaTitle, metaDescription, ogTitle, ogDescription, keywords, ogImage } = body;

    if (!pagePath || !metaTitle || !metaDescription) {
      return NextResponse.json({ message: 'Page path, meta title, and meta description are required' }, { status: 400 });
    }

    const previous = await prisma.cMSPageSeo.findUnique({
      where: { pagePath }
    });

    const updated = await prisma.cMSPageSeo.upsert({
      where: { pagePath },
      update: {
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        keywords,
        ogImage
      },
      create: {
        pagePath,
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        keywords,
        ogImage
      }
    });

    // Write to Audit Log
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_SEO',
        resource: `CMSPageSeo:${pagePath}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'SEO configuration updated successfully', seo: updated });
  } catch (error: any) {
    console.error('Error updating SEO:', error);
    return NextResponse.json({ message: 'Error updating SEO', error: error.message }, { status: 500 });
  }
}
