import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCreators,
      verifiedUsers,
      pendingVerification,
      suspendedUsers,
      totalCoinsResult,
      newUsersThisMonth
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.user.count({ where: { isVerified: true, role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { isVerified: false, role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { accountStatus: 'SUSPENDED' } }),
      prisma.wallet.aggregate({ _sum: { coinBalance: true } }),
      prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth }, role: { not: 'ADMIN' } } })
    ]);

    return NextResponse.json({
      totalUsers,
      totalCreators,
      verifiedUsers,
      pendingVerification,
      suspendedUsers,
      totalCoinsDistributed: totalCoinsResult._sum.coinBalance || 0,
      newUsersThisMonth
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
