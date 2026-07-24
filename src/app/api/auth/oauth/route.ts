import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: true, message: 'OAuth is not supported.' },
    { status: 501 }
  );
}
