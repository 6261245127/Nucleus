import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        campaigns: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        tasksCompleted: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { campaign: { select: { name: true } } }
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        auditLogsTargeted: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Fetch user detail error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, payload } = body; 
    // actions: 'VERIFY', 'SUSPEND', 'UNSUSPEND', 'BAN', 'UNBAN', 'ADJUST_COINS'

    const targetUser = await prisma.user.findUnique({ where: { id }, include: { wallet: true } });
    if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    let updateData: any = {};
    let auditDetails: any = null;

    switch (action) {
      case 'VERIFY':
        updateData.isVerified = true;
        break;
      case 'SUSPEND':
        updateData.accountStatus = 'SUSPENDED';
        break;
      case 'UNSUSPEND':
      case 'UNBAN':
        updateData.accountStatus = 'ACTIVE';
        break;
      case 'BAN':
        updateData.accountStatus = 'BANNED';
        break;
      case 'ADJUST_COINS':
        if (typeof payload?.amount !== 'number') return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        if (!targetUser.wallet) return NextResponse.json({ message: 'User has no wallet' }, { status: 400 });
        await prisma.wallet.update({
          where: { userId: targetUser.id },
          data: { coinBalance: { increment: payload.amount } }
        });
        await prisma.transaction.create({
          data: {
            walletId: targetUser.wallet.id,
            amount: payload.amount,
            type: 'ADMIN_ADJUSTMENT',
            description: payload.reason || 'Admin adjustment'
          }
        });
        auditDetails = { amount: payload.amount, reason: payload.reason };
        break;
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id }, data: updateData });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: authUser.userId,
        targetUserId: targetUser.id,
        action,
        resource: 'USER',
        details: auditDetails || {},
      }
    });

    return NextResponse.json({ message: 'Action completed successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
