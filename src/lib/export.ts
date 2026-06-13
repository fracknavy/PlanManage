import { Task, Schedule, ScheduleItem } from "@/types";

/**
 * 将数据转换为 CSV 格式
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];

  // 添加表头
  csvRows.push(headers.join(","));

  // 添加数据行
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // 处理包含逗号、换行符或引号的值
      if (value === null || value === undefined) {
        return "";
      }
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes("\n") ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

/**
 * 下载文件
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出任务为 CSV
 */
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = [
    "id",
    "title",
    "description",
    "status",
    "priority",
    "type",
    "estimatedTime",
    "weight",
    "dueDate",
    "isFixed",
    "isRecurring",
    "createdAt",
    "updatedAt",
  ];

  const data = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    type: task.type,
    estimatedTime: task.estimatedTime,
    weight: task.weight,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : "",
    isFixed: task.isFixed ? "是" : "否",
    isRecurring: task.isRecurring ? "是" : "否",
    createdAt: new Date(task.createdAt).toISOString(),
    updatedAt: new Date(task.updatedAt).toISOString(),
  }));

  const csv = convertToCSV(data, headers);
  const filename = `tasks_${new Date().toISOString().split("T")[0]}.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * 导出任务为 JSON
 */
export function exportTasksToJSON(tasks: Task[]): void {
  const data = {
    exportDate: new Date().toISOString(),
    tasks: tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      createdAt: new Date(task.createdAt).toISOString(),
      updatedAt: new Date(task.updatedAt).toISOString(),
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const filename = `tasks_${new Date().toISOString().split("T")[0]}.json`;
  downloadFile(json, filename, "application/json");
}

/**
 * 导出时间表为 CSV
 */
export function exportScheduleToCSV(
  schedule: Schedule,
  items: ScheduleItem[]
): void {
  const headers = [
    "id",
    "startTime",
    "endTime",
    "isBreak",
    "order",
    "taskTitle",
    "taskType",
  ];

  const data = items.map((item) => ({
    id: item.id,
    startTime: new Date(item.startTime).toISOString(),
    endTime: new Date(item.endTime).toISOString(),
    isBreak: item.isBreak ? "是" : "否",
    order: item.order,
    taskTitle: item.task?.title || "",
    taskType: item.task?.type || "",
  }));

  const csv = convertToCSV(data, headers);
  const dateStr = new Date(schedule.date).toISOString().split("T")[0];
  const filename = `schedule_${dateStr}.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * 导出时间表为 JSON
 */
export function exportScheduleToJSON(
  schedule: Schedule,
  items: ScheduleItem[]
): void {
  const data = {
    exportDate: new Date().toISOString(),
    schedule: {
      ...schedule,
      date: new Date(schedule.date).toISOString(),
    },
    items: items.map((item) => ({
      ...item,
      startTime: new Date(item.startTime).toISOString(),
      endTime: new Date(item.endTime).toISOString(),
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const dateStr = new Date(schedule.date).toISOString().split("T")[0];
  const filename = `schedule_${dateStr}.json`;
  downloadFile(json, filename, "application/json");
}

/**
 * 导出为 iCal 格式
 */
export function exportToICal(tasks: Task[]): void {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PlanManage//Task Export//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const task of tasks) {
    if (!task.dueDate) continue;

    const dueDate = new Date(task.dueDate);
    const dateStr = `${dueDate.toISOString().replace(/[-:]/g, "").split(".")[0]  }Z`;

    lines.push("BEGIN:VEVENT");
    lines.push(`DTSTART:${dateStr}`);
    lines.push(`DTEND:${dateStr}`);
    lines.push(`SUMMARY:${task.title}`);
    if (task.description) {
      lines.push(`DESCRIPTION:${task.description.replace(/\n/g, "\\n")}`);
    }
    lines.push(`STATUS:${task.status === "COMPLETED" ? "COMPLETED" : "TENTATIVE"}`);
    lines.push(`PRIORITY:${getPriorityNumber(task.priority)}`);
    lines.push(`UID:${task.id}@planmanage`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const ical = lines.join("\r\n");
  const filename = `tasks_${new Date().toISOString().split("T")[0]}.ics`;
  downloadFile(ical, filename, "text/calendar;charset=utf-8;");
}

/**
 * 获取优先级对应的数字
 */
function getPriorityNumber(priority: string): number {
  switch (priority) {
    case "URGENT":
      return 1;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 5;
    case "LOW":
      return 7;
    default:
      return 5;
  }
}

/**
 * 导入任务从 JSON
 */
export function importTasksFromJSON(json: string): Task[] | null {
  try {
    const data = JSON.parse(json);
    if (data.tasks && Array.isArray(data.tasks)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    }
    return null;
  } catch (error) {
    console.error("Import tasks error:", error);
    return null;
  }
}
