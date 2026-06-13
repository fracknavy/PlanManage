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
- ✅ 子任务功能
- ✅ 重复任务
- ✅ 休息时间管理（跳过、倒计时）

### 待实现（企业级优化）
- ❌ 冲突检测 UI
- ❌ Dashboard 统计图表
- ❌ 数据导出
- ❌ 暗色模式
- ❌ 通知系统

---

## 🏢 企业级优化路线图

### P0 - 必须修复（安全与正确性）

| 序号 | 优化项 | 说明 | 状态 |
|------|--------|------|------|
| 1 | 环境变量安全 | 移除 .env 敏感信息泄露，完善 .gitignore | ⏳ |
| 2 | 用户设置硬编码 | authenticated-layout.tsx 中用户配置应从 API 获取 | ⏳ |
| 3 | 数据库迁移管理 | 添加 prisma migrate 版本控制 | ⏳ |

### P1 - 应该优化（架构与质量）

| 序号 | 优化项 | 说明 | 状态 |
|------|--------|------|------|
| 4 | API 认证中间件 | 抽取重复的认证检查代码 | ⏳ |
| 5 | React ErrorBoundary | 添加错误边界组件，防止白屏 | ⏳ |
| 6 | ESLint + Prettier | 添加代码规范强制配置 | ⏳ |
| 7 | 乐观更新 | 任务状态切换、拖拽排序先更新 UI | ⏳ |
| 8 | 清理未使用代码 | 移除未使用的 Supabase 集成和依赖 | ⏳ |

### P2 - 建议改进（功能与体验）

| 序号 | 优化项 | 说明 | 状态 |
|------|--------|------|------|
| 9 | 测试体系 | 添加单元测试和 E2E 测试 | ⏳ |
| 10 | 深色模式 | 实现主题切换功能 | ⏳ |
| 11 | API 速率限制 | 防止 API 滥用 | ⏳ |
| 12 | 任务列表分页 | 支持大量任务的分页加载 | ⏳ |
| 13 | CI/CD 配置 | 添加 GitHub Actions 自动化 | ⏳ |
| 14 | 生产环境优化 | Docker 支持、standalone 模式 | ⏳ |

### P3 - 高级功能（扩展与国际化）

| 序号 | 优化项 | 说明 | 状态 |
|------|--------|------|------|
| 15 | 国际化（i18n） | 支持中英文切换 | ⏳ |
| 16 | SEO 优化 | sitemap、robots.txt、Open Graph | ⏳ |
| 17 | 无障碍（a11y） | WCAG 2.1 AA 合规 | ⏳ |
| 18 | WebSocket 实时同步 | 多标签页/多人协作 | ⏳ |
| 19 | 数据导出/备份 | CSV、JSON、iCal 格式导出 | ⏳ |
| 20 | 协作功能 | 任务分享、团队日程 | ⏳ |

### P4 - 长期规划（产品化）

| 序号 | 优化项 | 说明 | 状态 |
|------|--------|------|------|
| 21 | 邮箱验证 | 注册邮箱确认流程 | ⏳ |
| 22 | 密码重置 | 忘记密码功能 | ⏳ |
| 23 | 审计日志 | 操作记录追踪 | ⏳ |
| 24 | 用户头像上传 | 头像存储与显示 | ⏳ |
| 25 | 自定义标签 | 任务标签/分类系统 | ⏳ |
| 26 | PWA 支持 | 离线访问、安装到桌面 | ⏳ |
| 27 | 移动端手势 | 滑动操作、长按菜单 | ⏳ |

---

## 📊 代码质量评估

### 优点
- ✅ 代码结构清晰，按功能模块组织
- ✅ API 路由均包含认证检查
- ✅ 数据所有权校验完备
- ✅ Zod 验证覆盖所有输入端点
- ✅ Prisma schema 设计合理，含适当索引
- ✅ 工具函数复用性好

### 待改进
- ⚠️ API 路由中大量重复的认证检查代码
- ⚠️ `use-tasks.ts` hook 未被实际使用
- ⚠️ 链接解析中的特殊处理耦合在 route handler 中
- ⚠️ 无单元测试
- ⚠️ Supabase 客户端初始化存在但未被使用

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

# 代码检查
npm run lint

# 测试（待配置）
npm run test

# Docker（待配置）
docker-compose up -d
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
| 错误边界 | `src/components/error-boundary.tsx`（待创建） |
| 测试 | `__tests__/`（待创建） |

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
| 重复任务 | rrule |
| 测试 | Vitest + Playwright（待配置） |
| CI/CD | GitHub Actions（待配置） |
| 容器化 | Docker（待配置） |

---

## 🔧 代码规范

- 组件: PascalCase (`TaskCard`)
- 函数: camelCase (`fetchTasks`)
- 文件: kebab-case (`use-tasks.ts`)
- 常量: UPPER_SNAKE_CASE (`MAX_TASKS`)
- 测试文件: `*.test.ts` 或 `*.spec.ts`

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

*版本: v0.3.0 | 更新: 2024-06-13*
