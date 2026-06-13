import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";
import { handleApiError } from "@/lib/api-utils";

const teamSchema = z.object({
  name: z.string().min(1, "团队名称不能为空").max(100, "团队名称不能超过100个字符"),
  description: z.string().max(500, "团队描述不能超过500个字符").optional(),
});

// 获取用户的所有团队
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取用户拥有的团队
    const ownedTeams = await prisma.team.findMany({
      where: { ownerId: session.user.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            sharedTasks: true,
          },
        },
      },
    });

    // 获取用户加入的团队
    const memberTeams = await prisma.teamMember.findMany({
      where: { userId: session.user.id },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: true,
                sharedTasks: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ownedTeams,
      memberTeams: memberTeams.map((mt) => ({
        ...mt.team,
        role: mt.role,
        joinedAt: mt.joinedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 创建团队
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = teamSchema.parse(body);

    // 创建团队
    const team = await prisma.team.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
