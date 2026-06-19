import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'CREATOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.creatorSubscription.findUnique({
      where: { userId: authUser.id },
      include: { plan: true }
    });

    if (!subscription) {
      return NextResponse.json(null, { status: 404 });
    }

    // Check expiry
    if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
      // Expired, but we'll still return it so the UI can show expired status
      return NextResponse.json({ ...subscription, status: 'EXPIRED' });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
