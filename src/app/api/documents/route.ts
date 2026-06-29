import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';
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

    const admin = getSupabaseAdmin();
    const { data: document, error } = await admin
      .from('documents')
      .insert({
        user_id: user.id,
        original_name: file.name,
        file_type: metadata.data.document_type,
        file_size: file.size,
        storage_path: storagePath,
        mime_type: file.type || null,
        status: 'uploaded',
        page_count: 0,
      })
      .select('id')
      .single();

    if (error) throw error;

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
