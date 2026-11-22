#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { Client } from 'pg';

const root = resolve(import.meta.dirname, '..');
const migrationsDir = join(root, 'migrations');

for (const envFile of ['.env.local', '.env']) {
  const envPath = join(root, envFile);
  if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    'DATABASE_URL is not set. Copy .env.example to .env.local and configure PostgreSQL.'
  );
  process.exit(1);
}

if (!existsSync(migrationsDir)) {
  console.error(`Migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.error('No .sql migrations found.');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
let locked = false;

try {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query("SELECT pg_advisory_lock(hashtext('leguard_schema_migrations'))");
  locked = true;

  let applied = 0;
  for (const file of files) {
    const version = basename(file);
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');

    const existing = await client.query(
      'SELECT checksum FROM public.schema_migrations WHERE version = $1',
      [version]
    );

    if (existing.rowCount && existing.rows[0].checksum !== checksum) {
      throw new Error(
        `Migration ${version} has changed since it was applied. ` +
          'Create a new migration instead of editing an applied one.'
      );
    }

    if (existing.rowCount) {
      console.log(`skip   ${version}`);
      continue;
    }

    console.log(`apply  ${version}`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO public.schema_migrations (version, checksum) VALUES ($1, $2)',
        [version, checksum]
      );
      await client.query('COMMIT');
      applied += 1;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  console.log(
    applied === 0
      ? 'No pending migrations. Database is current.'
      : `Applied ${applied} migration(s). Database is current.`
  );
} catch (error) {
  if (error instanceof Error) {
    console.error(`Migration failed: ${error.message || error.name}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error('Migration failed:', error);
  }
  process.exitCode = 1;
} finally {
  if (locked) {
    await client.query("SELECT pg_advisory_unlock(hashtext('leguard_schema_migrations'))");
  }
  await client.end();
}
