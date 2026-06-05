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

    const wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });
    }

    const totalEarned = await prisma.transaction.aggregate({
      where: { walletId: wallet.id, amount: { gt: 0 } },
      _sum: { amount: true },
    });

    const totalRedeemed = await prisma.transaction.aggregate({
      where: { walletId: wallet.id, type: 'WITHDRAWAL' },
      _sum: { amount: true },
    });

    return NextResponse.json({
      wallet,
      stats: {
        totalEarned: totalEarned._sum.amount || 0,
        totalRedeemed: Math.abs(totalRedeemed._sum.amount || 0),
        currentBalance: wallet.coinBalance,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
