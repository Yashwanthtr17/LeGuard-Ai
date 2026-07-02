import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const DOCUMENTS_BUCKET = 'documents';
const REPORTS_BUCKET = 'reports';

function getClient(bucket: string = DOCUMENTS_BUCKET) {
  return getSupabaseAdmin().storage.from(bucket);
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

// ─── Reports Storage ──────────────────────────────────────────────────────────

export async function uploadReportPdf(
  buffer: Buffer,
  userId: string,
  reportId: string
): Promise<string> {
  const path = `${userId}/${reportId}.pdf`;

  const { data, error } = await getClient(REPORTS_BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) throw new Error(`Report PDF upload failed: ${error.message}`);
  return data.path;
}

export async function getReportPdfUrl(path: string): Promise<string> {
  const { data } = await getClient(REPORTS_BUCKET).createSignedUrl(path, 3600); // 1 hour expiry
  if (!data?.signedUrl) throw new Error('Failed to generate signed URL');
  return data.signedUrl;
}

export async function getReportPdfBuffer(path: string): Promise<Buffer> {
  const { data, error } = await getClient(REPORTS_BUCKET).download(path);
  if (error || !data) throw new Error('Failed to download report PDF');
  return Buffer.from(await data.arrayBuffer());
}

export async function shareReportPdf(
  path: string,
  expiresInHours: number = 24
): Promise<string> {
  const { data } = await getClient(REPORTS_BUCKET).createSignedUrl(path, expiresInHours * 3600);
  if (!data?.signedUrl) throw new Error('Failed to generate share URL');
  return data.signedUrl;
}
