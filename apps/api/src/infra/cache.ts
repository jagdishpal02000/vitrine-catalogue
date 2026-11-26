/** What the app needs from a cache. Today it lives in memory; a Redis version can implement the same contract. */
export interface Cache {
  getOrSet<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T>;
}

/**
 * An in-memory cache for a single API instance. It stores the promise rather than the value,
 * so concurrent requests share one upstream call, and it forgets failures so the next request retries.
 */
export function createMemoryCache(): Cache {
  const entries = new Map<string, { value: Promise<unknown>; expiresAt: number }>();

  return {
    getOrSet<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
      const cached = entries.get(key);
      if (cached && cached.expiresAt > Date.now()) return cached.value as Promise<T>;

      const value = load();
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      value.catch(() => {
        // Only evict our own entry: a newer load may already have replaced it.
        if (entries.get(key)?.value === value) entries.delete(key);
      });
      return value;
    },
  };
}
