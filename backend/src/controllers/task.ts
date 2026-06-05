import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../lib/prisma';

// Get all active campaigns as browseable tasks for viewers
export const getAvailableTasks = async (req: AuthRequest, res: Response) => {
  try {
    const viewerId = req.user!.id;

    // Get campaigns that are ACTIVE and haven't been completed by this viewer
    const completedCampaignIds = await prisma.task.findMany({
      where: { viewerId },
      select: { campaignId: true },
    });

    const completedIds = completedCampaignIds.map((t) => t.campaignId);

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: completedIds },
        endDate: { gte: new Date() },
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

    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Viewer completes a task and earns coins
export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const viewerId = req.user!.id;
    const { campaignId } = req.params;

    // 1. Check campaign exists and is active
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Campaign is not available' });
    }

    // 2. Anti-duplicate: check viewer hasn't already done this task
    const existing = await prisma.task.findFirst({
      where: { campaignId, viewerId },
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already completed this task' });
    }

    // 3. Check daily limit for this campaign
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
        return res.status(400).json({ message: 'Daily limit reached for this campaign' });
      }
    }

    // 4. Check remaining budget
    const totalSpent = await prisma.task.aggregate({
      where: { campaignId, status: { in: ['COMPLETED', 'VERIFIED'] } },
      _sum: { rewardAmount: true },
    });
    const spent = totalSpent._sum.rewardAmount || 0;
    if (spent + campaign.rewardPerTask > campaign.budget) {
      // Auto-complete campaign if budget exhausted
      await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'COMPLETED' } });
      return res.status(400).json({ message: 'Campaign budget exhausted' });
    }

    // 5. Execute: Create task + credit viewer wallet in a single transaction
    const viewerWallet = await prisma.wallet.findUnique({ where: { userId: viewerId } });
    if (!viewerWallet) {
      return res.status(400).json({ message: 'Wallet not found. Please contact support.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the completed task record
      const task = await tx.task.create({
        data: {
          campaignId,
          viewerId,
          status: 'COMPLETED',
          rewardAmount: campaign.rewardPerTask,
        },
      });

      // Credit coins to viewer wallet
      await tx.wallet.update({
        where: { userId: viewerId },
        data: { coinBalance: { increment: campaign.rewardPerTask } },
      });

      // Record the transaction in viewer's ledger
      await tx.transaction.create({
        data: {
          walletId: viewerWallet.id,
          amount: campaign.rewardPerTask,
          type: 'TASK_REWARD',
          referenceId: task.id,
          description: `Earned ${campaign.rewardPerTask} coins for completing "${campaign.name}"`,
        },
      });

      // Send notification to viewer
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

    res.status(201).json({
      message: `You earned ${campaign.rewardPerTask} coins!`,
      task: result,
      coinsEarned: campaign.rewardPerTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get viewer's completed task history
export const getMyTaskHistory = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { viewerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: { name: true, platform: true, rewardPerTask: true },
        },
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get viewer's wallet and transaction history
export const getMyWallet = async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Aggregate stats
    const totalEarned = await prisma.transaction.aggregate({
      where: { walletId: wallet.id, amount: { gt: 0 } },
      _sum: { amount: true },
    });

    const totalRedeemed = await prisma.transaction.aggregate({
      where: { walletId: wallet.id, type: 'WITHDRAWAL' },
      _sum: { amount: true },
    });

    res.json({
      wallet,
      stats: {
        totalEarned: totalEarned._sum.amount || 0,
        totalRedeemed: Math.abs(totalRedeemed._sum.amount || 0),
        currentBalance: wallet.coinBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
