import { NextRequest } from 'next/server';
import { verifyToken, generateToken, hashPassword, comparePassword, generateId } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db-pool';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  theme?: string;
}

// ─── Auth Helpers ────────────────────────────────────────────────────────────

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await queryOne<AuthUser & { theme: string | null; avatar_url: string | null }>(
    'SELECT id, email, full_name, avatar_url, theme FROM public.users WHERE id = $1',
    [payload.id]
  );
  return user;
}

export async function signInWithPassword(email: string, password: string) {
  const user = await queryOne<{ id: string; email: string; password_hash: string; full_name: string }>(
    'SELECT id, email, password_hash, full_name FROM public.users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (!user) return { data: null, error: { message: 'Invalid email or password.' } };

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return { data: null, error: { message: 'Invalid email or password.' } };

  const token = generateToken({ id: user.id, email: user.email, full_name: user.full_name });
  return {
    data: {
      session: { access_token: token, refresh_token: token },
      user: { id: user.id, email: user.email, user_metadata: {} },
    },
    error: null,
  };
}

export async function createUser(params: {
  email: string;
  password: string;
  email_confirm?: boolean;
  user_metadata?: Record<string, unknown>;
}) {
  const id = generateId();
  const password_hash = await hashPassword(params.password);

  try {
    const user = await queryOne<{ id: string; email: string; full_name: string }>(
      `INSERT INTO public.users (id, email, password_hash, full_name, avatar_url, default_country, risk_sensitivity, theme, onboarding_complete)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, full_name`,
      [
        id,
        params.email.toLowerCase(),
        password_hash,
        params.user_metadata?.full_name || '',
        params.user_metadata?.avatar_url || null,
        params.user_metadata?.default_country || 'United States',
        params.user_metadata?.risk_sensitivity || 'standard',
        params.user_metadata?.theme || 'system',
        params.user_metadata?.onboarding_complete || false,
      ]
    );
    return { data: { user }, error: null };
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message || '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return { data: null, error: { message: 'Email already registered.' } };
    }
    return { data: null, error: { message: msg } };
  }
}

export async function getUserByToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return { data: { user: null }, error: { message: 'Invalid token' } };

  const user = await queryOne<{ id: string; email: string; created_at: string; full_name: string }>(
    'SELECT id, email, full_name, created_at FROM public.users WHERE id = $1',
    [payload.id]
  );
  if (!user) return { data: { user: null }, error: { message: 'User not found' } };

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { full_name: user.full_name },
        created_at: user.created_at,
      },
    },
    error: null,
  };
}

export async function updateUserById(
  userId: string,
  updates: { password?: string; user_metadata?: Record<string, unknown> }
) {
  if (updates.password) {
    const password_hash = await hashPassword(updates.password);
    await execute('UPDATE public.users SET password_hash = $1 WHERE id = $2', [password_hash, userId]);
  }
  if (updates.user_metadata) {
    const fields = ['full_name', 'default_country', 'risk_sensitivity', 'theme', 'onboarding_complete', 'avatar_url'];
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const field of fields) {
      if (field in updates.user_metadata) {
        setClauses.push(`${field} = $${idx++}`);
        values.push(updates.user_metadata[field]);
      }
    }

    if (setClauses.length > 0) {
      setClauses.push(`updated_at = NOW()`);
      values.push(userId);
      await execute(
        `UPDATE public.users SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        values
      );
    }
  }

  const user = await queryOne<{ id: string; email: string; full_name: string }>(
    'SELECT id, email, full_name FROM public.users WHERE id = $1',
    [userId]
  );
  return {
    data: { user: user ? { ...user, user_metadata: {} } : null },
    error: null,
  };
}

// ─── Placeholder exports for compatibility ────────────────────────────────────

export function createBrowserClient() {
  return null as never;
}

/** @deprecated Use createBrowserClient instead */
export function createSupabaseBrowserClient() {
  return null as never;
}

/** @deprecated Use database.ts or auth utilities directly */
export function getSupabaseAdmin() {
  return null as never;
}

/** @deprecated Use signInWithPassword instead */
export function getSupabaseAuth() {
  return null as never;
}
