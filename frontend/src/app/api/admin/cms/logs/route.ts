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

    const logs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            'CREATE_SECTION', 'UPDATE_SECTION', 'DELETE_SECTION', 'BULK_REORDER_SECTIONS',
            'UPDATE_SETTINGS',
            'UPLOAD_MEDIA', 'DELETE_MEDIA',
            'CREATE_PRICING_PLAN', 'UPDATE_PRICING_PLAN', 'DELETE_PRICING_PLAN', 'BULK_REORDER_PRICING_PLANS',
            'CREATE_MENU_ITEM', 'UPDATE_MENU_ITEM', 'DELETE_MENU_ITEM', 'BULK_REORDER_MENU_ITEMS',
            'CREATE_TESTIMONIAL', 'UPDATE_TESTIMONIAL', 'DELETE_TESTIMONIAL', 'BULK_REORDER_TESTIMONIALS',
            'CREATE_FAQ', 'UPDATE_FAQ', 'DELETE_FAQ', 'BULK_REORDER_FAQS',
            'UPDATE_SEO',
            'CREATE_ANNOUNCEMENT', 'UPDATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT'
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching CMS audit logs:', error);
    return NextResponse.json({ message: 'Error fetching logs', error: error.message }, { status: 500 });
  }
}
