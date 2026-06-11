import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    // Generate unique name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = filename.split('.').pop() || '';
    const uniqueFilename = `${timestamp}-${randomStr}.${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Vercel Blob (Private Upload)
      const blob = await put(uniqueFilename, request.body, {
        access: 'private',
      });
      return NextResponse.json(blob);
    } else {
      // Local fallback (saving in public/uploads)
      await ensureUploadDir();
      const filepath = join(UPLOAD_DIR, uniqueFilename);
      
      const arrayBuffer = await request.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filepath, buffer);

      // Return a shape similar to PutBlobResult
      return NextResponse.json({
        url: `/uploads/${uniqueFilename}`,
        pathname: uniqueFilename, // store pathname for retrieval
        contentType: request.headers.get('content-type') || 'image/png',
        contentDisposition: `inline; filename="${uniqueFilename}"`,
      });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
