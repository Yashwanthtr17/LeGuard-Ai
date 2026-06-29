import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const DATA_DIR = join(process.cwd(), '.data');

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(join(DATA_DIR, 'leguard.db'), { timeout: 10000 });

  try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        default_country TEXT DEFAULT 'United States',
        risk_sensitivity TEXT DEFAULT 'standard',
        onboarding_complete INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        document_name TEXT NOT NULL,
        document_type TEXT DEFAULT 'Other',
        country TEXT NOT NULL,
        overall_score REAL,
        risk_level TEXT,
        verdict TEXT,
        executive_summary TEXT,
        full_analysis TEXT,
        file_path TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        default_country TEXT DEFAULT 'United States',
        risk_sensitivity TEXT DEFAULT 'standard',
        theme TEXT DEFAULT 'system',
        onboarding_complete INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT DEFAULT '',
        ip_address TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
    `);
  } catch (e) {
    console.warn('DB init warning:', e);
  }

  return db;
}

export function logActivity(userId: string, action: string, details = '', ipAddress = ''): void {
  try {
    getDb().prepare(
      'INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)'
    ).run(userId, action, details, ipAddress);
  } catch (e) {
    console.warn('[activity_log] Failed to log:', e);
  }
}

export function getProfile(userId: string): Record<string, unknown> | null {
  try {
    const profile = getDb().prepare('SELECT * FROM profiles WHERE id = ?').get(userId) as Record<string, unknown> | undefined;
    return profile || null;
  } catch {
    return null;
  }
}

export function upsertProfile(userId: string, data: Record<string, unknown>): void {
  try {
    const existing = getDb().prepare('SELECT id FROM profiles WHERE id = ?').get(userId);
    if (existing) {
      const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const values = Object.values(data);
      getDb().prepare(`UPDATE profiles SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, userId);
    } else {
      const keys = ['id', ...Object.keys(data)];
      const placeholders = keys.map(() => '?').join(', ');
      const values = [userId, ...Object.values(data)];
      getDb().prepare(`INSERT INTO profiles (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
    }
  } catch (e) {
    console.warn('[profiles] Upsert failed:', e);
  }
}

const dbInstance = getDb();
export default dbInstance;
