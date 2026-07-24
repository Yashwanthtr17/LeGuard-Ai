import { v4 as uuidv4 } from 'uuid';
import { writeFile, unlink, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const UPLOADS_DIR = join(process.cwd(), '.uploads');
const DOCUMENTS_DIR = join(UPLOADS_DIR, 'documents');
const REPORTS_DIR = join(UPLOADS_DIR, 'reports');

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

function getDocumentPath(relativePath: string): string {
  return join(DOCUMENTS_DIR, relativePath);
}

function getReportPath(relativePath: string): string {
  return join(REPORTS_DIR, relativePath);
}

export async function uploadDocument(
  file: File | Buffer,
  userId: string,
  fileName?: string
): Promise<string> {
  await ensureDir(DOCUMENTS_DIR);

  const ext = fileName?.split('.').pop() || 'pdf';
  const relativePath = `${userId}/${uuidv4()}.${ext}`;
  const fullPath = getDocumentPath(relativePath);

  await ensureDir(join(DOCUMENTS_DIR, userId));

  const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return relativePath;
}

export async function deleteDocument(path: string): Promise<void> {
  const fullPath = getDocumentPath(path);
  try {
    await unlink(fullPath);
  } catch {
    // file may not exist
  }
}

export function getDocumentUrl(path: string): string {
  return `/api/files/documents/${path}`;
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
  await ensureDir(REPORTS_DIR);
  await ensureDir(join(REPORTS_DIR, userId));

  const relativePath = `${userId}/${reportId}.pdf`;
  const fullPath = getReportPath(relativePath);

  await writeFile(fullPath, buffer);
  return relativePath;
}

export async function getReportPdfUrl(path: string): Promise<string> {
  return `/api/files/reports/${path}`;
}

export async function getReportPdfBuffer(path: string): Promise<Buffer> {
  const fullPath = getReportPath(path);
  return readFile(fullPath);
}

export async function shareReportPdf(
  path: string,
  _expiresInHours: number = 24
): Promise<string> {
  return `/api/files/reports/${path}`;
}
