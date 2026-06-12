import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

// 更新日程项（用于拖拽排序）
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { startTime, endTime, order } = body;

    // 检查日程项是否存在且属于当前用户
    const existingItem = await prisma.scheduleItem.findFirst({
      where: {
        id: params.id,
        schedule: {
          userId: session.user.id,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "日程项不存在" }, { status: 404 });
    }

    // 如果有时间更新，检查冲突
    if (startTime && endTime) {
      const conflictingItem = await prisma.scheduleItem.findFirst({
        where: {
          scheduleId: existingItem.scheduleId,
          id: { not: params.id },
          isBreak: false,
          OR: [
            {
              startTime: { lt: new Date(endTime) },
              endTime: { gt: new Date(startTime) },
            },
          ],
        },
      });

      if (conflictingItem) {
        return NextResponse.json(
          { error: "时间冲突，请选择其他时间" },
          { status: 400 }
        );
      }
    }

    const updatedItem = await prisma.scheduleItem.update({
      where: { id: params.id },
      data: {
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(order !== undefined && { order }),
      },
      include: {
        task: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Update schedule item error:", error);
    return NextResponse.json(
      { error: "更新日程项失败" },
      { status: 500 }
    );
  }
}

// 删除日程项（用于跳过休息）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 检查日程项是否存在且属于当前用户
    const existingItem = await prisma.scheduleItem.findFirst({
      where: {
        id: params.id,
        schedule: {
          userId: session.user.id,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "日程项不存在" }, { status: 404 });
    }

    // 删除日程项
    await prisma.scheduleItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "日程项已删除" });
  } catch (error) {
    console.error("Delete schedule item error:", error);
    return NextResponse.json(
      { error: "删除日程项失败" },
      { status: 500 }
    );
  }
}
