/** Drops keys whose value is `undefined` so they are not sent to Supabase. */
export function withoutUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}
