# PlanManage Skill 文档

## 📌 项目定位

智能计划与时间表管理 Web 应用，核心功能：
- 任务管理（CRUD、子任务、重复任务）
- 智能排程（权重、优先级、截止时间）
- 时间表（拖拽排序、冲突检测）
- 链接解析（自动提取网页信息）

---

## 🎯 当前状态

### 已完成
- ✅ 基础架构（Next.js + Prisma + shadcn/ui）
- ✅ 认证系统（登录、注册、路由保护）
- ✅ 任务 CRUD
- ✅ 时间表基础功能
- ✅ 链接解析
- ✅ 自动排程算法
- ✅ 拖拽排序

### 未完成
- ✅ 子任务功能
- ✅ 重复任务
- ✅ 休息时间管理（跳过、倒计时）
- ❌ 冲突检测 UI
- ❌ Dashboard 统计图表
- ❌ 数据导出
- ❌ 暗色模式
- ❌ 通知系统

---

## ⚠️ 开发限制

| 类别 | 限制 |
|------|------|
| Node.js | >= 18.0.0 |
| PostgreSQL | >= 14.0 |
| 任务层级 | 仅一级子任务 |
| 重复任务 | 简单 RRULE（每日、每周、每月） |
| 排程范围 | 仅当天 |
| 链接解析 | 仅公开网页 |
| 并发用户 | < 100 |

---

## 🚀 快速命令

```bash
# 安装
npm install

# 数据库
npx prisma generate && npx prisma db push

# 开发
npm run dev

# 构建
npm run build

# 类型检查
npx tsc --noEmit
```

---

## 📁 关键路径

| 功能 | 路径 |
|------|------|
| 排程算法 | `src/lib/scheduler.ts` |
| 认证 | `src/app/api/auth/[...nextauth]/route.ts` |
| 任务 API | `src/app/api/tasks/` |
| 时间表 API | `src/app/api/schedule/` |
| 链接解析 | `src/app/api/links/parse/route.ts` |
| UI 组件 | `src/components/ui/` |

---

## 🎨 技术栈

| 用途 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS + shadcn/ui |
| 拖拽 | dnd-kit |
| 数据库 | PostgreSQL + Prisma |
| 认证 | NextAuth.js |
| 验证 | Zod |

---

## 📋 开发优先级

### P0 - 核心功能
1. 子任务功能
2. 重复任务
3. 休息时间管理

### P1 - 用户体验
4. 权重可视化
5. 统计图表
6. 冲突检测 UI

### P2 - 功能扩展
7. 数据导出
8. 暗色模式
9. 通知系统

### P3 - 高级功能
10. 协作功能
11. 国际化
12. PWA

---

## 🔧 代码规范

- 组件: PascalCase (`TaskCard`)
- 函数: camelCase (`fetchTasks`)
- 文件: kebab-case (`use-tasks.ts`)
- 常量: UPPER_SNAKE_CASE (`MAX_TASKS`)

---

## 📖 详细文档

- [项目状态](./PROJECT_STATUS.md) - 完整功能清单
- [开发指南](./DEVELOPMENT_GUIDE.md) - 开发规范详解
- [README](./README.md) - 项目介绍

---

## 🔨 修复记录

### 2024-06-13

#### 功能实现 1: 子任务功能
- **功能**: 子任务创建、编辑、显示和进度汇总
- **实现**:
  - 创建 `src/components/tasks/subtask-list.tsx` 子任务组件
  - 更新任务创建页面，支持选择父任务
  - 更新任务编辑页面，显示子任务列表
  - 更新任务列表页面，显示子任务层级和进度

#### 功能实现 2: 重复任务
- **功能**: 重复任务创建、编辑和自动生成
- **实现**:
  - 创建 `src/lib/recurrence.ts` RRULE 解析工具
  - 创建 `src/app/api/tasks/recurring/route.ts` 重复任务生成 API
  - 更新任务创建/编辑页面，添加重复任务设置 UI
  - 支持每日、每周、每月重复频率

#### 功能实现 3: 休息时间管理
- **功能**: 跳过休息、休息倒计时、休息结束通知
- **实现**:
  - 创建 `src/components/schedule/break-timer.tsx` 休息计时器组件
  - 更新时间表页面，集成休息时间管理
  - 添加跳过休息功能
  - 支持浏览器通知提醒

---

### 2024-06-12

#### 修复 1: 缺失依赖
- **问题**: `Module not found: Can't resolve 'next-auth/react'`
- **原因**: package.json 缺少 `next-auth` 和 `bcrypt` 依赖
- **解决**: 添加依赖并安装
  ```bash
  npm install next-auth bcrypt @types/bcrypt --save
  ```

#### 修复 2: TypeScript 类型错误
- **问题**: `session.user.id` 类型不存在
- **原因**: NextAuth 默认 session 类型不包含 `id` 字段
- **解决**: 创建 `src/types/next-auth.d.ts` 扩展类型

#### 修复 3: Next.js 路由导出限制
- **问题**: `authOptions` 导出导致类型错误
- **原因**: Next.js 路由文件只能导出 HTTP 方法
- **解决**: 将 `authOptions` 移至 `src/lib/auth-options.ts`

#### 修复 4: 缺失导入
- **问题**: `RefreshCw` 和 `ListTodo` 未导入
- **原因**: 组件使用但未导入
- **解决**: 添加缺失的导入语句

---

*版本: v0.2.0 | 更新: 2024-06-13*
