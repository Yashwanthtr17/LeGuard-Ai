import { createBrowserClient } from '@/lib/supabase';
import type { Notification } from '@/lib/hooks/use-notifications';

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  const supabase = createBrowserClient();

  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
