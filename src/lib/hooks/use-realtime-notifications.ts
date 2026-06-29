"use client";

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/lib/realtime/use-realtime';
import { useUser } from '@/lib/hooks/use-auth';
import type { Notification } from '@/lib/hooks/use-notifications';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type NotificationRecord = Notification & Record<string, unknown>;

export function useRealtimeNotifications() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const handleNotification = useCallback(
    (payload: RealtimePostgresChangesPayload<NotificationRecord>) => {
      const notification = payload.new as Notification;

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    },
    [queryClient]
  );

  useRealtimeSubscription<NotificationRecord>(
    'notifications',
    'INSERT',
    user?.id,
    handleNotification
  );
}
