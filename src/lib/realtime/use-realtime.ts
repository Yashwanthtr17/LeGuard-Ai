export function useRealtimeSubscription<T extends Record<string, unknown>>(
  _table: string,
  _event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  _userId?: string,
  _callback?: (payload: unknown) => void
) {
}
