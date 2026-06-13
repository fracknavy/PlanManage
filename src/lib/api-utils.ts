import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { prisma } from "./prisma";
import { ZodError } from "zod";

/**
 * API 响应类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * 创建成功响应
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details !== undefined && { details }),
    },
    { status }
  );
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message: string = "未授权"): NextResponse {
  return errorResponse(message, 401);
}

/**
 * 创建未找到响应
 */
export function notFoundResponse(message: string = "资源不存在"): NextResponse {
  return errorResponse(message, 404);
}

/**
 * 创建验证错误响应
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  const firstError = error.issues?.[0];
  const message = firstError?.message || "数据验证失败";
  return errorResponse(message, 400, error.issues);
}

/**
 * 获取当前认证用户
 * @returns 用户信息或 null
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name,
    image: session.user.image,
  };
}

/**
 * 获取当前认证用户（带完整信息）
 * @returns 完整用户信息或 null
 */
export async function getAuthenticatedUserWithSettings() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      defaultWorkStartTime: true,
      defaultWorkEndTime: true,
      defaultBreakDuration: true,
      defaultTaskWeight: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * 验证资源所有权
 * @param resourceType 资源类型
 * @param resourceId 资源 ID
 * @param userId 用户 ID
 * @returns 资源信息或 null
 */
export async function verifyResourceOwnership(
  resourceType: "task" | "schedule" | "linkParse",
  resourceId: string,
  userId: string
) {
  switch (resourceType) {
    case "task":
      return prisma.task.findFirst({
        where: {
          id: resourceId,
          userId,
        },
      });

    case "schedule":
      return prisma.schedule.findFirst({
        where: {
          id: resourceId,
          userId,
        },
      });

    case "linkParse":
      return prisma.linkParse.findFirst({
        where: {
          id: resourceId,
          userId,
        },
      });

    default:
      return null;
  }
}

/**
 * API 路由处理器类型
 */
type ApiHandler = (
  request: Request,
  context?: any
) => Promise<NextResponse>;

/**
 * 包装 API 路由处理器，添加认证检查
 * @param handler 原始处理器
 * @returns 包装后的处理器
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (request: Request, context?: any) => {
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    // 将用户信息添加到请求上下文
    (request as any).user = user;

    return handler(request, context);
  };
}

/**
 * 包装 API 路由处理器，添加认证和资源所有权检查
 * @param resourceType 资源类型
 * @param handler 原始处理器
 * @returns 包装后的处理器
 */
export function withAuthAndOwnership(
  resourceType: "task" | "schedule" | "linkParse",
  handler: ApiHandler
): ApiHandler {
  return withAuth(async (request: Request, context?: any) => {
    const user = (request as any).user;
    const resourceId = context?.params?.id;

    if (resourceId) {
      const resource = await verifyResourceOwnership(
        resourceType,
        resourceId,
        user.id
      );

      if (!resource) {
        return notFoundResponse();
      }

      // 将资源信息添加到请求上下文
      (request as any).resource = resource;
    }

    return handler(request, context);
  });
}

/**
 * 处理 API 错误
 * @param error 错误对象
 * @returns 错误响应
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof Error) {
    return errorResponse(error.message);
  }

  return errorResponse("服务器内部错误");
}

/**
 * 解析分页参数
 * @param url 请求 URL
 * @returns 分页参数
 */
export function parsePaginationParams(url: URL) {
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  };
}

/**
 * 创建分页响应
 * @param data 数据列表
 * @param total 总数
 * @param page 当前页
 * @param limit 每页数量
 * @returns 分页响应
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
