import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pages = await prisma.cMSLegalPage.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        effectiveDate: true,
        updatedAt: true
      },
      orderBy: { title: 'asc' }
    });

    return NextResponse.json({ pages });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
