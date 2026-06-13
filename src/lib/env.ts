import { z } from "zod";

/**
 * 环境变量验证 Schema
 * 使用 zod 确保所有必需的环境变量都已正确配置
 */
const envSchema = z.object({
  // 数据库
  DATABASE_URL: z.string().min(1, "DATABASE_URL 是必需的"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET 是必需的"),
  NEXTAUTH_URL: z.string().url().optional(),

  // Supabase（可选）
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Node 环境
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * 验证并返回环境变量
 * 在应用启动时调用，确保所有必需的环境变量都已配置
 */
export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ 环境变量验证失败:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("环境变量验证失败，请检查 .env 文件");
  }

  return parsed.data;
}

/**
 * 获取环境变量（带验证）
 * 在运行时使用，确保类型安全
 */
export function getEnv() {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: (process.env.NODE_ENV as string) || "development",
  };
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * 检查是否为测试环境
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}
