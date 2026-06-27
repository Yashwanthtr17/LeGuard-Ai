import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/document-parser';
import { analyzeDocument } from '@/lib/ai';
import { saveScan, listScans, ScanResult } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Google API key not configured. Create a .env.local file with GOOGLE_API_KEY=your_key_here',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const jurisdiction = (formData.get('jurisdiction') as string) || 'auto';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type) &&
        !file.name.endsWith('.pdf') &&
        !file.name.endsWith('.docx') &&
        !file.name.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parsed = await parseDocument(buffer, file.name);

    if (!parsed.text || parsed.text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from the document. The file may be empty, scanned (image-based), or corrupted.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeDocument(
      parsed.text,
      jurisdiction,
      apiKey
    );

    const id = crypto.randomUUID();

    const result: ScanResult = {
      ...analysis,
      id,
      fileName: parsed.fileName,
      fileType: parsed.fileType,
      documentText: parsed.text,
    };

    saveScan(id, result);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Scan error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const scans = listScans();
    const summaries = scans.map((s) => ({
      id: s.id,
      fileName: s.fileName,
      fileType: s.fileType,
      jurisdiction: s.jurisdiction,
      detectedCountry: s.detectedCountry,
      riskScore: s.riskScore,
      riskLevel: s.riskLevel,
      createdAt: s.createdAt,
    }));
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('List scans error:', error);
    return NextResponse.json(
      { error: 'Failed to list scans' },
      { status: 500 }
    );
  }
}
