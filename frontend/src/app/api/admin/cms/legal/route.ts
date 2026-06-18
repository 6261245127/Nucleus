import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const pages = await prisma.cMSLegalPage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ pages });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const { slug, title, content, isPublished, effectiveDate, metaTitle, metaDescription } = data;

    if (!slug || !title || !content) {
      return NextResponse.json({ message: 'Slug, title, and content are required' }, { status: 400 });
    }

    // Check if slug exists
    const existing = await prisma.cMSLegalPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ message: 'A page with this slug already exists' }, { status: 400 });
    }

    const newPage = await prisma.cMSLegalPage.create({
      data: {
        slug,
        title,
        content,
        isPublished: isPublished || false,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        metaTitle,
        metaDescription
      }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_LEGAL_PAGE',
        resource: `CMSLegalPage:${newPage.id}`,
        details: { title, slug }
      }
    });

    return NextResponse.json({ message: 'Legal page created successfully', page: newPage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
