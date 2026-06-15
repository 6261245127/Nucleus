import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Total users (excluding admins)
    const totalUsers = await prisma.user.count({
      where: { role: 'VIEWER' }
    });

    // Total creators
    const totalCreators = await prisma.user.count({
      where: { role: 'CREATOR' }
    });

    // Total campaigns
    const totalCampaigns = await prisma.campaign.count();

    // Platform revenue (Assume some % of spent, for now we sum all fiat deposits)
    // Or just a metric showing total fiat deposited
    const totalFiatDeposits = await prisma.transaction.aggregate({
      where: { type: 'FIAT_DEPOSIT' },
      _sum: { amount: true }
    });

    return NextResponse.json({
      totalUsers,
      totalCreators,
      totalCampaigns,
      platformRevenue: totalFiatDeposits._sum.amount || 0,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
