import { type NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function GET(request: NextRequest) {
  // ⚠️ Authenticate the request before serving the blob if necessary

  const pathname = request.nextUrl.searchParams.get('pathname');
  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });
  }

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Vercel Blob private fetch
      const result = await get(pathname, { access: 'private' });
      if (!result) {
        return new NextResponse('Not found', { status: 404 });
      }
      return new NextResponse(result.stream, {
        headers: {
          'Content-Type': result.blob.contentType || 'application/octet-stream',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } else {
      // Local file serve
      const filepath = join(UPLOAD_DIR, pathname);
      if (!existsSync(filepath)) {
        return new NextResponse('Not found', { status: 404 });
      }

      const fileBuffer = await readFile(filepath);
      // Determine content type simply
      const ext = pathname.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'gif') contentType = 'image/gif';
      else if (ext === 'svg') contentType = 'image/svg+xml';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching private avatar:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
}
