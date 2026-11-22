import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne } from '@/lib/db-pool';
import { getUserDocuments, logActivity } from '@/lib/services/database';
import { uploadDocument } from '@/lib/services/storage';
import { validateFile } from '@/lib/validators';
import { scanDocumentSchema } from '@/lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') || undefined;

    const result = await getUserDocuments(user.id, { page, limit, status });

    return NextResponse.json({
      data: result.data,
      total: result.total,
      page,
      total_pages: Math.ceil(result.total / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch documents.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: true, message: 'No file provided.' }, { status: 400 });
    }

    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: true, message: fileValidation.error }, { status: 400 });
    }

    const metadata = scanDocumentSchema.safeParse({
      jurisdiction: formData.get('jurisdiction') as string,
      document_type: formData.get('document_type') as string,
      focus_areas: formData.get('focus_areas') as string,
    });

    if (!metadata.success) {
      return NextResponse.json({ error: true, message: 'Invalid form data.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = await uploadDocument(buffer, user.id, file.name);

    const document = await queryOne<{ id: string }>(
      `INSERT INTO public.documents (user_id, original_name, file_type, file_size, storage_path, mime_type, status, page_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [user.id, file.name, metadata.data.document_type, file.size, storagePath, file.type || null, 'pending', 0]
    );

    if (!document) throw new Error('Failed to create document.');

    await logActivity(user.id, 'document_upload', 'documents', document.id, {
      file_name: file.name,
      file_size: file.size,
      document_type: metadata.data.document_type,
    });

    return NextResponse.json({ id: document.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
