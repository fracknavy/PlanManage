import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token不能为空"),
  password: z.string().min(6, "密码至少6个字符"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // 查找有效的 token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: validatedData.token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "无效或已过期的重置链接" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 标记 token 为已使用
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: "密码重置成功，请使用新密码登录",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

    if (error.name === "ZodError") {
      const firstError = error.issues?.[0];
      const message = firstError?.message || "数据验证失败";
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "处理请求失败" },
      { status: 500 }
    );
  }
}
