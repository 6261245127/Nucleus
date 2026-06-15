import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const viewerId = authUser.id;

    const completedCampaignIds = await prisma.task.findMany({
      where: { viewerId },
      select: { campaignId: true },
    });

    const completedIds = completedCampaignIds.map((t) => t.campaignId);

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: completedIds },
        OR: [
          { adminEndDate: null },
          { adminEndDate: { gte: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        platform: true,
        url: true,
        description: true,
        rewardPerTask: true,
        creator: {
          select: { name: true, avatarUrl: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
