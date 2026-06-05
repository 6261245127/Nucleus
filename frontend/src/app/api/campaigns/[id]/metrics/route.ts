import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = authenticate(req);
    if (!authUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id, creatorId: authUser.id },
      include: {
        tasks: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    const spent = campaign.tasks.reduce((sum, task) => sum + task.rewardAmount, 0);
    
    return NextResponse.json({
      campaign,
      metrics: {
        completedTasks: campaign.tasks.length,
        budgetSpent: spent,
        remainingBudget: campaign.budget - spent,
      }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
