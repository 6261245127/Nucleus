import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { userIds, action, payload } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: 'No users selected' }, { status: 400 });
    }

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
        // Handling bulk coins is slightly more complex as it requires individual updates
        if (typeof payload?.amount !== 'number') return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        auditDetails = { amount: payload.amount, reason: payload.reason };
        break;
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    // Execute in a transaction
    await prisma.$transaction(async (tx) => {
      if (action === 'ADJUST_COINS') {
        const wallets = await tx.wallet.findMany({ where: { userId: { in: userIds } } });
        for (const wallet of wallets) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { coinBalance: { increment: payload.amount } }
          });
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              amount: payload.amount,
              type: 'ADMIN_ADJUSTMENT',
              description: payload.reason || 'Bulk admin adjustment'
            }
          });
        }
      } else {
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: updateData
        });
      }

      // Create audit logs for all
      const auditLogs = userIds.map(id => ({
        userId: authUser.userId,
        targetUserId: id,
        action: `BULK_${action}`,
        resource: 'USER',
        details: auditDetails || {},
      }));

      await tx.auditLog.createMany({ data: auditLogs });
    });

    return NextResponse.json({ message: 'Bulk action completed successfully' });
  } catch (error) {
    console.error('Bulk user action error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
