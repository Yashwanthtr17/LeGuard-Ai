import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryOne } from '@/lib/db-pool';
import type { AuthUser } from '@/lib/supabase';

export async function createServerClient(): Promise<{
  auth: { getUser: () => Promise<{ data: { user: AuthUser | null }; error: Error | null }> };
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('leguard_token')?.value;

  return {
    auth: {
      getUser: async () => {
        if (!token) return { data: { user: null }, error: new Error('No token') };
        const payload = verifyToken(token);
        if (!payload) return { data: { user: null }, error: new Error('Invalid token') };

        const user = await queryOne<AuthUser>(
          'SELECT id, email, full_name, avatar_url, theme FROM public.users WHERE id = $1',
          [payload.id]
        );
        if (!user) return { data: { user: null }, error: new Error('User not found') };

        return { data: { user }, error: null };
      },
    },
  };
}
