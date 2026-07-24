import type { Notification } from '@/lib/hooks/use-notifications';

export function subscribeToNotifications(
  _userId: string,
  _callback: (notification: Notification) => void
): () => void {
  return () => {};
}
