import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'CREATOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    // Verify signature
    if (key_secret !== 'dummy_key_secret') {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // Find pending subscription
    const sub = await prisma.creatorSubscription.findFirst({
      where: { userId: authUser.id, razorpayOrderId: razorpay_order_id, status: 'PENDING_PAYMENT' }
    });

    if (!sub) {
      return NextResponse.json({ message: 'Subscription order not found or already processed' }, { status: 404 });
    }

    // Update to active, reset campaigns used, set expiry 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.creatorSubscription.update({
      where: { id: sub.id },
      data: {
        status: 'ACTIVE',
        razorpayPaymentId: razorpay_payment_id,
        campaignsUsed: 0,
        expiresAt
      }
    });

    return NextResponse.json({ message: 'Subscription activated successfully' });

  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ message: 'Failed to verify payment', error: error.message }, { status: 500 });
  }
}
