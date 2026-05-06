/**
 * Caching utilities for performance optimization
 * Implements in-memory caching with TTL (Time To Live) for frequently accessed data
 */

import { supabase } from '@/lib/supabase';

/**
 * Cache manager for the OKR application
 * Implements caching with TTL and LRU eviction policy
 */

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  expiry: number;
  createdAt: number;
}

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 300000, // 5 minutes
  maxSize: 100,
  cleanupInterval: 60000 // 1 minute
};

// Cache class implementation
export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // Check if entry exists and is not expired
    if (entry) {
      if (Date.now() < entry.expiry) {
        return entry.data;
      } else {
        // Remove expired entry
        this.cache.delete(key);
      }
    }
    
    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Check if cache is at max size and remove oldest entry
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    const expiry = Date.now() + (ttl || this.config.ttl);
    
    this.cache.set(key, {
      data,
      expiry,
      createdAt: Date.now()
    });
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if cache has key
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Start cleanup process
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Stop cleanup process
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Create a global cache instance
export const cacheManager = new CacheManager();

// API response cache
export class APICache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static ttl = 300000; // 5 minutes

  static get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  static set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  static clear(): void {
    this.cache.clear();
  }

  static delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Database query cache
export class DatabaseCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static ttl = 60000; // 1 minute

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const now = Date.now();
    if ((now - entry.timestamp) >= this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

static set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  static clear(): void {
    this.cache.clear();
  }

  static invalidate(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Component cache for React
export class ComponentCache {
  private static cache = new Map<string, { element: React.ReactNode; timestamp: number }>();
  private static ttl = 300000; // 5 minutes

  static get = (key: string, queryFn: () => Promise<T>, useCache: boolean = true) => {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cached && (now - cached.timestamp) < this.ttl) {
      return cached.element;
    }
    
    return null;
  }

  static set(key: string, element: React.ReactNode): void {
    this.cache.set(key, { element, timestamp: Date.now() });
  }

  static clear(): void {
    this.cache.clear();
  }

  static invalidate(key: string): boolean {
    return this.cache.delete(key);
  }
}

// HTTP request cache
export class HTTPCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static ttl = 300000; // 5 minutes

  static async fetchWithCache<T>(
    url: string,
    fetchFn: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    if (!useCache) {
      return await fetchFn();
    }
    
    const cached = this.cache.get(url);
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cached && (now - cached.timestamp) < this.ttl) {
      return cached.data;
    }
    
    // Fetch fresh data
    try {
      const data = await fetchFn();
      this.cache.set(url, { data, timestamp: now });
      return data;
    } catch (error) {
      // If fetch fails but we have cached data, return that
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  static clear(): void {
    this.cache.clear();
  }

  static invalidate(url: string): boolean {
    return this.cache.delete(url);
  }
}

// Export cache instances
export const apiCache = new APICache();
export const dbCache = new DatabaseCache();
export const componentCache = new ComponentCache();
export const httpCache = new HTTPCache();