import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
});

export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
  name: z.string().min(2, "姓名至少2个字符").optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  estimatedTime: z.number().min(1, "预计耗时至少1分钟"),
  weight: z.number().min(1).max(10).default(5),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.preprocess((val) => {
    if (typeof val === "string" && val) return new Date(val);
    if (val === null) return undefined;
    return val;
  }, z.date().optional()),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "OVERDUE"]).default("NOT_STARTED"),
  type: z.enum(["WORK", "STUDY", "PERSONAL", "HEALTH", "OTHER"]).default("OTHER"),
  isFixed: z.boolean().default(false),
  fixedStart: z.preprocess((val) => {
    if (typeof val === "string" && val) return new Date(val);
    if (val === null) return undefined;
    return val;
  }, z.date().optional()),
  fixedEnd: z.preprocess((val) => {
    if (typeof val === "string" && val) return new Date(val);
    if (val === null) return undefined;
    return val;
  }, z.date().optional()),
  sourceUrl: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  }, z.string().url().optional()),
  parentId: z.string().nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().nullable().optional(),
});

export const updateTaskSchema = taskSchema.partial();

export const settingsSchema = z.object({
  name: z.string().min(1, "姓名不能为空").optional(),
  defaultWorkStartTime: z.string().regex(/^\d{2}:\d{2}$/, "格式应为 HH:mm"),
  defaultWorkEndTime: z.string().regex(/^\d{2}:\d{2}$/, "格式应为 HH:mm"),
  defaultBreakDuration: z.number().min(5).max(60),
  defaultTaskWeight: z.number().min(1).max(10),
});

export const linkParseSchema = z.object({
  url: z.string().url("请输入有效的URL"),
});

export const scheduleItemSchema = z.object({
  startTime: z.preprocess((val) => {
    if (typeof val === "string" && val) return new Date(val);
    return val;
  }, z.date()),
  endTime: z.preprocess((val) => {
    if (typeof val === "string" && val) return new Date(val);
    return val;
  }, z.date()),
  isBreak: z.boolean().default(false),
  taskId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type LinkParseInput = z.infer<typeof linkParseSchema>;
export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
