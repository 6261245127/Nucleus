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

    if (campaign.dailyLimit) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = await prisma.task.count({
        where: {
          campaignId,
          createdAt: { gte: todayStart },
        },
      });
      if (todayCount >= campaign.dailyLimit) {
        return NextResponse.json({ message: 'Daily limit reached for this campaign' }, { status: 400 });
      }
    }

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
