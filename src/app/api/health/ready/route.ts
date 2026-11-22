import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbCheck = await queryOne<{ ok: number }>('SELECT 1 AS ok');

    if (!dbCheck || dbCheck.ok !== 1) {
      return NextResponse.json(
        { status: 'degraded', db: 'down', migrations: 'unknown' },
        { status: 503 }
      );
    }

    let migrationCount: number;
    try {
      const migrationRow = await queryOne<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM public.schema_migrations'
      );
      migrationCount = Number(migrationRow?.count ?? 0);
    } catch {
      return NextResponse.json(
        { status: 'degraded', db: 'up', migrations: 'missing' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      db: 'up',
      migrations: migrationCount > 0 ? 'current' : 'pending',
      migration_count: migrationCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[health/ready] Database check failed:', error);
    return NextResponse.json(
      { status: 'unavailable', db: 'down', migrations: 'unknown' },
      { status: 503 }
    );
  }
}
