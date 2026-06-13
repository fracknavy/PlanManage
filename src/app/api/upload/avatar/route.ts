import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { uploadAvatar, deleteFile } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    // 上传新头像
    const result = await uploadAvatar(file);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // 获取用户当前头像
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true },
    });

    // 删除旧头像（如果不是默认头像）
    if (user?.avatarUrl && !user.avatarUrl.includes("dicebear.com")) {
      await deleteFile(user.avatarUrl);
    }

    // 更新用户头像 URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: result.url },
    });

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return NextResponse.json(
      { error: "上传头像失败" },
      { status: 500 }
    );
  }
}
