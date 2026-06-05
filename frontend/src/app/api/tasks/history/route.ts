import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'VIEWER') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { viewerId: authUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: { name: true, platform: true, rewardPerTask: true },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
