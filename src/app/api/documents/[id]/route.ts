import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';
import { getDocument, logActivity } from '@/lib/services/database';
import { deleteDocument as deleteStorageDocument } from '@/lib/services/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const document = await getDocument(id);

    if (!document) {
      return NextResponse.json({ error: true, message: 'Document not found.' }, { status: 404 });
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 403 });
    }

    return NextResponse.json({ data: document });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch document.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const document = await getDocument(id);

    if (!document) {
      return NextResponse.json({ error: true, message: 'Document not found.' }, { status: 404 });
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 403 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('documents')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    if (document.storage_path) {
      await deleteStorageDocument(document.storage_path).catch(() => {});
    }

    await logActivity(user.id, 'document_delete', 'documents', id, {
      file_name: document.original_name,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete document.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
