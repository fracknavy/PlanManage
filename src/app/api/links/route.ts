import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

// 获取链接解析历史
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      prisma.linkParse.findMany({
        where: { userId: session.user.id },
        orderBy: { parsedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.linkParse.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json(
      { error: "获取链接历史失败" },
      { status: 500 }
    );
  }
}

// 删除单条解析记录
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少ID参数" }, { status: 400 });
    }

    // 验证记录属于当前用户
    const link = await prisma.linkParse.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    await prisma.linkParse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json(
      { error: "删除失败" },
      { status: 500 }
    );
  }
}
