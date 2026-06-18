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

    const plans = await prisma.cMSPricingPlan.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching pricing plans', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, currency, period, features, badgeLabel, buttonText, isPopular, order } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ message: 'Plan name and price are required' }, { status: 400 });
    }

    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrderPlan = await prisma.cMSPricingPlan.findFirst({
        orderBy: { order: 'desc' }
      });
      finalOrder = maxOrderPlan ? maxOrderPlan.order + 1 : 0;
    }

    const plan = await prisma.cMSPricingPlan.create({
      data: {
        name,
        price: parseFloat(price),
        currency: currency || 'INR',
        period: period || '',
        features: features || [],
        badgeLabel: badgeLabel || '',
        buttonText: buttonText || 'Get Started',
        isPopular: !!isPopular,
        order: finalOrder
      }
    });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'CREATE_PRICING_PLAN',
        resource: `CMSPricingPlan:${plan.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          plan
        }
      }
    });

    return NextResponse.json({ message: 'Pricing plan created successfully', plan });
  } catch (error: any) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json({ message: 'Error creating pricing plan', error: error.message }, { status: 500 });
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

    // Check if bulk reordering (array of plans)
    if (Array.isArray(body)) {
      const updates = body.map((plan: any) => 
        prisma.cMSPricingPlan.update({
          where: { id: plan.id },
          data: { order: plan.order }
        })
      );

      await prisma.$transaction(updates);

      // Log bulk reorder
      await prisma.auditLog.create({
        data: {
          userId: authUser.id,
          action: 'BULK_REORDER_PRICING_PLANS',
          resource: 'CMSPricingPlan',
          details: {
            adminEmail: user?.email,
            adminName: user?.name,
            count: body.length
          }
        }
      });

      return NextResponse.json({ message: 'Plans reordered successfully' });
    }

    // Single plan update
    const { id, name, price, currency, period, features, badgeLabel, buttonText, isPopular, order } = body;
    if (!id) {
      return NextResponse.json({ message: 'Plan ID required' }, { status: 400 });
    }

    const previous = await prisma.cMSPricingPlan.findUnique({
      where: { id }
    });

    if (!previous) {
      return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
    }

    const updated = await prisma.cMSPricingPlan.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        currency,
        period,
        features,
        badgeLabel,
        buttonText,
        isPopular: isPopular !== undefined ? !!isPopular : undefined,
        order
      }
    });

    // Write to Audit Log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_PRICING_PLAN',
        resource: `CMSPricingPlan:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'Pricing plan updated successfully', plan: updated });
  } catch (error: any) {
    console.error('Error updating pricing plan:', error);
    return NextResponse.json({ message: 'Error updating pricing plan', error: error.message }, { status: 500 });
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
      return NextResponse.json({ message: 'Plan ID required' }, { status: 400 });
    }

    const plan = await prisma.cMSPricingPlan.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ message: 'Pricing plan not found' }, { status: 404 });
    }

    await prisma.cMSPricingPlan.delete({ where: { id } });

    // Log action
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_PRICING_PLAN',
        resource: `CMSPricingPlan:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          plan
        }
      }
    });

    return NextResponse.json({ message: 'Pricing plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting pricing plan:', error);
    return NextResponse.json({ message: 'Error deleting pricing plan', error: error.message }, { status: 500 });
  }
}
