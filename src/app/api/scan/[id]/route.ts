import { NextRequest, NextResponse } from 'next/server';
import { getScan, deleteScan } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = getScan(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Scan result not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteScan(id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Scan result not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
