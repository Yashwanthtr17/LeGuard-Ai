import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const UPLOADS_DIR = join(process.cwd(), '.uploads');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length < 2) {
    return NextResponse.json({ error: true, message: 'Invalid path' }, { status: 400 });
  }

  const fullPath = join(UPLOADS_DIR, ...path);

  if (!fullPath.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: true, message: 'Invalid path' }, { status: 400 });
  }

  if (!existsSync(fullPath)) {
    return NextResponse.json({ error: true, message: 'File not found' }, { status: 404 });
  }

  try {
    const buffer = await readFile(fullPath);
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase();
    const contentType = ext === 'pdf' ? 'application/pdf'
      : ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : ext === 'txt' ? 'text/plain'
      : 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
      },
    });
  } catch {
    return NextResponse.json({ error: true, message: 'File not found' }, { status: 404 });
  }
}
