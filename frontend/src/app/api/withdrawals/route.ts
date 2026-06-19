import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { amount, method, details } = await req.json();

    if (!amount || amount < 500) {
      return NextResponse.json({ message: 'Minimum withdrawal amount is ₹500' }, { status: 400 });
    }

    if (!method || !details) {
      return NextResponse.json({ message: 'Withdrawal method and details are required' }, { status: 400 });
    }

    // Check balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.id }
    });

    if (!wallet) {
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });
    }

    // The user might be withdrawing from fiatBalance or rewardBalance. 
    // Usually creators withdraw from rewardBalance (if they earn) or fiat if refunding.
    // For simplicity, let's assume they withdraw from rewardBalance (which Viewers earn) or fiatBalance.
    // Let's check combined balance or assume standard is rewardBalance.
    if (wallet.rewardBalance < amount && wallet.fiatBalance < amount) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct from appropriate balance (prioritize rewardBalance for viewers)
    const isReward = wallet.rewardBalance >= amount;

    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.wallet.updateMany({
        where: { 
          id: wallet.id,
          ...(isReward ? { rewardBalance: { gte: amount } } : { fiatBalance: { gte: amount } })
        },
        data: {
          ...(isReward ? { rewardBalance: { decrement: amount } } : { fiatBalance: { decrement: amount } })
        }
      });

      if (updateResult.count === 0) {
        throw new Error('Insufficient balance or concurrent transaction conflict');
      }

      await tx.withdrawal.create({
        data: {
          userId: authUser.id,
          amount,
          method,
          details,
          status: 'PENDING'
        }
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId: authUser.id,
          amount: amount,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          paymentMethod: method,
          description: `Withdrawal to ${method}`
        }
      });
    });

    return NextResponse.json({ message: 'Withdrawal request submitted successfully' });

  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ message: 'Failed to request withdrawal', error: error.message }, { status: 500 });
  }
}
