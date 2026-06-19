import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();

    const updatedPlan = await prisma.cMSCreatorPlan.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        campaignLimit: data.campaignLimit,
        viewerRewardCoins: data.viewerRewardCoins,
        features: data.features,
        badgeText: data.badgeText,
        buttonText: data.buttonText,
        themeColor: data.themeColor,
        order: data.order,
        isActive: data.isActive
      }
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await prisma.cMSCreatorPlan.delete({ where: { id } });

    return NextResponse.json({ message: 'Plan deleted' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
