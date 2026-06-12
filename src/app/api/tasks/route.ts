import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { taskSchema } from "@/validators/schemas";

// 获取所有任务
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");

    const where: any = { userId: session.user.id };

    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        children: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "获取任务失败" },
      { status: 500 }
    );
  }
}

// 创建任务
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("Create task error:", error);

    // Zod 验证错误
    if (error.name === "ZodError") {
      const firstError = error.issues?.[0];
      const message = firstError?.message || "数据验证失败";
      return NextResponse.json(
        { error: message, details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "创建任务失败" },
      { status: 500 }
    );
  }
}
