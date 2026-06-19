import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../lib/prisma';

// Get all active campaigns as browseable tasks for viewers
export const getAvailableTasks = async (req: AuthRequest, res: Response) => {
  try {
    const viewerId = req.user!.id;

    // Get campaigns that have been COMPLETED by this viewer
    const completedTasks = await prisma.task.findMany({
      where: { viewerId, status: 'COMPLETED' },
      select: { campaignId: true },
    });

    const completedIds = completedTasks.map((t) => t.campaignId);

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: completedIds },
        OR: [
          { adminEndDate: null },
          { adminEndDate: { gte: new Date() } }
        ]
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

// Start a task (mark as IN_PROGRESS)
export const startTask = async (req: AuthRequest, res: Response) => {
  try {
    const viewerId = req.user!.id;
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Campaign is not available' });
    }

    const existing = await prisma.task.findFirst({
      where: { campaignId, viewerId },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        return res.status(400).json({ message: 'You have already completed this task' });
      }
      return res.status(200).json({ message: 'Task already in progress', task: existing });
    }

    const task = await prisma.task.create({
      data: {
        campaignId,
        viewerId,
        status: 'IN_PROGRESS',
        rewardAmount: campaign.rewardPerTask,
      },
    });

    res.status(201).json({ message: 'Task started', task });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(200).json({ message: 'Task already in progress' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Viewer completes a task and earns coins
export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const viewerId = req.user!.id;
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Campaign is not available' });
    }

    // Anti-duplicate check
    const existing = await prisma.task.findFirst({
      where: { campaignId, viewerId },
    });

    if (existing?.status === 'COMPLETED') {
      return res.status(400).json({ message: 'You have already completed this task and earned the reward.' });
    }

    if (!existing || existing.status !== 'IN_PROGRESS') {
      // Allow completing even if not strictly IN_PROGRESS to handle edge cases, but we create/update
    }

    // Execute: Complete task + credit viewer + update gamification stats in a transaction
    const viewerWallet = await prisma.wallet.findUnique({ where: { userId: viewerId } });
    if (!viewerWallet) return res.status(400).json({ message: 'Wallet not found.' });

    const result = await prisma.$transaction(async (tx) => {
      // Upsert the task to COMPLETED
      const task = existing 
        ? await tx.task.update({
            where: { id: existing.id },
            data: { status: 'COMPLETED' }
          })
        : await tx.task.create({
            data: {
              campaignId,
              viewerId,
              status: 'COMPLETED',
              rewardAmount: campaign.rewardPerTask,
            },
          });

      // Credit wallet
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

      // Gamification Logic
      let userStat = await tx.userStat.findUnique({ where: { userId: viewerId } });
      if (!userStat) {
        userStat = await tx.userStat.create({ data: { userId: viewerId } });
      }

      const now = new Date();
      let newStreak = userStat.currentStreak;
      
      if (userStat.lastTaskDate) {
        const lastDate = new Date(userStat.lastTaskDate);
        const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
          // Same day, streak continues but doesn't increment unless it's a new calendar day
          // For simplicity, we just increment if it's the next calendar day.
          const isNextDay = now.getDate() !== lastDate.getDate();
          if (isNextDay) newStreak += 1;
        } else if (diffHours < 48) {
          newStreak += 1;
        } else {
          newStreak = 1; // Streak broken
        }
      } else {
        newStreak = 1;
      }

      const totalTasks = userStat.totalTasks + 1;
      // Milestones: Level 2 at 10, Level 3 at 50, Level 4 at 100
      let level = 1;
      if (totalTasks >= 100) level = 4;
      else if (totalTasks >= 50) level = 3;
      else if (totalTasks >= 10) level = 2;

      await tx.userStat.update({
        where: { userId: viewerId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, userStat.longestStreak),
          lastTaskDate: now,
          totalTasks: totalTasks,
          level: level,
        }
      });

      return { task, level, newStreak, totalTasks };
    });

    res.status(201).json({
      message: `You earned ${campaign.rewardPerTask} coins!`,
      task: result.task,
      gamification: { level: result.level, streak: result.newStreak, totalTasks: result.totalTasks },
      coinsEarned: campaign.rewardPerTask,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'You have already completed this task and earned the reward.' });
    }
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
