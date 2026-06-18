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

    const menuItems = await prisma.cMSMenuItem.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ menuItems });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching navigation', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { menuType, title, url, icon, order, parentId } = body;

    if (!menuType || !title || !url) {
      return NextResponse.json({ message: 'Menu type, title, and URL are required' }, { status: 400 });
    }

    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrderItem = await prisma.cMSMenuItem.findFirst({
        where: { menuType },
        orderBy: { order: 'desc' }
      });
      finalOrder = maxOrderItem ? maxOrderItem.order + 1 : 0;
    }

    const menuItem = await prisma.cMSMenuItem.create({
      data: {
        menuType,
        title,
        url,
        icon,
        order: finalOrder,
        parentId
      }
    });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'CREATE_MENU_ITEM',
        resource: `CMSMenuItem:${menuItem.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          menuItem
        }
      }
    });

    return NextResponse.json({ message: 'Menu item created successfully', menuItem });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ message: 'Error creating menu item', error: error.message }, { status: 500 });
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

    // Check if bulk reordering (array of menu items)
    if (Array.isArray(body)) {
      const updates = body.map((item: any) => 
        prisma.cMSMenuItem.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      );

      await prisma.$transaction(updates);

      // Log bulk reorder
      await prisma.auditLog.create({
        data: {
          userId: authUser.id,
          action: 'BULK_REORDER_MENU_ITEMS',
          resource: 'CMSMenuItem',
          details: {
            adminEmail: user?.email,
            adminName: user?.name,
            count: body.length
          }
        }
      });

      return NextResponse.json({ message: 'Menu items reordered successfully' });
    }

    // Single menu item update
    const { id, menuType, title, url, icon, order, parentId } = body;
    if (!id) {
      return NextResponse.json({ message: 'Menu item ID required' }, { status: 400 });
    }

    const previous = await prisma.cMSMenuItem.findUnique({
      where: { id }
    });

    if (!previous) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    const updated = await prisma.cMSMenuItem.update({
      where: { id },
      data: {
        menuType,
        title,
        url,
        icon,
        order,
        parentId
      }
    });

    // Write to Audit Log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_MENU_ITEM',
        resource: `CMSMenuItem:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'Menu item updated successfully', menuItem: updated });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ message: 'Error updating menu item', error: error.message }, { status: 500 });
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
      return NextResponse.json({ message: 'Menu item ID required' }, { status: 400 });
    }

    const menuItem = await prisma.cMSMenuItem.findUnique({ where: { id } });
    if (!menuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    await prisma.cMSMenuItem.delete({ where: { id } });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_MENU_ITEM',
        resource: `CMSMenuItem:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          menuItem
        }
      }
    });

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ message: 'Error deleting menu item', error: error.message }, { status: 500 });
  }
}
