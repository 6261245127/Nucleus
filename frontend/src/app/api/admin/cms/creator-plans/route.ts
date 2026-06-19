import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const plans = await prisma.cMSCreatorPlan.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { name, slug, price, campaignLimit, viewerRewardCoins, features, badgeText, buttonText, themeColor, order, isActive } = data;

    const newPlan = await prisma.cMSCreatorPlan.create({
      data: {
        name,
        slug,
        description: data.description || null,
        price,
        campaignLimit,
        viewerRewardCoins,
        features,
        badgeText,
        buttonText,
        themeColor,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
