import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { getTwoFactorStatus, getBackupCodes } from '@/lib/services/database';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 401 });
    }

    const status = await getTwoFactorStatus(user.id);
    const backupCodes = await getBackupCodes(user.id);

    return NextResponse.json({
      enabled: status?.enabled ?? false,
      created_at: status?.created_at ?? null,
      hasBackupCodes: !!backupCodes && backupCodes.length > 0,
    });
  } catch (err) {
    console.error('[2fa/status] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to get 2FA status.' }, { status: 500 });
  }
}
