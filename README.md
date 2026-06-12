# PlanManage - 智能计划与时间表管理

一个基于 Next.js 的智能任务规划和时间表管理 Web 应用。

## 功能特性

- 🔐 **用户管理** - 注册、登录、退出登录
- 📋 **任务管理** - 创建、编辑、删除任务
- 🔗 **链接解析** - 自动解析网页标题、描述、封面图
- 📅 **时间表** - 今日视图和周视图
- 🖱️ **拖拽排序** - 使用 dnd-kit 实现任务拖拽
- ⚖️ **权重排程** - 根据任务权重自动排程
- ☕ **休息管理** - 完成任务后自动插入休息时间

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **拖拽**: dnd-kit
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL, Prisma
- **认证**: NextAuth.js
- **验证**: Zod

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入以下配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/plan_manage

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 或者使用迁移
npx prisma migrate dev
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── (auth)/           # 认证相关页面
│   │   ├── login/
│   │   └── register/
│   ├── api/              # API 路由
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── schedule/
│   │   ├── links/
│   │   └── settings/
│   ├── dashboard/        # Dashboard 首页
│   ├── tasks/            # 任务管理页
│   ├── schedule/         # 时间表页
│   ├── links/            # 链接解析页
│   └── settings/         # 设置页
├── components/
│   ├── layout/           # 布局组件
│   ├── providers/        # Context Providers
│   └── ui/               # shadcn/ui 组件
├── lib/
│   ├── prisma.ts         # Prisma 客户端
│   ├── supabase.ts       # Supabase 客户端
│   ├── scheduler.ts      # 自动排程算法
│   └── utils.ts          # 工具函数
├── types/                # TypeScript 类型定义
└── validators/           # Zod 验证 schemas
```

## 自动排程算法

系统使用以下因素计算任务优先级分数：

1. **权重分数** (0-100): 权重 × 10
2. **优先级分数**: 紧急 40, 高 30, 中 20, 低 10
3. **截止时间紧迫度** (0-50): 根据距离截止时间的小时数
4. **预计耗时权重**: 短任务更容易安排

排程规则：
- 固定任务优先安排
- 高权重任务优先
- 冲突时低权重任务后移
- 连续任务之间自动插入休息时间

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/[...nextauth]` - 登录

### 任务
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/[id]` - 获取单个任务
- `PATCH /api/tasks/[id]` - 更新任务
- `DELETE /api/tasks/[id]` - 删除任务
- `POST /api/tasks/[id]/complete` - 完成任务

### 时间表
- `GET /api/schedule` - 获取时间表
- `POST /api/schedule` - 自动生成时间表
- `PATCH /api/schedule/items/[id]` - 更新日程项

### 链接
- `GET /api/links` - 获取解析历史
- `POST /api/links/parse` - 解析链接

### 设置
- `GET /api/settings` - 获取设置
- `PATCH /api/settings` - 更新设置

## 许可证

MIT
