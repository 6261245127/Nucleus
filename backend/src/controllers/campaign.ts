import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(3),
  platform: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  dailyLimit: z.number().optional(),
  durationDays: z.number().min(1),
  niche: z.string(),
});

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const creatorId = req.user!.id;
    const data = createCampaignSchema.parse(req.body);

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        budget: 0,
        rewardPerTask: 0,
        creatorId,
        status: 'PENDING', // Admin needs to approve
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getMyCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { creatorId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCampaignMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id, creatorId: req.user!.id },
      include: {
        tasks: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const spent = campaign.tasks.reduce((sum, task) => sum + task.rewardAmount, 0);
    
    res.json({
      campaign,
      metrics: {
        completedTasks: campaign.tasks.length,
        budgetSpent: spent,
        remainingBudget: campaign.budget - spent,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const pauseCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({ where: { id, creatorId: req.user!.id } });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'COMPLETED' || campaign.status === 'REJECTED') {
      return res.status(400).json({ message: 'Cannot pause a completed or rejected campaign' });
    }

    const newStatus = campaign.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
