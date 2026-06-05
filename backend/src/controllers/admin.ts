import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../lib/prisma';

// ─── Dashboard Stats ───
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalCreators, activeCampaigns, pendingCampaigns, totalPayouts] = await Promise.all([
      prisma.user.count({ where: { role: 'VIEWER' } }),
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaign.count({ where: { status: 'PENDING' } }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL' },
        _sum: { amount: true },
      }),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dailySignups = await prisma.user.count({
      where: { createdAt: { gte: todayStart } },
    });
    const dailyTasks = await prisma.task.count({
      where: { createdAt: { gte: todayStart } },
    });

    res.json({
      totalUsers,
      totalCreators,
      activeCampaigns,
      pendingCampaigns,
      totalPayouts: Math.abs(totalPayouts._sum.amount || 0),
      dailySignups,
      dailyTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── User Management ───
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, role } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        isVerified: true, createdAt: true,
        wallet: { select: { coinBalance: true } },
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified, role } = req.body;

    const data: any = {};
    if (typeof isVerified === 'boolean') data.isVerified = isVerified;
    if (role) data.role = role;

    const user = await prisma.user.update({ where: { id }, data });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Campaign Management ───
export const getAllCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCampaignStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, budget, rewardPerTask, adminStartDate, adminEndDate } = req.body;

    const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    let updatedCampaign;

    if (status === 'ACTIVE' && campaign.status === 'PENDING') {
      if (!budget || !rewardPerTask || !adminStartDate || !adminEndDate) {
         return res.status(400).json({ message: 'Budget, Reward Per Task, and Start/End dates are required to approve a campaign' });
      }

      const wallet = await prisma.wallet.findUnique({ where: { userId: campaign.creatorId } });
      if (!wallet || wallet.coinBalance < budget) {
         return res.status(400).json({ message: 'Creator does not have enough coins for this budget' });
      }

      updatedCampaign = await prisma.$transaction(async (tx) => {
        // Deduct budget
        await tx.wallet.update({
          where: { userId: campaign.creatorId },
          data: { coinBalance: { decrement: budget } },
        });

        // Record transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: -budget,
            type: 'CAMPAIGN_PAYMENT',
            description: `Budget allocation for campaign: ${campaign.name}`,
          },
        });

        return await tx.campaign.update({
          where: { id },
          data: { 
            status, 
            budget: parseFloat(budget), 
            rewardPerTask: parseFloat(rewardPerTask),
            adminStartDate: new Date(adminStartDate),
            adminEndDate: new Date(adminEndDate)
          },
        });
      });
    } else {
      updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: { status },
      });
    }

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: campaign.creatorId,
        title: status === 'ACTIVE' ? 'Campaign Approved ✅' : `Campaign ${status}`,
        message: `Your campaign "${campaign.name}" has been ${status.toLowerCase()}.`,
        type: 'CAMPAIGN_APPROVAL',
      },
    });

    res.json(updatedCampaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.campaign.delete({ where: { id } });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Wallet Management ───
export const adminAdjustWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { coinBalance: { increment: amount } },
      });
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'ADMIN_ADJUSTMENT',
          description: description || `Admin adjustment by ${req.user!.id}`,
        },
      });
    });

    res.json({ message: 'Wallet adjusted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Withdrawal Management ───
export const getAllWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateWithdrawalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['REVIEW', 'APPROVED', 'PAID', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const withdrawal = await prisma.withdrawal.update({
      where: { id },
      data: { status },
    });

    // If rejected, refund coins
    if (status === 'REJECTED') {
      const wallet = await prisma.wallet.findUnique({ where: { userId: withdrawal.userId } });
      if (wallet) {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { userId: withdrawal.userId },
            data: { coinBalance: { increment: withdrawal.amount } },
          });
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              amount: withdrawal.amount,
              type: 'ADMIN_ADJUSTMENT',
              referenceId: withdrawal.id,
              description: 'Withdrawal rejected — coins refunded',
            },
          });
        });
      }
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: status === 'PAID' ? 'Withdrawal Paid 💰' : `Withdrawal ${status}`,
        message: `Your withdrawal request of ${withdrawal.amount} coins has been ${status.toLowerCase()}.`,
        type: 'SYSTEM',
      },
    });

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
