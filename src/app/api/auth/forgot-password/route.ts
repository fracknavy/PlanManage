import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // 即使用户不存在也返回成功（防止邮箱枚举攻击）
    if (!user) {
      return NextResponse.json({
        message: "如果该邮箱已注册，您将收到密码重置邮件",
      });
    }

    // 生成重置 token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小时后过期

    // 保存 token
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: validatedData.email,
        expiresAt,
      },
    });

    // TODO: 发送重置邮件
    // 在实际应用中，这里应该发送邮件
    // await sendResetEmail(validatedData.email, token);

    console.log(`Password reset token for ${validatedData.email}: ${token}`);

    return NextResponse.json({
      message: "如果该邮箱已注册，您将收到密码重置邮件",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);

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
