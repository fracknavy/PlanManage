import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { autoSchedule } from "@/lib/scheduler";
import { SchedulerTask, ScheduleConfig } from "@/types";

// 获取时间表
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const view = searchParams.get("view") || "day"; // day or week

    let startDate: Date;
    let endDate: Date;

    if (dateStr) {
      startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }

    if (view === "week") {
      // 获取本周的开始和结束
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            task: true,
          },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Get schedule error:", error);
    return NextResponse.json(
      { error: "获取时间表失败" },
      { status: 500 }
    );
  }
}

// 自动生成时间表
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { date } = body;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // 获取用户设置
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 获取未完成的任务
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
        OR: [
          { dueDate: { lte: new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000) } },
          { dueDate: null },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // 转换为调度器任务格式
    const schedulerTasks: SchedulerTask[] = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      estimatedTime: task.estimatedTime,
      weight: task.weight,
      priority: task.priority,
      dueDate: task.dueDate || undefined,
      isFixed: task.isFixed,
      fixedStart: task.fixedStart || undefined,
      fixedEnd: task.fixedEnd || undefined,
      status: task.status,
    }));

    // 配置
    const config: ScheduleConfig = {
      workStartTime: user.defaultWorkStartTime,
      workEndTime: user.defaultWorkEndTime,
      breakDuration: user.defaultBreakDuration,
    };

    // 自动排程
    const timeSlots = autoSchedule(schedulerTasks, config, targetDate);

    // 获取或创建日程
    let schedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        date: targetDate,
      },
    });

    if (!schedule) {
      schedule = await prisma.schedule.create({
        data: {
          userId: session.user.id,
          date: targetDate,
        },
      });
    } else {
      // 清除现有日程项
      await prisma.scheduleItem.deleteMany({
        where: { scheduleId: schedule.id },
      });
    }

    // 创建日程项
    const scheduleItems = await Promise.all(
      timeSlots.map((slot, index) =>
        prisma.scheduleItem.create({
          data: {
            scheduleId: schedule.id,
            startTime: slot.start,
            endTime: slot.end,
            isBreak: slot.isBreak || false,
            taskId: slot.taskId,
            order: index,
          },
        })
      )
    );

    return NextResponse.json({
      schedule,
      items: scheduleItems,
    });
  } catch (error) {
    console.error("Generate schedule error:", error);
    return NextResponse.json(
      { error: "生成时间表失败" },
      { status: 500 }
    );
  }
}
