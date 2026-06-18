import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const page = await prisma.cMSLegalPage.findUnique({
      where: { id }
    });

    if (!page) {
      return NextResponse.json({ message: 'Legal page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();
    const { slug, title, content, isPublished, effectiveDate, metaTitle, metaDescription } = data;

    // Verify existence
    const existing = await prisma.cMSLegalPage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Legal page not found' }, { status: 404 });
    }

    // Check slug collision
    if (slug && slug !== existing.slug) {
      const slugCollision = await prisma.cMSLegalPage.findUnique({ where: { slug } });
      if (slugCollision) {
        return NextResponse.json({ message: 'A page with this slug already exists' }, { status: 400 });
      }
    }

    const updated = await prisma.cMSLegalPage.update({
      where: { id },
      data: {
        slug: slug !== undefined ? slug : existing.slug,
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
        effectiveDate: effectiveDate !== undefined ? (effectiveDate ? new Date(effectiveDate) : null) : existing.effectiveDate,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription
      }
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_LEGAL_PAGE',
        resource: `CMSLegalPage:${id}`,
        details: { title: updated.title, slug: updated.slug }
      }
    });

    return NextResponse.json({ message: 'Legal page updated successfully', page: updated });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.cMSLegalPage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Legal page not found' }, { status: 404 });
    }

    await prisma.cMSLegalPage.delete({ where: { id } });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_LEGAL_PAGE',
        resource: `CMSLegalPage:${id}`,
        details: { title: existing.title, slug: existing.slug }
      }
    });

    return NextResponse.json({ message: 'Legal page deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
