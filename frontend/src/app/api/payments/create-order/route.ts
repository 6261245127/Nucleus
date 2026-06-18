import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    // Initialize Razorpay
    const key_id = process.env.RAZORPAY_KEY_ID || 'dummy_key_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    // Fallback to fake order ID if no valid credentials (for testing UI)
    if (key_id === 'dummy_key_id') {
      const orderId = `order_dummy_${Date.now()}`;
      
      let wallet = await prisma.wallet.findUnique({
        where: { userId: authUser.id }
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId: authUser.id }
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          userId: authUser.id,
          amount: amount,
          type: 'DEPOSIT',
          status: 'PENDING',
          orderId: orderId,
          gateway: 'RAZORPAY',
          description: 'Wallet Deposit',
        }
      });

      return NextResponse.json({ 
        orderId, 
        amount: amount * 100, 
        currency: 'INR',
        transactionId: transaction.id
      });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: authUser.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: authUser.id }
      });
    }

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId: authUser.id,
        amount: amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        orderId: order.id,
        gateway: 'RAZORPAY',
        description: 'Wallet Deposit',
      }
    });

    return NextResponse.json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency,
      transactionId: transaction.id
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500 });
  }
}
