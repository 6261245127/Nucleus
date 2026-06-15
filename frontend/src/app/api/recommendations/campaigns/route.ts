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
      select: { niches: true, preferences: true }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch active campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      include: {
        creator: { select: { name: true, avatarUrl: true } },
        _count: { select: { tasks: true } }
      }
    });

    const userNiches = new Set(user.niches || []);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Score and rank campaigns
    const scoredCampaigns = campaigns.map(campaign => {
      let score = 0;

      // Niche Match (+50)
      if (userNiches.has(campaign.niche)) {
        score += 50;
      }

      // Reward Value (+ scaled)
      score += Math.min(campaign.rewardPerTask * 2, 20); // Cap at 20 pts

      // Recency (+15)
      if (new Date(campaign.createdAt) >= oneWeekAgo) {
        score += 15;
      }

      return { ...campaign, matchScore: score };
    });

    // Sort descending by score
    scoredCampaigns.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ data: scoredCampaigns });
  } catch (error) {
    console.error('Campaign recommendations error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
