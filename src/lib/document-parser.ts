import { PDFParse } from 'pdf-parse';
import { extractRawText } from 'mammoth';

export interface ParsedDocument {
  text: string;
  pages: number;
  fileName: string;
  fileType: string;
}

export async function parseDocument(
  buffer: Buffer,
  fileName: string
): Promise<ParsedDocument> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf': {
      const parser = new PDFParse({ data: buffer });
      try {
        const data = await parser.getText();
        return {
          text: data.text,
          pages: data.total || 1,
          fileName,
          fileType: 'pdf',
        };
      } finally {
        await parser.destroy();
      }
    }
    case 'docx': {
      const result = await extractRawText({ buffer });
      return {
        text: result.value,
        pages: Math.max(1, Math.ceil(result.value.length / 3000)),
        fileName,
        fileType: 'docx',
      };
    }
    case 'txt': {
      const text = buffer.toString('utf-8');
      return {
        text,
        pages: 1,
        fileName,
        fileType: 'txt',
      };
    }
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}
