const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds 10MB limit.' };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }
  return { valid: true };
}

export function validateMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
}

export function truncateText(text: string, maxChars = 80000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[... DOCUMENT TRUNCATED FOR LENGTH ...]';
}
