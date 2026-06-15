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
      select: { 
        niches: true
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch creators who have active campaigns
    const creators = await prisma.user.findMany({
      where: { 
        role: 'CREATOR',
        accountStatus: 'ACTIVE',
        campaigns: { some: { status: 'ACTIVE' } }
      },
      include: {
        campaigns: { 
          where: { status: 'ACTIVE' },
          select: { niche: true }
        },
        _count: { select: { campaigns: true } }
      }
    });

    const userNiches = new Set(user.niches || []);

    // Score and rank creators
    const scoredCreators = creators.map(creator => {
      let score = 0;
      let matchedCampaignsCount = 0;

      // Niche Match: +10 pts for each active campaign matching a user's niche
      creator.campaigns.forEach(c => {
        if (userNiches.has(c.niche)) {
          score += 10;
          matchedCampaignsCount++;
        }
      });

      return {
        id: creator.id,
        name: creator.name,
        avatarUrl: creator.avatarUrl,
        isFollowing: false,
        matchedNichesCount: matchedCampaignsCount,
        totalActiveCampaigns: creator._count.campaigns,
        followersCount: 0,
        matchScore: score
      };
    });

    // Sort descending by score
    scoredCreators.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ data: scoredCreators });
  } catch (error) {
    console.error('Creator recommendations error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
