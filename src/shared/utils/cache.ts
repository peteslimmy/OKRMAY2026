/**
 * 4CORE OKR Platform - Cache Utilities
 */

const DEFAULT_STALE_TIME = 30000; // 30 seconds

interface CacheEntry<T> {
  data: T;
  lastFetch: number;
}

const cache: Record<string, CacheEntry<unknown>> = {};

/**
 * Check if cache entry is valid
 */
export const isCacheValid = (key: string, staleTime = DEFAULT_STALE_TIME): boolean => {
  const entry = cache[key];
  return entry !== undefined && (Date.now() - entry.lastFetch < staleTime);
};

/**
 * Get data from cache
 */
export const getCachedData = <T>(key: string): T | null => {
  const entry = cache[key];
  if (!entry) return null;
  return entry.data as T;
};

/**
 * Set data in cache
 */
export const setCachedData = <T>(key: string, data: T): void => {
  cache[key] = {
    data,
    lastFetch: Date.now()
  };
};

/**
 * Invalidate a specific cache entry
 */
export const invalidateCache = (key: string): void => {
  delete cache[key];
};

/**
 * Invalidate all cache entries matching a prefix
 */
export const invalidateCachePrefix = (prefix: string): void => {
  Object.keys(cache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete cache[key]);
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};

/**
 * Cache wrapper for async functions
 */
export const cachedAsync = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime = DEFAULT_STALE_TIME
): Promise<T> => {
  if (isCacheValid(key, staleTime)) {
    return getCachedData<T>(key)!;
  }
  
  const data = await fetcher();
  setCachedData(key, data);
  return data;
};

/**
 * Cache keys constants
 */
export const CACHE_KEYS = {
  USERS: 'users',
  BUSINESS_UNITS: 'business_units',
  KEY_RESULTS: 'key_results',
  GOVERNANCE_CONFIG: 'governance_config',
  PERFORMANCE: 'performance',
  OBJECTIVES: 'objectives',
  VIOLATIONS: 'violations',
  ATTENDANCE: 'attendance'
} as const;