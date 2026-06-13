import { prisma } from "./prisma";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "REGISTER"
  | "COMPLETE"
  | "UNCOMPLETE"
  | "EXPORT"
  | "IMPORT";

export type AuditEntity =
  | "task"
  | "schedule"
  | "schedule_item"
  | "user"
  | "settings"
  | "link_parse";

interface AuditLogData {
  userId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 创建审计日志
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    // 审计日志失败不应该阻止主业务流程
    console.error("Failed to create audit log:", error);
  }
}

/**
 * 获取用户的审计日志
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    entity?: AuditEntity;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) {
  const {
    entity,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = options || {};

  const where: any = { userId };

  if (entity) {
    where.entity = entity;
  }

  if (action) {
    where.action = action;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
  const take = Math.min(100, Math.max(1, limit));

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      total,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * 获取实体的审计日志
 */
export async function getEntityAuditLogs(
  entity: AuditEntity,
  entityId: string,
  options?: {
    page?: number;
    limit?: number;
  }
) {
  const { page = 1, limit = 50 } = options || {};

  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
  const take = Math.min(100, Math.max(1, limit));

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.auditLog.count({
      where: {
        entity,
        entityId,
      },
    }),
  ]);

  return {
    data: logs,
    pagination: {
      total,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * 获取审计日志统计
 */
export async function getAuditLogStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const where: any = { userId };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [totalLogs, actionCounts, entityCounts] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ["action"],
      where,
      _count: true,
    }),
    prisma.auditLog.groupBy({
      by: ["entity"],
      where,
      _count: true,
    }),
  ]);

  return {
    totalLogs,
    actionCounts: actionCounts.map((item) => ({
      action: item.action,
      count: item._count,
    })),
    entityCounts: entityCounts.map((item) => ({
      entity: item.entity,
      count: item._count,
    })),
  };
}
