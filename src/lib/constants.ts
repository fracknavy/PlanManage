/**
 * 应用常量
 */

// Auth 相关
export const BCRYPT_SALT_ROUNDS = 12;
export const PASSWORD_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 小时
export const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 小时

// Rate limiting
export const RATE_LIMIT_INTERVAL_MS = 60 * 1000; // 1 分钟
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_UNIQUE_TOKENS = 500;
export const RATE_LIMIT_CLEANUP_PROBABILITY = 0.01;

// Cache
export const CACHE_DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 分钟
export const CACHE_DEFAULT_MAX_SIZE = 1000;
export const LOCAL_STORAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 小时
