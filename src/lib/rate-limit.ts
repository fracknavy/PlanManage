import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitConfig {
  interval: number; // 时间窗口（毫秒）
  uniqueTokenPerInterval: number; // 每个时间窗口内的唯一令牌数
  maxRequests: number; // 每个时间窗口内的最大请求数
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// 内存存储（生产环境应使用 Redis）
const tokenCache = new Map<string, { count: number; resetTime: number }>();

/**
 * 清理过期的缓存条目
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of tokenCache.entries()) {
    if (value.resetTime < now) {
      tokenCache.delete(key);
    }
  }
}

/**
 * 获取客户端标识符
 */
function getClientIdentifier(request: NextRequest): string {
  // 优先使用 X-Forwarded-For 头
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // 使用 X-Real-IP 头
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // 使用默认值
  return "unknown";
}

/**
 * 速率限制函数
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 分钟
    uniqueTokenPerInterval: 500,
    maxRequests: 100,
  }
): Promise<RateLimitResult> {
  // 定期清理缓存
  if (Math.random() < 0.01) {
    // 1% 的概率清理
    cleanupCache();
  }

  const clientId = getClientIdentifier(request);
  const now = Date.now();
  const resetTime = now + config.interval;

  // 获取或创建客户端记录
  let clientRecord = tokenCache.get(clientId);

  if (!clientRecord || clientRecord.resetTime < now) {
    // 创建新记录或重置过期记录
    clientRecord = { count: 0, resetTime };
    tokenCache.set(clientId, clientRecord);
  }

  // 检查是否超过限制
  if (clientRecord.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: clientRecord.resetTime,
    };
  }

  // 增加计数
  clientRecord.count++;

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - clientRecord.count,
    reset: clientRecord.resetTime,
  };
}

/**
 * 创建速率限制响应
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: "请求过于频繁，请稍后再试",
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    },
    { status: 429 }
  );

  // 设置速率限制响应头
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());
  response.headers.set(
    "Retry-After",
    Math.ceil((result.reset - Date.now()) / 1000).toString()
  );

  return response;
}

/**
 * 速率限制中间件
 */
export async function withRateLimit(
  request: NextRequest,
  config?: RateLimitConfig
): Promise<NextResponse | null> {
  const result = await rateLimit(request, config);

  if (!result.success) {
    return createRateLimitResponse(result);
  }

  return null; // 继续处理请求
}

/**
 * 预定义的速率限制配置
 */
export const RATE_LIMIT_CONFIGS = {
  // 认证相关（更严格）
  auth: {
    interval: 15 * 60 * 1000, // 15 分钟
    uniqueTokenPerInterval: 100,
    maxRequests: 5, // 5 次尝试
  },
  // API 通用
  api: {
    interval: 60 * 1000, // 1 分钟
    uniqueTokenPerInterval: 500,
    maxRequests: 100, // 100 次请求
  },
  // 链接解析（较严格）
  linkParse: {
    interval: 60 * 1000, // 1 分钟
    uniqueTokenPerInterval: 100,
    maxRequests: 10, // 10 次请求
  },
  // 文件上传（最严格）
  upload: {
    interval: 60 * 1000, // 1 分钟
    uniqueTokenPerInterval: 50,
    maxRequests: 5, // 5 次请求
  },
} as const;
