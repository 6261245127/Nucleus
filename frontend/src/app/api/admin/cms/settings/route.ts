import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const settings = await prisma.cMSSetting.findUnique({
      where: { id: 'global-settings' }
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching settings', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { websiteName, logoUrl, faviconUrl, websiteUrl, supportEmail, contactNumber, socialLinks, copyrightText } = body;

    const previous = await prisma.cMSSetting.findUnique({
      where: { id: 'global-settings' }
    });

    const updated = await prisma.cMSSetting.upsert({
      where: { id: 'global-settings' },
      update: {
        websiteName,
        logoUrl,
        faviconUrl,
        websiteUrl,
        supportEmail,
        contactNumber,
        socialLinks,
        copyrightText
      },
      create: {
        id: 'global-settings',
        websiteName: websiteName || 'The Social Bite',
        logoUrl,
        faviconUrl,
        websiteUrl,
        supportEmail,
        contactNumber,
        socialLinks,
        copyrightText: copyrightText || '© 2026 The Social Bite Inc. All rights reserved.'
      }
    });

    // Write to Audit Log
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPDATE_SETTINGS',
        resource: 'CMSSetting:global-settings',
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          previous: previous || {},
          updated: updated
        }
      }
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings: updated });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ message: 'Error updating settings', error: error.message }, { status: 500 });
  }
}
