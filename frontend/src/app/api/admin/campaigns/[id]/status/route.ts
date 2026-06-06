import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'REJECTED']),
  budget: z.number().optional(),
  rewardPerTask: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
      if (!data.budget || !data.rewardPerTask || !data.startDate || !data.endDate) {
        return NextResponse.json({ message: 'Budget, reward, start date, and end date are required to activate' }, { status: 400 });
      }
      updateData.budget = data.budget;
      updateData.rewardPerTask = data.rewardPerTask;
      updateData.startDate = new Date(data.startDate);
      updateData.endDate = new Date(data.endDate);
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
