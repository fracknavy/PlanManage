/**
 * 缓存工具
 */
import { CACHE_DEFAULT_TTL_MS, CACHE_DEFAULT_MAX_SIZE, LOCAL_STORAGE_TTL_MS } from "./constants";

export interface CacheOptions {
  ttl?: number; // 生存时间（毫秒）
  maxSize?: number; // 最大缓存条目数
  staleWhileRevalidate?: boolean; // 是否在重新验证时返回过期数据
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

/**
 * 内存缓存
 */
export class MemoryCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<CacheOptions>;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  } = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || CACHE_DEFAULT_TTL_MS,
      maxSize: options.maxSize || CACHE_DEFAULT_MAX_SIZE,
      staleWhileRevalidate: options.staleWhileRevalidate || false,
    };
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // 检查是否过期
    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired && !this.options.staleWhileRevalidate) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // 更新命中次数
    entry.hits++;
    this.stats.hits++;

    return entry.value;
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: T, ttl?: number): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
      hits: 0,
    });
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
    };
  }

  /**
   * 驱逐过期或最少使用的条目
   */
  private evict(): void {
    const now = Date.now();
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // 首先驱逐过期的条目
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.evictions++;
        return;
      }
    }

    // 如果没有过期条目，驱逐最少使用的
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < oldestTime) {
        oldestTime = entry.hits;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 获取或设置缓存
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * 批量获取
   */
  mget(keys: string[]): (T | undefined)[] {
    return keys.map((key) => this.get(key));
  }

  /**
   * 批量设置
   */
  mset(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => this.set(key, value, ttl));
  }
}

/**
 * 本地存储缓存
 */
export class LocalStorageCache<T = unknown> {
  private prefix: string;
  private defaultTtl: number;

  constructor(prefix: string = "cache_", defaultTtl: number = 5 * 60 * 1000) {
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return undefined;
      }

      const entry = JSON.parse(item);
      const now = Date.now();

      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        return undefined;
      }

      return entry.value;
    } catch {
      return undefined;
    }
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: T, ttl?: number): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const entry = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTtl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn("Failed to set localStorage cache:", error);
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// 创建全局缓存实例
export const memoryCache = new MemoryCache({
  ttl: CACHE_DEFAULT_TTL_MS,
  maxSize: CACHE_DEFAULT_MAX_SIZE,
});

export const localStorageCache = new LocalStorageCache("planmanage_", LOCAL_STORAGE_TTL_MS);

/**
 * 缓存装饰器
 */
export function cached<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
    cache?: MemoryCache;
  } = {}
): T {
  const cache = options.cache || memoryCache;
  const keyGenerator =
    options.keyGenerator || ((...args) => JSON.stringify(args));

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result, options.ttl);
    return result;
  }) as T;
}

/**
 * 异步缓存装饰器
 */
export function cachedAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
    cache?: MemoryCache;
  } = {}
): T {
  const cache = options.cache || memoryCache;
  const keyGenerator =
    options.keyGenerator || ((...args) => JSON.stringify(args));

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return cache.getOrSet(key, () => fn(...args), options.ttl);
  }) as T;
}
