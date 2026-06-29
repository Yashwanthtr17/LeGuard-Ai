import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
      logActivity(user.id, 'logout', 'User logged out', ip);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
