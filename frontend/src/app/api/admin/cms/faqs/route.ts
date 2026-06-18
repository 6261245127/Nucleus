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

    const faqs = await prisma.cMSFaq.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ faqs });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching FAQs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { question, answer, order } = body;

    if (!question || !answer) {
      return NextResponse.json({ message: 'Question and answer are required' }, { status: 400 });
    }

    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrder = await prisma.cMSFaq.findFirst({
        orderBy: { order: 'desc' }
      });
      finalOrder = maxOrder ? maxOrder.order + 1 : 0;
    }

    const faq = await prisma.cMSFaq.create({
      data: {
        question,
        answer,
        order: finalOrder
      }
    });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'CREATE_FAQ',
        resource: `CMSFaq:${faq.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          faq
        }
      }
    });

    return NextResponse.json({ message: 'FAQ created successfully', faq });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ message: 'Error creating FAQ', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });

    // Check if bulk reordering (array of FAQs)
    if (Array.isArray(body)) {
      const updates = body.map((f: any) => 
        prisma.cMSFaq.update({
          where: { id: f.id },
          data: { order: f.order }
        })
      );

      await prisma.$transaction(updates);

      // Log bulk reorder
      await prisma.auditLog.create({
        data: {
          userId: authUser.id,
          action: 'BULK_REORDER_FAQS',
          resource: 'CMSFaq',
          details: {
            adminEmail: user?.email,
            adminName: user?.name,
            count: body.length
          }
        }
      });

      return NextResponse.json({ message: 'FAQs reordered successfully' });
    }

    // Single FAQ update
    const { id, question, answer, order } = body;
    if (!id) {
      return NextResponse.json({ message: 'FAQ ID required' }, { status: 400 });
    }

    const previous = await prisma.cMSFaq.findUnique({
      where: { id }
    });

    if (!previous) {
      return NextResponse.json({ message: 'FAQ not found' }, { status: 404 });
    }

    const updated = await prisma.cMSFaq.update({
      where: { id },
      data: {
        question,
        answer,
        order
      }
    });

    // Write to Audit Log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_FAQ',
        resource: `CMSFaq:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'FAQ updated successfully', faq: updated });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ message: 'Error updating FAQ', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'FAQ ID required' }, { status: 400 });
    }

    const faq = await prisma.cMSFaq.findUnique({ where: { id } });
    if (!faq) {
      return NextResponse.json({ message: 'FAQ not found' }, { status: 404 });
    }

    await prisma.cMSFaq.delete({ where: { id } });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_FAQ',
        resource: `CMSFaq:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          faq
        }
      }
    });

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ message: 'Error deleting FAQ', error: error.message }, { status: 500 });
  }
}
