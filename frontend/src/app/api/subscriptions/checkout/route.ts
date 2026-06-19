import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'CREATOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ message: 'Plan ID required' }, { status: 400 });

    const plan = await prisma.cMSCreatorPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ message: 'Invalid or inactive plan' }, { status: 400 });
    }

    // Initialize Razorpay
    const key_id = process.env.RAZORPAY_KEY_ID || 'dummy_key_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    let orderId = `order_dummy_${Date.now()}`;
    const amountInPaise = Math.round(plan.price * 100);

    if (key_id !== 'dummy_key_id') {
      const razorpay = new Razorpay({ key_id, key_secret });
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_sub_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Create or update subscription record in PENDING state
    await prisma.creatorSubscription.upsert({
      where: { userId: authUser.id },
      update: {
        planId: plan.id,
        status: 'PENDING_PAYMENT',
        razorpayOrderId: orderId
      },
      create: {
        userId: authUser.id,
        planId: plan.id,
        status: 'PENDING_PAYMENT',
        razorpayOrderId: orderId
      }
    });

    return NextResponse.json({ 
      orderId, 
      amount: amountInPaise, 
      currency: 'INR'
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: 'Failed to initiate checkout', error: error.message }, { status: 500 });
  }
}
