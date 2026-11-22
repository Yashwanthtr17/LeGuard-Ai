import { Pool, QueryResultRow } from 'pg';
import { getDatabaseUrl } from '@/lib/env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    // Idle clients emit errors when PostgreSQL restarts or the network drops.
    // Without a listener these become uncaught exceptions and kill the process.
    pool.on('error', (error) => {
      console.error('[db-pool] Idle client error:', error.message);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function queryOne<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export async function execute(
  text: string,
  params?: unknown[]
): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rowCount ?? 0;
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
