import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";
import { handleApiError } from "@/lib/api-utils";

const tagSchema = z.object({
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色格式不正确").default("#3b82f6"),
});

// 获取所有标签
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleApiError(error);
  }
}

// 创建标签
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = tagSchema.parse(body);

    // 检查标签是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "标签已存在" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除标签
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("id");

    if (!tagId) {
      return NextResponse.json(
        { error: "标签ID不能为空" },
        { status: 400 }
      );
    }

    // 检查标签是否存在且属于当前用户
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id,
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }

    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ message: "标签已删除" });
  } catch (error) {
    return handleApiError(error);
  }
}
