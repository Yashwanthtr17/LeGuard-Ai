import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { recordActivity } from '@/lib/services/activity';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
      await recordActivity(user.id, 'logout', 'User logged out', ip);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
