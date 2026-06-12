import { Priority, TaskStatus, TaskType } from "@prisma/client";

export type { Priority, TaskStatus, TaskType };

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  defaultWorkStartTime: string;
  defaultWorkEndTime: string;
  defaultBreakDuration: number;
  defaultTaskWeight: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  estimatedTime: number;
  weight: number;
  priority: Priority;
  dueDate?: Date | null;
  status: TaskStatus;
  type: TaskType;
  isFixed: boolean;
  fixedStart?: Date | null;
  fixedEnd?: Date | null;
  sourceUrl?: string | null;
  parentId?: string | null;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  children?: Task[];
}

export interface Schedule {
  id: string;
  date: Date;
  userId: string;
  items: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  startTime: Date;
  endTime: Date;
  isBreak: boolean;
  order: number;
  scheduleId: string;
  taskId?: string | null;
  task?: Task | null;
}

export interface LinkParse {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  favicon?: string | null;
  parsedAt: Date;
  userId: string;
}

export interface ScheduleConfig {
  workStartTime: string;
  workEndTime: string;
  breakDuration: number;
}

export interface SchedulerTask {
  id: string;
  title: string;
  estimatedTime: number;
  weight: number;
  priority: Priority;
  dueDate?: Date | null;
  isFixed: boolean;
  fixedStart?: Date | null;
  fixedEnd?: Date | null;
  status: TaskStatus;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  taskId?: string;
  isBreak?: boolean;
}
