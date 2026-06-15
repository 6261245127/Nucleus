import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const verification = searchParams.get('verification');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';

    // Build where clause
    const where: Prisma.UserWhereInput = {
      role: { not: 'ADMIN' }, // Don't typically manage admins here
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role && role !== 'ALL') where.role = role as Prisma.EnumRoleFilter;
    if (verification && verification !== 'ALL') where.isVerified = verification === 'VERIFIED';
    if (status && status !== 'ALL') where.accountStatus = status as Prisma.EnumUserAccountStatusFilter;

    // Build orderBy clause
    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'highest_coins') orderBy = { wallet: { coinBalance: 'desc' } };
    if (sort === 'most_active') orderBy = { lastLogin: { sort: 'desc', nulls: 'last' } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          accountStatus: true,
          createdAt: true,
          lastLogin: true,
          avatarUrl: true,
          wallet: {
            select: {
              coinBalance: true,
              fiatBalance: true,
              rewardBalance: true,
            }
          },
          _count: {
            select: {
              campaigns: true,
              tasksCompleted: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      data: users.map(u => ({
        ...u,
        totalEarnings: (u.wallet?.rewardBalance || 0) + (u.wallet?.fiatBalance || 0),
        campaignsParticipated: u._count.tasksCompleted,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
