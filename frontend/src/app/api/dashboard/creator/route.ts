import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'CREATOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const creatorId = authUser.id;

    const [
      totalCampaigns,
      activeCampaigns,
      totalEngagement,
      totalSpent
    ] = await Promise.all([
      prisma.campaign.count({
        where: { creatorId }
      }),
      prisma.campaign.count({
        where: { creatorId, status: 'ACTIVE' }
      }),
      prisma.task.count({
        where: { campaign: { creatorId }, status: { in: ['COMPLETED', 'VERIFIED'] } }
      }),
      prisma.task.aggregate({
        where: { campaign: { creatorId }, status: { in: ['COMPLETED', 'VERIFIED'] } },
        _sum: { rewardAmount: true }
      })
    ]);

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalEngagement,
      totalSpent: totalSpent._sum.rewardAmount || 0,
    });

  } catch (error) {
    console.error('Creator stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
