import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: {
      status: "connected" | "disconnected";
      latency?: number;
    };
  };
  uptime: number;
}

export async function GET() {
  const startTime = Date.now();

  try {
    // 检查数据库连接
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const result: HealthCheckResult = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.3.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: "connected",
          latency: dbLatency,
        },
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    const result: HealthCheckResult = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.3.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: "disconnected",
        },
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(result, { status: 503 });
  }
}
