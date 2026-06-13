import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const type = searchParams.get("type") || "tasks";

    if (type === "tasks") {
      // 导出任务
      const tasks = await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          children: true,
        },
      });

      if (format === "csv") {
        // 返回 CSV 格式
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
        ];

        const rows = tasks.map((task) => [
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || "").replace(/"/g, '""')}"`,
          task.status,
          task.priority,
          task.type,
          task.estimatedTime,
          task.weight,
          task.dueDate ? new Date(task.dueDate).toISOString() : "",
          task.isFixed ? "是" : "否",
          task.isRecurring ? "是" : "否",
          new Date(task.createdAt).toISOString(),
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="tasks_${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      } else {
        // 返回 JSON 格式
        return NextResponse.json({
          exportDate: new Date().toISOString(),
          tasks: tasks.map((task) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            createdAt: new Date(task.createdAt).toISOString(),
            updatedAt: new Date(task.updatedAt).toISOString(),
          })),
        });
      }
    } else if (type === "schedule") {
      // 导出时间表
      const dateStr = searchParams.get("date");
      const date = dateStr ? new Date(dateStr) : new Date();

      const schedule = await prisma.schedule.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          items: {
            include: {
              task: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!schedule) {
        return NextResponse.json(
          { error: "未找到时间表" },
          { status: 404 }
        );
      }

      if (format === "csv") {
        // 返回 CSV 格式
        const headers = [
          "id",
          "startTime",
          "endTime",
          "isBreak",
          "order",
          "taskTitle",
          "taskType",
        ];

        const rows = schedule.items.map((item) => [
          item.id,
          new Date(item.startTime).toISOString(),
          new Date(item.endTime).toISOString(),
          item.isBreak ? "是" : "否",
          item.order,
          `"${(item.task?.title || "").replace(/"/g, '""')}"`,
          item.task?.type || "",
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="schedule_${new Date(schedule.date).toISOString().split("T")[0]}.csv"`,
          },
        });
      } else {
        // 返回 JSON 格式
        return NextResponse.json({
          exportDate: new Date().toISOString(),
          schedule: {
            ...schedule,
            date: new Date(schedule.date).toISOString(),
          },
          items: schedule.items.map((item) => ({
            ...item,
            startTime: new Date(item.startTime).toISOString(),
            endTime: new Date(item.endTime).toISOString(),
          })),
        });
      }
    }

    return NextResponse.json(
      { error: "不支持的导出类型" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "导出失败" },
      { status: 500 }
    );
  }
}
