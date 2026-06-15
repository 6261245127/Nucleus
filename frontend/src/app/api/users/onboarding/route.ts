import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const onboardingSchema = z.object({
  niches: z.array(z.string()).min(1),
  preferences: z.record(z.any()).optional()
});

export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { niches, preferences } = onboardingSchema.parse(body);

    const updateData: any = {
      niches,
      onboardingCompleted: true
    };

    if (preferences !== undefined) {
      updateData.preferences = preferences;
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingCompleted: true,
        niches: true,
      }
    });

    return NextResponse.json({ message: 'Onboarding completed', user: updatedUser });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input data', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
