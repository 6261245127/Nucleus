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

    const announcements = await prisma.cMSAnnouncement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching announcements', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { message, link, isActive, startDate, endDate } = body;

    if (!message) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    // If making this active, optionally disable other announcements to keep only one active
    if (isActive) {
      await prisma.cMSAnnouncement.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const announcement = await prisma.cMSAnnouncement.create({
      data: {
        message,
        link: link || '',
        isActive: isActive !== undefined ? !!isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'CREATE_ANNOUNCEMENT',
        resource: `CMSAnnouncement:${announcement.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          announcement
        }
      }
    });

    return NextResponse.json({ message: 'Announcement created successfully', announcement });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ message: 'Error creating announcement', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, message, link, isActive, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const previous = await prisma.cMSAnnouncement.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    // If making this active, disable others
    if (isActive && !previous.isActive) {
      await prisma.cMSAnnouncement.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false }
      });
    }

    const updated = await prisma.cMSAnnouncement.update({
      where: { id },
      data: {
        message,
        link,
        isActive: isActive !== undefined ? !!isActive : undefined,
        startDate: startDate ? new Date(startDate) : startDate === null ? null : undefined,
        endDate: endDate ? new Date(endDate) : endDate === null ? null : undefined
      }
    });

    // Write to Audit Log
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_ANNOUNCEMENT',
        resource: `CMSAnnouncement:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'Announcement updated successfully', announcement: updated });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ message: 'Error updating announcement', error: error.message }, { status: 500 });
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
      return NextResponse.json({ message: 'Announcement ID required' }, { status: 400 });
    }

    const announcement = await prisma.cMSAnnouncement.findUnique({ where: { id } });
    if (!announcement) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    await prisma.cMSAnnouncement.delete({ where: { id } });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_ANNOUNCEMENT',
        resource: `CMSAnnouncement:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          announcement
        }
      }
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ message: 'Error deleting announcement', error: error.message }, { status: 500 });
  }
}
