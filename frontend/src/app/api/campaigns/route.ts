import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
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

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const data = createCampaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        budget: 0,
        rewardPerTask: 0,
        creatorId: authUser.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const campaigns = await prisma.campaign.findMany({
      where: { creatorId: authUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
