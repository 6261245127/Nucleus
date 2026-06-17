import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const userId = authUser.id;

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          coinBalance: 0,
          fiatBalance: 0,
          rewardBalance: 0,
        },
        include: {
          transactions: true
        }
      });
    }

    // Calculate dynamic stats
    const totalEarnedAggregate = await prisma.transaction.aggregate({
      where: { walletId: wallet.id, amount: { gt: 0 } },
      _sum: { amount: true }
    });

    const totalRedeemedAggregate = await prisma.transaction.aggregate({
      where: { walletId: wallet.id, type: 'WITHDRAWAL' },
      _sum: { amount: true }
    });

    // The current true balance mathematically
    const totalSum = await prisma.transaction.aggregate({
      where: { walletId: wallet.id },
      _sum: { amount: true }
    });

    // Ensure the wallet's coinBalance matches the true mathematical sum for data integrity
    const trueBalance = totalSum._sum.amount || 0;
    
    if (wallet.coinBalance !== trueBalance && authUser.role === 'VIEWER') {
      // Auto-correct any drift
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { coinBalance: trueBalance }
      });
      wallet.coinBalance = trueBalance;
    }

    return NextResponse.json({
      balance: wallet.coinBalance,
      fiatBalance: wallet.fiatBalance,
      stats: {
        totalEarned: totalEarnedAggregate._sum.amount || 0,
        totalRedeemed: Math.abs(totalRedeemedAggregate._sum.amount || 0),
      },
      transactions: wallet.transactions
    });

  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
