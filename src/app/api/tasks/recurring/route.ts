import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getNextOccurrence } from "@/lib/recurrence";

// 生成重复任务
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, daysAhead = 7 } = body;

    // 获取原始任务
    const originalTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
        isRecurring: true,
      },
    });

    if (!originalTask) {
      return NextResponse.json(
        { error: "任务不存在或不是重复任务" },
        { status: 404 }
      );
    }

    if (!originalTask.recurrenceRule) {
      return NextResponse.json(
        { error: "任务缺少重复规则" },
        { status: 400 }
      );
    }

    // 获取需要生成的日期范围
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    // 获取已存在的重复任务实例
    const existingTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        title: originalTask.title,
        isRecurring: true,
        recurrenceRule: originalTask.recurrenceRule,
        dueDate: {
          gte: now,
          lte: endDate,
        },
      },
    });

    const existingDates = new Set(
      existingTasks
        .filter((t) => t.dueDate)
        .map((t) => new Date(t.dueDate!).toDateString())
    );

    // 生成新的重复任务
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newTasks: any[] = [];
    let currentDate = now;

    while (currentDate <= endDate) {
      const nextDate = getNextOccurrence(originalTask.recurrenceRule, currentDate);

      if (!nextDate || nextDate > endDate) break;

      const dateString = nextDate.toDateString();

      // 检查是否已存在该日期的任务
      if (!existingDates.has(dateString)) {
        newTasks.push({
          title: originalTask.title,
          description: originalTask.description,
          estimatedTime: originalTask.estimatedTime,
          weight: originalTask.weight,
          priority: originalTask.priority,
          type: originalTask.type,
          isFixed: originalTask.isFixed,
          fixedStart: originalTask.fixedStart,
          fixedEnd: originalTask.fixedEnd,
          sourceUrl: originalTask.sourceUrl,
          isRecurring: true,
          recurrenceRule: originalTask.recurrenceRule,
          dueDate: nextDate,
          userId: session.user.id,
        });
      }

      currentDate = new Date(nextDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 批量创建任务
    if (newTasks.length > 0) {
      await prisma.task.createMany({
        data: newTasks,
      });
    }

    return NextResponse.json({
      message: `已生成 ${newTasks.length} 个重复任务`,
      count: newTasks.length,
    });
  } catch (error) {
    console.error("Generate recurring tasks error:", error);
    return NextResponse.json(
      { error: "生成重复任务失败" },
      { status: 500 }
    );
  }
}

// 获取重复任务列表
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get("daysAhead") || "7", 10);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    // 获取所有重复任务
    const recurringTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        isRecurring: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // 按重复规则分组
    const groupedTasks: Record<string, typeof recurringTasks> = {};
    recurringTasks.forEach((task) => {
      const key = `${task.title}-${task.recurrenceRule}`;
      if (!groupedTasks[key]) {
        groupedTasks[key] = [];
      }
      groupedTasks[key].push(task);
    });

    return NextResponse.json({
      tasks: recurringTasks,
      grouped: groupedTasks,
    });
  } catch (error) {
    console.error("Get recurring tasks error:", error);
    return NextResponse.json(
      { error: "获取重复任务失败" },
      { status: 500 }
    );
  }
}
