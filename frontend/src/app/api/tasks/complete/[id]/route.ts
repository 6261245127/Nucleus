import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = authenticate(req);
    if (!authUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const viewerId = authUser.id;
    const { id: campaignId } = await params;
    const body = await req.json().catch(() => ({}));

    // Expecting progress from the in-app player (100 means completed the requirement)
    if (body.progress !== 100) {
      return NextResponse.json({ message: 'Task verification failed. You did not watch long enough or skipped.' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Campaign is not available' }, { status: 400 });
    }

    const existing = await prisma.task.findFirst({
      where: { campaignId, viewerId },
    });
    if (existing) {
      return NextResponse.json({ message: 'You have already completed this task' }, { status: 400 });
    }

    // dailyLimit feature has been removed from schema.
    const totalSpent = await prisma.task.aggregate({
      where: { campaignId, status: { in: ['COMPLETED', 'VERIFIED'] } },
      _sum: { rewardAmount: true },
    });
    const spent = totalSpent._sum.rewardAmount || 0;
    if (spent + campaign.rewardPerTask > campaign.budget) {
      await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'COMPLETED' } });
      return NextResponse.json({ message: 'Campaign budget exhausted' }, { status: 400 });
    }

    const viewerWallet = await prisma.wallet.findUnique({ where: { userId: viewerId } });
    if (!viewerWallet) {
      return NextResponse.json({ message: 'Wallet not found. Please contact support.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          campaignId,
          viewerId,
          status: 'COMPLETED',
          rewardAmount: campaign.rewardPerTask,
        },
      });

      await tx.wallet.update({
        where: { userId: viewerId },
        data: { coinBalance: { increment: campaign.rewardPerTask } },
      });

      await tx.transaction.create({
        data: {
          walletId: viewerWallet.id,
          amount: campaign.rewardPerTask,
          type: 'TASK_REWARD',
          referenceId: task.id,
          description: `Earned ${campaign.rewardPerTask} coins for completing "${campaign.name}"`,
        },
      });

      await tx.notification.create({
        data: {
          userId: viewerId,
          title: 'Coins Earned! 🎉',
          message: `You earned ${campaign.rewardPerTask} coins for completing "${campaign.name}"`,
          type: 'REWARD',
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const userStat = await tx.userStat.findUnique({ where: { userId: viewerId } });
      let newStreak = userStat?.currentStreak || 0;
      
      if (userStat?.lastTaskDate) {
        const lastTaskDate = new Date(userStat.lastTaskDate);
        lastTaskDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(Math.abs(today.getTime() - lastTaskDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }
      
      const newTotalTasks = (userStat?.totalTasks || 0) + 1;
      let newLevel = 1;
      if (newTotalTasks >= 100) newLevel = 5;
      else if (newTotalTasks >= 50) newLevel = 4;
      else if (newTotalTasks >= 10) newLevel = 3;
      else if (newTotalTasks >= 5) newLevel = 2;

      await tx.userStat.upsert({
        where: { userId: viewerId },
        update: {
          totalTasks: { increment: 1 },
          lastTaskDate: new Date(),
          currentStreak: newStreak,
          longestStreak: Math.max(userStat?.longestStreak || 0, newStreak),
          level: newLevel,
        },
        create: {
          userId: viewerId,
          totalTasks: 1,
          lastTaskDate: new Date(),
          currentStreak: 1,
          longestStreak: 1,
          level: 1,
        }
      });

      return task;
    });

    return NextResponse.json({
      message: `You earned ${campaign.rewardPerTask} coins!`,
      task: result,
      coinsEarned: campaign.rewardPerTask,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
