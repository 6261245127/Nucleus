import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { status } = await req.json();
    const { id } = params;

    const validStatuses = ['REVIEW', 'APPROVED', 'PAID', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.update({
      where: { id },
      data: { status },
    });

    if (status === 'REJECTED') {
      const wallet = await prisma.wallet.findUnique({ where: { userId: withdrawal.userId } });
      if (wallet) {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { userId: withdrawal.userId },
            data: { coinBalance: { increment: withdrawal.amount } },
          });
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              amount: withdrawal.amount,
              type: 'ADMIN_ADJUSTMENT',
              description: 'Withdrawal rejected — coins refunded',
            },
          });
        });
      }
    }

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error('Update withdrawal error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
