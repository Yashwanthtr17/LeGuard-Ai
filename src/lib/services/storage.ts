import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'documents';

function getClient() {
  return getSupabaseAdmin().storage.from(BUCKET_NAME);
}

export async function uploadDocument(
  file: File | Buffer,
  userId: string,
  fileName?: string
): Promise<string> {
  const ext = fileName?.split('.').pop() || 'pdf';
  const path = `${userId}/${uuidv4()}.${ext}`;

  const { data, error } = await getClient().upload(path, file, {
    contentType: fileName?.endsWith('.pdf') ? 'application/pdf' : undefined,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return data.path;
}

export async function deleteDocument(path: string): Promise<void> {
  const { error } = await getClient().remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

export function getDocumentUrl(path: string): string {
  const { data } = getClient().getPublicUrl(path);
  return data.publicUrl;
}

export function getPdfUrl(path: string): string {
  return getDocumentUrl(path);
}
