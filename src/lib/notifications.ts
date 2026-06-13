/**
 * 通知系统工具函数
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * 检查浏览器是否支持通知
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * 获取通知权限状态
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return await Notification.requestPermission();
}

/**
 * 发送通知
 */
export async function sendNotification(
  options: NotificationOptions
): Promise<Notification | null> {
  // 检查支持
  if (!isNotificationSupported()) {
    console.warn("Browser does not support notifications");
    return null;
  }

  // 检查权限
  if (Notification.permission !== "granted") {
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/favicon.ico",
      badge: options.badge || "/favicon.ico",
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
    });

    // 点击通知时的处理
    notification.onclick = () => {
      window.focus();
      notification.close();

      // 如果有数据，可以进行路由跳转
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}

/**
 * 发送任务提醒通知
 */
export async function sendTaskReminderNotification(
  taskTitle: string,
  dueDate: Date,
  taskId?: string
): Promise<Notification | null> {
  const now = new Date();
  const timeUntilDue = dueDate.getTime() - now.getTime();
  const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));

  let body: string;
  if (minutesUntilDue <= 0) {
    body = `任务 "${taskTitle}" 已到期！`;
  } else if (minutesUntilDue < 60) {
    body = `任务 "${taskTitle}" 将在 ${minutesUntilDue} 分钟后到期`;
  } else {
    const hoursUntilDue = Math.floor(minutesUntilDue / 60);
    body = `任务 "${taskTitle}" 将在 ${hoursUntilDue} 小时后到期`;
  }

  return sendNotification({
    title: "任务提醒",
    body,
    tag: `task-reminder-${taskId || taskTitle}`,
    data: {
      type: "task_reminder",
      taskId,
      url: taskId ? `/tasks/${taskId}` : "/tasks",
    },
    requireInteraction: true,
  });
}

/**
 * 发送休息结束通知
 */
export async function sendBreakEndNotification(): Promise<Notification | null> {
  return sendNotification({
    title: "休息结束",
    body: "休息时间已结束，准备开始下一个任务吧！",
    tag: "break-end",
    data: {
      type: "break_end",
      url: "/schedule",
    },
  });
}

/**
 * 发送任务完成通知
 */
export async function sendTaskCompleteNotification(
  taskTitle: string
): Promise<Notification | null> {
  return sendNotification({
    title: "任务完成",
    body: `恭喜！任务 "${taskTitle}" 已完成`,
    tag: "task-complete",
    data: {
      type: "task_complete",
    },
  });
}

/**
 * 设置任务提醒
 */
export function setTaskReminder(
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  reminderMinutes: number = 15
): NodeJS.Timeout | null {
  const now = new Date();
  const reminderTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);

  // 如果提醒时间已过，不设置提醒
  if (reminderTime <= now) {
    return null;
  }

  const delay = reminderTime.getTime() - now.getTime();

  return setTimeout(() => {
    sendTaskReminderNotification(taskTitle, dueDate, taskId);
  }, delay);
}

/**
 * 清除任务提醒
 */
export function clearTaskReminder(timerId: NodeJS.Timeout): void {
  clearTimeout(timerId);
}

/**
 * 通知管理器
 */
export class NotificationManager {
  private reminders: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 添加任务提醒
   */
  addReminder(
    taskId: string,
    taskTitle: string,
    dueDate: Date,
    reminderMinutes: number = 15
  ): boolean {
    // 清除已有的提醒
    this.removeReminder(taskId);

    const timerId = setTaskReminder(
      taskId,
      taskTitle,
      dueDate,
      reminderMinutes
    );

    if (timerId) {
      this.reminders.set(taskId, timerId);
      return true;
    }

    return false;
  }

  /**
   * 移除任务提醒
   */
  removeReminder(taskId: string): void {
    const timerId = this.reminders.get(taskId);
    if (timerId) {
      clearTaskReminder(timerId);
      this.reminders.delete(taskId);
    }
  }

  /**
   * 清除所有提醒
   */
  clearAllReminders(): void {
    for (const timerId of this.reminders.values()) {
      clearTaskReminder(timerId);
    }
    this.reminders.clear();
  }

  /**
   * 获取提醒数量
   */
  getReminderCount(): number {
    return this.reminders.size;
  }
}

// 创建全局通知管理器实例
export const notificationManager = new NotificationManager();
