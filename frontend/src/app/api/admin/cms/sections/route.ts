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

    const sections = await prisma.cMSSection.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ sections });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching sections', error: error.message }, { status: 500 });
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

    // Check if bulk reordering (array of sections)
    if (Array.isArray(body)) {
      const updates = body.map((sec: any) => 
        prisma.cMSSection.update({
          where: { id: sec.id },
          data: { order: sec.order, isVisible: sec.isVisible }
        })
      );

      await prisma.$transaction(updates);

      // Log bulk reorder
      await prisma.auditLog.create({
        data: {
          userId: authUser.id,
          action: 'BULK_REORDER_SECTIONS',
          resource: 'CMSSection',
          details: {
            adminEmail: user?.email,
            adminName: user?.name,
            count: body.length
          }
        }
      });

      return NextResponse.json({ message: 'Sections reordered successfully' });
    }

    // Single section update
    const { id, title, subtitle, content, isVisible, order } = body;
    if (!id) {
      return NextResponse.json({ message: 'Section ID required' }, { status: 400 });
    }

    const previous = await prisma.cMSSection.findUnique({
      where: { id }
    });

    if (!previous) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    const updated = await prisma.cMSSection.update({
      where: { id },
      data: {
        title,
        subtitle,
        content,
        isVisible,
        order
      }
    });

    // Write to Audit Log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_SECTION',
        resource: `CMSSection:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          type: updated.type,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'Section updated successfully', section: updated });
  } catch (error: any) {
    console.error('Error updating sections:', error);
    return NextResponse.json({ message: 'Error updating sections', error: error.message }, { status: 500 });
  }
}

// POST: Create a new custom landing page section
export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { type, title, subtitle, content, isVisible, order } = body;

    if (!type) {
      return NextResponse.json({ message: 'Section type required' }, { status: 400 });
    }

    // Determine order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrderSection = await prisma.cMSSection.findFirst({
        orderBy: { order: 'desc' }
      });
      finalOrder = maxOrderSection ? maxOrderSection.order + 1 : 0;
    }

    const section = await prisma.cMSSection.create({
      data: {
        type,
        title,
        subtitle,
        content: content || {},
        isVisible: isVisible !== undefined ? isVisible : true,
        order: finalOrder
      }
    });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'CREATE_SECTION',
        resource: `CMSSection:${section.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          section
        }
      }
    });

    return NextResponse.json({ message: 'Section created successfully', section });
  } catch (error: any) {
    console.error('Error creating section:', error);
    return NextResponse.json({ message: 'Error creating section', error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a custom section
export async function DELETE(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Section ID required' }, { status: 400 });
    }

    const section = await prisma.cMSSection.findUnique({ where: { id } });
    if (!section) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    await prisma.cMSSection.delete({ where: { id } });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_SECTION',
        resource: `CMSSection:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          section
        }
      }
    });

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ message: 'Error deleting section', error: error.message }, { status: 500 });
  }
}
