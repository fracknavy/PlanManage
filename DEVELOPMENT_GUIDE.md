# PlanManage 开发指南

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm 或 yarn 或 pnpm

### 安装步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local

# 3. 初始化数据库
npx prisma generate
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

---

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── api/               # API 路由
│   ├── dashboard/         # Dashboard
│   ├── tasks/             # 任务管理
│   ├── schedule/          # 时间表
│   ├── links/             # 链接解析
│   └── settings/          # 设置
├── components/
│   ├── layout/            # 布局组件
│   ├── providers/         # Context Providers
│   └── ui/                # shadcn/ui 组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具函数
├── types/                 # TypeScript 类型
└── validators/            # Zod 验证
```

---

## 🛠️ 开发规范

### 1. 代码风格

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 shadcn/ui 组件库
- 使用 Tailwind CSS 样式

### 2. 命名规范

- **文件名**: kebab-case (如 `use-tasks.ts`)
- **组件名**: PascalCase (如 `TaskCard`)
- **函数名**: camelCase (如 `fetchTasks`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_TASKS`)

### 3. API 规范

- RESTful 风格
- 使用 Zod 验证输入
- 返回统一格式：
  ```typescript
  {
    success: boolean;
    data?: any;
    error?: string;
  }
  ```

### 4. 数据库规范

- 使用 Prisma ORM
- 遵循命名约定：
  - 表名: PascalCase (如 `Task`)
  - 字段名: camelCase (如 `createdAt`)
  - 关联字段: 外键 + 关系

---

## 🔑 关键功能实现

### 1. 自动排程算法

**文件**: `src/lib/scheduler.ts`

**算法逻辑**:
1. 固定任务优先安排
2. 计算综合分数：
   - 权重分数 (权重 × 10)
   - 优先级分数 (紧急 40, 高 30, 中 20, 低 10)
   - 截止时间紧迫度 (0-50)
   - 预计耗时权重
3. 按分数从高到低安排
4. 冲突时低权重任务后移
5. 连续任务之间插入休息时间

### 2. 拖拽排序

**文件**: `src/app/schedule/page.tsx`

**实现方式**:
- 使用 @dnd-kit/core 和 @dnd-kit/sortable
- 拖拽结束后更新本地状态
- 异步保存到数据库
- 失败时回滚

### 3. 认证系统

**文件**: `src/app/api/auth/[...nextauth]/route.ts`

**实现方式**:
- NextAuth.js + JWT
- Credentials Provider
- 路由中间件保护

---

## 📝 添加新功能

### 1. 添加新页面

```typescript
// src/app/new-page/page.tsx
"use client";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function NewPage() {
  return (
    <AuthenticatedLayout>
      {/* 页面内容 */}
    </AuthenticatedLayout>
  );
}
```

### 2. 添加新 API

```typescript
// src/app/api/new-api/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  
  // 业务逻辑
  
  return NextResponse.json({ data: "..." });
}
```

### 3. 添加新组件

```typescript
// src/components/new-component.tsx
"use client";

import { cn } from "@/lib/utils";

interface NewComponentProps {
  className?: string;
  // 其他 props
}

export function NewComponent({ className }: NewComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* 组件内容 */}
    </div>
  );
}
```

---

## 🧪 测试

### 运行测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

---

## 🚀 部署

### Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel
```

### Docker 部署

```bash
# 构建镜像
docker build -t planmanage .

# 运行容器
docker run -p 3000:3000 planmanage
```

---

## ⚠️ 注意事项

### 1. 环境变量

- `DATABASE_URL`: PostgreSQL 连接字符串
- `NEXTAUTH_SECRET`: 必须设置，用于 JWT 加密
- `NEXTAUTH_URL`: 应用 URL

### 2. 数据库

- 首次运行需执行 `npx prisma db push`
- 生产环境建议使用 `npx prisma migrate deploy`

### 3. 性能优化

- 大量任务时使用分页
- 使用 React.memo 优化组件
- 使用 useMemo/useCallback 优化计算

### 4. 安全

- 所有 API 需验证用户身份
- 敏感操作需二次确认
- 输入需使用 Zod 验证

---

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [dnd-kit 文档](https://dndkit.com)
- [NextAuth.js 文档](https://next-auth.js.org)

---

*最后更新: 2024*
