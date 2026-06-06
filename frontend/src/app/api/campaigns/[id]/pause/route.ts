import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = authenticate(req);
    if (!authUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({ where: { id, creatorId: authUser.id } });
    
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'COMPLETED' || campaign.status === 'REJECTED') {
      return NextResponse.json({ message: 'Cannot pause a completed or rejected campaign' }, { status: 400 });
    }

    const newStatus = campaign.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: newStatus }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
