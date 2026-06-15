import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const followSchema = z.object({
  creatorId: z.string().uuid(),
  action: z.enum(['follow', 'unfollow'])
});

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { creatorId, action } = followSchema.parse(body);

    if (authUser.id === creatorId) {
      return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 });
    }

    if (action === 'follow') {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: authUser.id,
            followingId: creatorId
          }
        },
        create: {
          followerId: authUser.id,
          followingId: creatorId
        },
        update: {}
      });
    } else {
      await prisma.follow.deleteMany({
        where: {
          followerId: authUser.id,
          followingId: creatorId
        }
      });
    }

    return NextResponse.json({ message: `Successfully ${action}ed creator` });
  } catch (error) {
    console.error('Follow error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input data', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
