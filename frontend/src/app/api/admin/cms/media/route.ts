import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

// GET: Fetch all media registry items
export async function GET(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const media = await prisma.cMSMedia.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error('Error listing media:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST: Upload a file
export async function POST(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'OTHER';

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${timestamp}_${sanitizedName}`;
    const filePath = join(uploadDir, uniqueName);

    // Save to disk
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    // Register in database
    const media = await prisma.cMSMedia.create({
      data: {
        name: file.name,
        url: fileUrl,
        mimeType: file.type,
        size: file.size,
        category: category
      }
    });

    // Write to Audit Log
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'UPLOAD_MEDIA',
        resource: `CMSMedia:${media.id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          fileName: file.name,
          fileUrl: fileUrl,
          fileSize: file.size,
          category
        }
      }
    });

    return NextResponse.json({ message: 'Upload successful', media });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a file
export async function DELETE(req: NextRequest) {
  try {
    const authUser = authenticate(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Media ID required' }, { status: 400 });
    }

    const media = await prisma.cMSMedia.findUnique({
      where: { id }
    });

    if (!media) {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }

    // Attempt to delete file from disk
    const relativePath = media.url.replace(/^\//, ''); // remove leading slash
    const filePath = join(process.cwd(), 'public', relativePath);
    
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (fsErr) {
      console.warn('Error deleting physical file, proceeding with database delete:', fsErr);
    }

    // Delete from database
    await prisma.cMSMedia.delete({
      where: { id }
    });

    // Write to Audit Log
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'DELETE_MEDIA',
        resource: `CMSMedia:${id}`,
        details: {
          adminEmail: user?.email,
          adminName: user?.name,
          fileName: media.name,
          fileUrl: media.url
        }
      }
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
