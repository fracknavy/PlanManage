import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError } from "@/lib/api-utils";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token不能为空"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // 查找有效的 token
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token: validatedData.token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "无效或已过期的验证链接" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 如果已经验证过
    if (user.emailVerified) {
      return NextResponse.json({
        message: "邮箱已验证，请直接登录",
      });
    }

    // 更新用户邮箱验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // 标记 token 为已使用
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: "邮箱验证成功，请登录",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
