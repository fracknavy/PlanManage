import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

// 完成任务
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    // 更新任务状态为已完成
    const task = await prisma.task.update({
      where: { id: params.id },
      data: { status: "COMPLETED" },
    });

    // 获取用户设置
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取或创建今天的日程
    let schedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        date: today,
      },
    });

    if (!schedule) {
      schedule = await prisma.schedule.create({
        data: {
          userId: session.user.id,
          date: today,
        },
      });
    }

    // 查找当前任务在日程中的位置
    const currentScheduleItem = await prisma.scheduleItem.findFirst({
      where: {
        scheduleId: schedule.id,
        taskId: params.id,
      },
    });

    if (currentScheduleItem) {
      // 在任务后插入休息时间
      const breakDuration = user?.defaultBreakDuration || 15;
      const breakStart = new Date(currentScheduleItem.endTime);
      const breakEnd = new Date(breakStart.getTime() + breakDuration * 60000);

      // 检查休息时间是否与下一个任务冲突
      const nextItem = await prisma.scheduleItem.findFirst({
        where: {
          scheduleId: schedule.id,
          startTime: { gte: currentScheduleItem.endTime },
          id: { not: currentScheduleItem.id },
        },
        orderBy: { startTime: "asc" },
      });

      if (!nextItem || nextItem.startTime >= breakEnd) {
        // 没有冲突，插入休息时间
        await prisma.scheduleItem.create({
          data: {
            scheduleId: schedule.id,
            startTime: breakStart,
            endTime: breakEnd,
            isBreak: true,
            order: currentScheduleItem.order + 1,
          },
        });
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Complete task error:", error);
    return NextResponse.json(
      { error: "完成任务失败" },
      { status: 500 }
    );
  }
}
