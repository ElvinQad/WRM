import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class TimelineCacheService {
  private readonly logger = new Logger(TimelineCacheService.name);
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  
  // Default TTL: 5 minutes for timeline data
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Generate cache key for timeline queries
   */
  generateTimelineKey(userId: string, view: string, startDate: Date, endDate: Date): string {
    // Round dates to nearest minute to improve cache hit rate
    const roundedStart = new Date(Math.floor(startDate.getTime() / 60000) * 60000);
    const roundedEnd = new Date(Math.floor(endDate.getTime() / 60000) * 60000);
    
    return `timeline:${userId}:${view}:${roundedStart.toISOString()}:${roundedEnd.toISOString()}`;
  }

  /**
   * Get cached data
   */
  get<T>(key: string): { data: T; cached: true } | { data: null; cached: false } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { data: null, cached: false };
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.logger.debug(`Cache entry expired and removed: ${key}`);
      return { data: null, cached: false };
    }

    this.logger.debug(`Cache hit: ${key}`);
    return { data: entry.data as T, cached: true };
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    
    this.logger.debug(`Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache entry deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    const keys = Array.from(this.cache.keys());
    
    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2; // Key string
      memoryUsage += JSON.stringify(entry.data).length * 2; // Data (rough estimate)
      memoryUsage += 24; // Overhead for timestamp, ttl, etc.
    }

    return {
      size: this.cache.size,
      keys,
      memoryUsage,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Cleaned up ${removed} expired cache entries`);
    }

    return removed;
  }

  /**
   * Invalidate cache for specific user
   */
  invalidateUserCache(userId: string): number {
    let removed = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(`timeline:${userId}:`)) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Invalidated ${removed} cache entries for user ${userId}`);
    }

    return removed;
  }

  /**
   * Get cache information for a specific key
   */
  getCacheInfo(key: string): {
    hit: boolean;
    key: string;
    ttl?: number;
    age?: number;
  } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { hit: false, key };
    }

    const age = Date.now() - entry.timestamp;
    const remainingTtl = entry.ttl - age;

    return {
      hit: true,
      key,
      ttl: remainingTtl,
      age,
    };
  }
}
