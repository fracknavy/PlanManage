import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { taskSchema } from "@/validators/schemas";

// 获取所有任务（支持分页）
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

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
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 计算分页
    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
    const take = Math.min(100, Math.max(1, limit));

    // 获取总数
    const total = await prisma.task.count({ where });

    // 获取任务列表
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        children: true,
      },
    });

    // 返回分页数据
    return NextResponse.json({
      data: tasks,
      pagination: {
        total,
        page: Math.max(1, page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
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
      { error: error.message || "创建任务失败" },
      { status: 500 }
    );
  }
}
