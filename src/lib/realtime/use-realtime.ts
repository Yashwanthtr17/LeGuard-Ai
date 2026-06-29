import { useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  userId?: string,
  callback?: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase.channel(`${table}-${event}-${userId || 'all'}`);

    channel.on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
      } as never,
      (payload: RealtimePostgresChangesPayload<T>) => {
        callbackRef.current?.(payload);
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, userId]);
}
