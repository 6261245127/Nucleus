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

    const testimonials = await prisma.cMSTestimonial.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ testimonials });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching testimonials', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, role, company, image, review, rating, order } = body;

    if (!name || !role || !review) {
      return NextResponse.json({ message: 'Name, role, and review are required' }, { status: 400 });
    }

    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrder = await prisma.cMSTestimonial.findFirst({
        orderBy: { order: 'desc' }
      });
      finalOrder = maxOrder ? maxOrder.order + 1 : 0;
    }

    const testimonial = await prisma.cMSTestimonial.create({
      data: {
        name,
        role,
        company: company || '',
        image: image || '',
        review,
        rating: rating !== undefined ? parseInt(rating) : 5,
        order: finalOrder
      }
    });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'CREATE_TESTIMONIAL',
        resource: `CMSTestimonial:${testimonial.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          testimonial
        }
      }
    });

    return NextResponse.json({ message: 'Testimonial created successfully', testimonial });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ message: 'Error creating testimonial', error: error.message }, { status: 500 });
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

    // Check if bulk reordering (array of testimonials)
    if (Array.isArray(body)) {
      const updates = body.map((t: any) => 
        prisma.cMSTestimonial.update({
          where: { id: t.id },
          data: { order: t.order }
        })
      );

      await prisma.$transaction(updates);

      // Log bulk reorder
      await prisma.auditLog.create({
        data: {
          userId: authUser.id,
          action: 'BULK_REORDER_TESTIMONIALS',
          resource: 'CMSTestimonial',
          details: {
            adminEmail: user?.email,
            adminName: user?.name,
            count: body.length
          }
        }
      });

      return NextResponse.json({ message: 'Testimonials reordered successfully' });
    }

    // Single testimonial update
    const { id, name, role, company, image, review, rating, order } = body;
    if (!id) {
      return NextResponse.json({ message: 'Testimonial ID required' }, { status: 400 });
    }

    const previous = await prisma.cMSTestimonial.findUnique({
      where: { id }
    });

    if (!previous) {
      return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    }

    const updated = await prisma.cMSTestimonial.update({
      where: { id },
      data: {
        name,
        role,
        company,
        image,
        review,
        rating: rating !== undefined ? parseInt(rating) : undefined,
        order
      }
    });

    // Write to Audit Log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_TESTIMONIAL',
        resource: `CMSTestimonial:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'Testimonial updated successfully', testimonial: updated });
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ message: 'Error updating testimonial', error: error.message }, { status: 500 });
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
      return NextResponse.json({ message: 'Testimonial ID required' }, { status: 400 });
    }

    const testimonial = await prisma.cMSTestimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    }

    await prisma.cMSTestimonial.delete({ where: { id } });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_TESTIMONIAL',
        resource: `CMSTestimonial:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          testimonial
        }
      }
    });

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ message: 'Error deleting testimonial', error: error.message }, { status: 500 });
  }
}
