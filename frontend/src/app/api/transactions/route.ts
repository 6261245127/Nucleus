import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
