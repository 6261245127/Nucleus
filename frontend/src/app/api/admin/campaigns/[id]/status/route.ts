import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'REJECTED', 'PAUSED']),
  budget: z.number().optional(),
  rewardPerTask: z.number().optional(),
  adminStartDate: z.string().optional(),
  adminEndDate: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = statusSchema.parse(body);

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    let updateData: any = { status: data.status };

    if (data.status === 'ACTIVE') {
      // If we are approving a new campaign, enforce these requirements.
      // But if we are just un-pausing an existing active campaign, maybe it already has these?
      // Since the admin uses "ACTIVE" to both approve AND resume, let's check if it lacks values.
      if (!data.budget && !campaign.budget) {
        return NextResponse.json({ message: 'Budget is required to activate' }, { status: 400 });
      }
      
      if (data.budget) updateData.budget = data.budget;
      if (data.rewardPerTask) updateData.rewardPerTask = data.rewardPerTask;
      if (data.adminStartDate) updateData.adminStartDate = new Date(data.adminStartDate);
      if (data.adminEndDate) updateData.adminEndDate = new Date(data.adminEndDate);
      
      // Verify all 4 exist either in update or already in db
      const finalBudget = updateData.budget ?? campaign.budget;
      const finalReward = updateData.rewardPerTask ?? campaign.rewardPerTask;
      const finalStart = updateData.adminStartDate ?? campaign.adminStartDate;
      const finalEnd = updateData.adminEndDate ?? campaign.adminEndDate;
      
      if (!finalBudget || !finalReward || !finalStart || !finalEnd) {
        return NextResponse.json({ message: 'Budget, reward, start date, and end date are required to activate' }, { status: 400 });
      }
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
