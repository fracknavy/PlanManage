# PlanManage 开发者文档

## 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [开发环境搭建](#开发环境搭建)
5. [开发指南](#开发指南)
6. [测试](#测试)
7. [部署](#部署)
8. [贡献指南](#贡献指南)
9. [代码规范](#代码规范)
10. [常见问题](#常见问题)

---

## 项目概述

PlanManage 是一个智能计划与时间表管理 Web 应用，旨在帮助用户高效管理时间和任务。

### 核心功能

- 任务管理（CRUD、子任务、重复任务）
- 智能排程（权重、优先级、截止时间）
- 时间表（拖拽排序、冲突检测）
- 链接解析（自动提取网页信息）

### 设计原则

- **用户体验优先**: 简洁直观的界面设计
- **性能优化**: 快速响应和流畅交互
- **可扩展性**: 模块化架构，易于扩展
- **安全性**: 数据加密和权限控制

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.x | React 框架 |
| React | 18.x | UI 库 |
| TypeScript | 5.x | 类型系统 |
| Tailwind CSS | 3.x | 样式框架 |
| shadcn/ui | - | UI 组件库 |
| dnd-kit | 6.x | 拖拽库 |
| next-themes | - | 主题切换 |
| next-intl | - | 国际化 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js API Routes | 14.x | API 框架 |
| Prisma | 5.x | ORM |
| PostgreSQL | 14+ | 数据库 |
| NextAuth.js | 4.x | 认证 |
| Zod | 3.x | 数据验证 |
| bcrypt | 5.x | 密码加密 |
| rrule | 2.x | 重复任务 |

### 开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| ESLint | 8.x | 代码检查 |
| Prettier | 3.x | 代码格式化 |
| Vitest | 1.x | 单元测试 |
| Playwright | 1.x | E2E 测试 |
| Husky | 9.x | Git Hooks |
| GitHub Actions | - | CI/CD |

---

## 项目结构

```
PlanManage/
├── .github/                    # GitHub 配置
│   └── workflows/              # GitHub Actions
├── docs/                       # 文档
│   ├── api/                    # API 文档
│   ├── developer/              # 开发者文档
│   └── user-guide/             # 用户手册
├── prisma/                     # Prisma 配置
│   ├── schema.prisma           # 数据库 Schema
│   └── migrations/             # 数据库迁移
├── public/                     # 静态资源
│   ├── icons/                  # 图标
│   ├── manifest.json           # PWA 配置
│   └── sw.js                   # Service Worker
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 认证相关页面
│   │   ├── api/                # API 路由
│   │   ├── dashboard/          # 仪表盘
│   │   ├── tasks/              # 任务页面
│   │   ├── schedule/           # 时间表页面
│   │   ├── links/              # 链接解析页面
│   │   ├── settings/           # 设置页面
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页
│   ├── components/             # React 组件
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── layout/             # 布局组件
│   │   ├── tasks/              # 任务组件
│   │   ├── schedule/           # 时间表组件
│   │   └── providers/          # Context Providers
│   ├── hooks/                  # 自定义 Hooks
│   ├── lib/                    # 工具函数
│   │   ├── auth.ts             # 认证工具
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── scheduler.ts        # 排程算法
│   │   ├── utils.ts            # 通用工具
│   │   ├── api-utils.ts        # API 工具
│   │   ├── cache.ts            # 缓存工具
│   │   ├── security.ts         # 安全工具
│   │   ├── monitoring.ts       # 监控工具
│   │   └── ...                 # 其他工具
│   ├── test/                   # 测试配置
│   ├── types/                  # TypeScript 类型
│   └── validators/             # Zod 验证
├── .eslintrc.json              # ESLint 配置
├── .prettierrc                 # Prettier 配置
├── .gitignore                  # Git 忽略
├── docker-compose.yml          # Docker 配置
├── Dockerfile                  # Docker 镜像
├── next.config.js              # Next.js 配置
├── package.json                # 依赖配置
├── tailwind.config.ts          # Tailwind 配置
├── tsconfig.json               # TypeScript 配置
└── vitest.config.ts            # Vitest 配置
```

---

## 开发环境搭建

### 前置要求

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/your-username/PlanManage.git
cd PlanManage
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：

```env
# 数据库
DATABASE_URL=postgresql://postgres:password@localhost:5432/planmanage

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. **初始化数据库**

```bash
npx prisma generate
npx prisma db push
```

5. **启动开发服务器**

```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 http://localhost:3000

---

## 开发指南

### 创建新页面

1. 在 `src/app/` 目录下创建新文件夹
2. 添加 `page.tsx` 文件
3. 使用 `AuthenticatedLayout` 包装页面内容

```tsx
"use client";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function NewPage() {
  return (
    <AuthenticatedLayout>
      <div>
        <h1>新页面</h1>
      </div>
    </AuthenticatedLayout>
  );
}
```

### 创建新 API

1. 在 `src/app/api/` 目录下创建新文件夹
2. 添加 `route.ts` 文件
3. 导出 HTTP 方法处理函数

```tsx
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 业务逻辑

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
```

### 创建新组件

1. 在 `src/components/` 目录下创建新文件
2. 使用 TypeScript 定义 Props 类型
3. 导出组件

```tsx
"use client";

interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### 创建新 Hook

1. 在 `src/hooks/` 目录下创建新文件
2. 以 `use` 开头命名
3. 导出 Hook

```tsx
"use client";

import { useState, useEffect } from "react";

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // 副作用逻辑
  }, [value]);

  return { value, setValue };
}
```

### 修改数据库 Schema

1. 编辑 `prisma/schema.prisma` 文件
2. 运行迁移命令

```bash
npx prisma migrate dev --name <migration_name>
```

3. 重新生成 Prisma Client

```bash
npx prisma generate
```

---

## 测试

### 单元测试

使用 Vitest 运行单元测试：

```bash
# 运行所有测试
npm run test

# 运行测试并监听变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 编写测试

在 `src/lib/__tests__/` 或 `src/components/__tests__/` 目录下创建测试文件：

```tsx
import { describe, it, expect } from "vitest";
import { myFunction } from "../my-module";

describe("myFunction", () => {
  it("should return expected result", () => {
    const result = myFunction("input");
    expect(result).toBe("expected");
  });

  it("should handle edge cases", () => {
    expect(myFunction("")).toBe("");
    expect(myFunction(null)).toBe(null);
  });
});
```

### E2E 测试

使用 Playwright 运行 E2E 测试：

```bash
# 安装 Playwright 浏览器
npx playwright install

# 运行 E2E 测试
npx playwright test

# 运行 E2E 测试并显示浏览器
npx playwright test --headed
```

### 编写 E2E 测试

在 `e2e/` 目录下创建测试文件：

```tsx
import { test, expect } from "@playwright/test";

test("should login successfully", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
});
```

---

## 部署

### Vercel 部署

1. Fork 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### Docker 部署

1. **构建镜像**

```bash
docker build -t planmanage .
```

2. **运行容器**

```bash
docker-compose up -d
```

3. **查看日志**

```bash
docker-compose logs -f
```

### 手动部署

1. **构建项目**

```bash
npm run build
```

2. **启动生产服务器**

```bash
npm run start
```

---

## 贡献指南

### 如何贡献

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交规范

使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(tasks): 添加子任务功能

- 支持创建子任务
- 支持子任务进度显示
- 支持子任务拖拽排序

Closes #123
```

### Pull Request 规范

1. 确保所有测试通过
2. 确保代码符合规范
3. 添加必要的测试
4. 更新相关文档
5. 描述清楚做了什么改动

### 代码审查

所有 PR 都需要经过代码审查：

1. 至少一个维护者批准
2. 所有 CI 检查通过
3. 没有合并冲突

---

## 代码规范

### 命名规范

- **组件**: PascalCase (`TaskCard`)
- **函数**: camelCase (`fetchTasks`)
- **文件**: kebab-case (`use-tasks.ts`)
- **常量**: UPPER_SNAKE_CASE (`MAX_TASKS`)
- **接口**: PascalCase，以 `I` 开头（可选）(`ITask`)
- **类型**: PascalCase (`TaskStatus`)
- **枚举**: PascalCase (`Priority`)

### 文件组织

- 每个文件只导出一个主要功能
- 相关文件放在同一目录
- 使用 `index.ts` 统一导出

### 代码风格

- 使用 TypeScript 严格模式
- 避免使用 `any` 类型
- 使用可选链 `?.` 和空值合并 `??`
- 使用解构赋值
- 使用模板字符串

### 注释规范

- 复杂逻辑添加注释
- 公共 API 添加 JSDoc 注释
- 避免无意义的注释

```tsx
/**
 * 计算任务优先级分数
 * @param task 任务对象
 * @returns 优先级分数 (0-100)
 */
function calculatePriorityScore(task: Task): number {
  // 实现逻辑
}
```

---

## 常见问题

### Q: 如何重置数据库？

A:
```bash
npx prisma migrate reset
```

### Q: 如何查看数据库数据？

A:
```bash
npx prisma studio
```

### Q: 如何更新依赖？

A:
```bash
npm update
```

### Q: 如何解决类型错误？

A:
1. 运行 `npx prisma generate` 重新生成 Prisma Client
2. 运行 `npm run type-check` 检查类型错误
3. 参考错误信息修复

### Q: 如何调试 API？

A:
1. 使用浏览器开发者工具的 Network 面板
2. 使用 Postman 或 Insomnia
3. 添加 `console.log` 调试

### Q: 如何添加新的 shadcn/ui 组件？

A:
```bash
npx shadcn-ui@latest add <component-name>
```

---

## 资源链接

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [NextAuth.js 文档](https://next-auth.js.org/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [dnd-kit 文档](https://dndkit.com/)

---

*最后更新: 2024-06-13*
*版本: v0.3.0*
