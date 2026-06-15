import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role } = body; 
    
    if (!['CREATOR', 'VIEWER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const email = `demo@${role.toLowerCase()}.com`;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: `Demo ${role}`,
          role: role as 'CREATOR' | 'VIEWER' | 'ADMIN',
          isVerified: true,
          wallet: {
            create: {
              coinBalance: 0,
              fiatBalance: 0,
              rewardBalance: 0,
            }
          }
        },
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d',
    });

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted, niches: user.niches } });
  } catch (error) {
    console.error('Bypass login error:', error);
    return NextResponse.json({ message: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
