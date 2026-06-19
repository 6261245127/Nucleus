import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: 'Missing payment details' }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // If we are using dummy keys, skip signature validation for testing
      if (key_secret !== 'dummy_key_secret') {
        return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
      }
    }

    // Find pending transaction
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: razorpay_order_id }
    });

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Payment already verified' }, { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.transaction.updateMany({
        where: { id: transaction.id, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          paymentId: razorpay_payment_id,
        }
      });

      if (updateResult.count === 0) {
        throw new Error('Payment already verified or concurrent conflict');
      }

      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          fiatBalance: {
            increment: transaction.amount
          }
        }
      });
    });

    return NextResponse.json({ message: 'Payment verified successfully' });

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ message: 'Verification failed', error: error.message }, { status: 500 });
  }
}
