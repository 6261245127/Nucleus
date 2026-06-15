import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { niches: true }
    });

    const userNiches = user?.niches || [];

    // Count active campaigns by niche
    const activeCampaigns = await prisma.campaign.groupBy({
      by: ['niche'],
      where: { status: 'ACTIVE' },
      _count: { _all: true }
    });

    const insights = userNiches.map(niche => {
      const match = activeCampaigns.find(c => c.niche === niche);
      return {
        niche,
        activeCount: match ? match._count._all : 0
      };
    });

    // Sort by active count
    insights.sort((a, b) => b.activeCount - a.activeCount);

    return NextResponse.json({ data: insights });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
