import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'VIEWER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const userId = authUser.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      wallet,
      tasksCompleted,
      referralEarnings,
      weeklyEarnings,
      recentEarnings,
      userStat
    ] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId },
        select: { coinBalance: true }
      }),
      prisma.task.count({
        where: { viewerId: userId, status: 'COMPLETED' }
      }),
      prisma.transaction.aggregate({
        where: { wallet: { userId }, type: 'REFERRAL_REWARD' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          wallet: { userId },
          createdAt: { gte: sevenDaysAgo },
          type: { in: ['TASK_REWARD', 'REFERRAL_REWARD', 'BONUS_REWARD'] }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where: { wallet: { userId }, amount: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          description: true,
          createdAt: true,
        }
      }),
      prisma.userStat.findUnique({
        where: { userId }
      })
    ]);

    return NextResponse.json({
      totalCoins: wallet?.coinBalance || 0,
      tasksCompleted,
      referralEarnings: referralEarnings._sum.amount || 0,
      weeklyEarnings: weeklyEarnings._sum.amount || 0,
      recentEarnings: recentEarnings.map(tx => ({
        id: tx.id,
        desc: tx.description || 'Earned coins',
        coins: tx.amount,
        time: tx.createdAt
      })),
      gamification: {
        level: userStat?.level || 1,
        currentStreak: userStat?.currentStreak || 0,
        longestStreak: userStat?.longestStreak || 0,
        totalTasks: userStat?.totalTasks || 0,
      }
    });

  } catch (error) {
    console.error('Viewer stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
