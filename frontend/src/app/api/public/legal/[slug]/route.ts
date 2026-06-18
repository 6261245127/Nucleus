import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const page = await prisma.cMSLegalPage.findUnique({
      where: { slug }
    });

    if (!page || !page.isPublished) {
      return NextResponse.json({ message: 'Legal page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
