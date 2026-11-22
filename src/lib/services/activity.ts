import { logActivity } from '@/lib/services/database';

/**
 * Records a user activity without allowing audit logging failures to break
 * the primary request. Details are stored as JSONB.
 */
export async function recordActivity(
  userId: string,
  action: string,
  details = '',
  ipAddress = ''
): Promise<void> {
  try {
    await logActivity(
      userId,
      action,
      undefined,
      undefined,
      details ? { message: details } : undefined,
      ipAddress || undefined
    );
  } catch (error) {
    console.warn('[activity] Failed to record activity:', error);
  }
}
