import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, role } = body;
    
    // Fetch user info using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!googleRes.ok) {
      return NextResponse.json({ message: 'Invalid Google token' }, { status: 400 });
    }
    
    const payload = await googleRes.json();

    if (!payload || !payload.email) {
      return NextResponse.json({ message: 'Invalid Google user info' }, { status: 400 });
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'User',
          googleId,
          avatarUrl: picture,
          role: role === 'CREATOR' ? 'CREATOR' : 'VIEWER',
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

    return NextResponse.json({ 
        token, 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            niches: user.niches
        } 
    });
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({ message: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
