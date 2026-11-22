#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';

const root = resolve(import.meta.dirname, '..');

for (const envFile of ['.env.local', '.env']) {
  const envPath = join(root, envFile);
  if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
    break;
  }
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const email = (readArg('--email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const fullName = (readArg('--name') || process.env.ADMIN_NAME || 'LeGuard Admin').trim();
const password = readArg('--password') || process.env.ADMIN_PASSWORD || '';
const resetPassword = process.argv.includes('--reset-password');

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Provide a valid admin email with --email or ADMIN_EMAIL.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Configure .env.local first.');
  process.exit(1);
}

if (password && password.length < 12) {
  console.error('Admin passwords must be at least 12 characters.');
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();

  const existing = await client.query(
    'SELECT id, email, role FROM public.users WHERE email = $1',
    [email]
  );

  let userId;
  if (existing.rowCount) {
    userId = existing.rows[0].id;

    if (resetPassword) {
      if (!password) {
        throw new Error('--reset-password requires --password or ADMIN_PASSWORD.');
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await client.query(
        `UPDATE public.users
         SET role = 'admin', full_name = $1, password_hash = $2, updated_at = NOW()
         WHERE id = $3`,
        [fullName, passwordHash, userId]
      );
      console.log(`Updated admin ${email} and reset the password.`);
    } else {
      await client.query(
        `UPDATE public.users
         SET role = 'admin', full_name = $1, updated_at = NOW()
         WHERE id = $2`,
        [fullName, userId]
      );
      console.log(`Promoted existing user ${email} to admin.`);
    }
  } else {
    if (!password) {
      throw new Error('A password is required when creating a new admin. Set ADMIN_PASSWORD or use --password.');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const inserted = await client.query(
      `INSERT INTO public.users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id`,
      [email, passwordHash, fullName]
    );
    userId = inserted.rows[0].id;
    console.log(`Created admin ${email}.`);
  }

  await client.query(
    `INSERT INTO public.subscriptions
       (user_id, plan, status, current_period_start, current_period_end)
     SELECT $1, 'free', 'active', NOW(), NOW() + INTERVAL '100 years'
     WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = $1)`,
    [userId]
  );

  console.log(`Admin user id: ${userId}`);
} catch (error) {
  console.error(`Failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
