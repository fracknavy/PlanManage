# PlanManage API 文档

## 概述

PlanManage API 是一个 RESTful API，用于管理任务、时间表、链接解析等功能。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (NextAuth.js)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

所有需要认证的 API 都需要在请求头中包含有效的 session token。

```http
Cookie: next-auth.session-token=<session_token>
```

## 错误处理

API 使用标准 HTTP 状态码，并返回统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误信息",
  "details": []
}
```

### 常见状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## API 端点

### 认证相关

#### POST /api/auth/register

注册新用户

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "用户名"
  }
}
```

#### POST /api/auth/forgot-password

忘记密码

**请求体:**
```json
{
  "email": "user@example.com"
}
```

**响应:**
```json
{
  "message": "如果该邮箱已注册，您将收到密码重置邮件"
}
```

#### POST /api/auth/reset-password

重置密码

**请求体:**
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

**响应:**
```json
{
  "message": "密码重置成功，请使用新密码登录"
}
```

#### POST /api/auth/verify-email

验证邮箱

**请求体:**
```json
{
  "token": "verification_token"
}
```

**响应:**
```json
{
  "message": "邮箱验证成功，请登录"
}
```

### 任务相关

#### GET /api/tasks

获取任务列表

**查询参数:**
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 20
- `status` (可选): 任务状态筛选
- `priority` (可选): 优先级筛选
- `type` (可选): 任务类型筛选
- `search` (可选): 搜索关键词

**响应:**
```json
{
  "data": [
    {
      "id": "task_id",
      "title": "任务标题",
      "description": "任务描述",
      "status": "NOT_STARTED",
      "priority": "MEDIUM",
      "type": "WORK",
      "estimatedTime": 30,
      "weight": 5,
      "dueDate": "2024-06-15T00:00:00.000Z",
      "isFixed": false,
      "isRecurring": false,
      "children": [],
      "createdAt": "2024-06-13T00:00:00.000Z",
      "updatedAt": "2024-06-13T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### POST /api/tasks

创建任务

**请求体:**
```json
{
  "title": "任务标题",
  "description": "任务描述",
  "estimatedTime": 30,
  "weight": 5,
  "priority": "MEDIUM",
  "type": "WORK",
  "dueDate": "2024-06-15T00:00:00.000Z",
  "isFixed": false,
  "isRecurring": false,
  "parentId": null
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "new_task_id",
    "title": "任务标题",
    ...
  }
}
```

#### GET /api/tasks/[id]

获取单个任务

**路径参数:**
- `id`: 任务 ID

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "任务标题",
    ...
  }
}
```

#### PATCH /api/tasks/[id]

更新任务

**请求体:**
```json
{
  "title": "更新后的标题",
  "status": "IN_PROGRESS"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "更新后的标题",
    ...
  }
}
```

#### DELETE /api/tasks/[id]

删除任务

**响应:**
```json
{
  "success": true,
  "message": "任务已删除"
}
```

#### POST /api/tasks/[id]/complete

完成任务

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "status": "COMPLETED",
    ...
  }
}
```

### 时间表相关

#### GET /api/schedule

获取时间表

**查询参数:**
- `date` (可选): 日期，默认今天
- `view` (可选): 视图类型 (day/week)

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "schedule_id",
    "date": "2024-06-13",
    "items": [
      {
        "id": "item_id",
        "startTime": "2024-06-13T09:00:00.000Z",
        "endTime": "2024-06-13T10:00:00.000Z",
        "isBreak": false,
        "task": {
          "id": "task_id",
          "title": "任务标题"
        }
      }
    ]
  }
}
```

#### POST /api/schedule

生成时间表

**请求体:**
```json
{
  "date": "2024-06-13"
}
```

**响应:**
```json
{
  "success": true,
  "message": "时间表已生成"
}
```

### 链接解析相关

#### POST /api/links/parse

解析链接

**请求体:**
```json
{
  "url": "https://example.com"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "页面标题",
    "description": "页面描述",
    "image": "https://example.com/image.jpg",
    "favicon": "https://example.com/favicon.ico"
  }
}
```

### 标签相关

#### GET /api/tags

获取所有标签

**响应:**
```json
[
  {
    "id": "tag_id",
    "name": "标签名称",
    "color": "#3b82f6",
    "_count": {
      "tasks": 5
    }
  }
]
```

#### POST /api/tags

创建标签

**请求体:**
```json
{
  "name": "标签名称",
  "color": "#3b82f6"
}
```

**响应:**
```json
{
  "id": "tag_id",
  "name": "标签名称",
  "color": "#3b82f6"
}
```

### 设置相关

#### GET /api/settings

获取用户设置

**响应:**
```json
{
  "id": "user_id",
  "defaultWorkStartTime": "09:00",
  "defaultWorkEndTime": "18:00",
  "defaultBreakDuration": 15,
  "defaultTaskWeight": 5
}
```

#### PATCH /api/settings

更新用户设置

**请求体:**
```json
{
  "defaultWorkStartTime": "08:00",
  "defaultWorkEndTime": "17:00",
  "defaultBreakDuration": 10,
  "defaultTaskWeight": 7
}
```

**响应:**
```json
{
  "success": true,
  "message": "设置已保存"
}
```

### 导出相关

#### GET /api/export

导出数据

**查询参数:**
- `format` (可选): 导出格式 (json/csv)，默认 json
- `type` (可选): 导出类型 (tasks/schedule)，默认 tasks
- `date` (可选): 时间表日期，默认今天

**响应:**
- JSON 格式: 返回 JSON 数据
- CSV 格式: 返回 CSV 文件下载

### 健康检查

#### GET /api/health

健康检查

**响应:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-13T00:00:00.000Z",
  "version": "0.3.0",
  "environment": "development",
  "services": {
    "database": {
      "status": "connected",
      "latency": 5
    }
  },
  "uptime": 3600
}
```

## 速率限制

API 实施了速率限制，以防止滥用：

- **认证相关**: 15 分钟内最多 5 次请求
- **API 通用**: 1 分钟内最多 100 次请求
- **链接解析**: 1 分钟内最多 10 次请求

当超过速率限制时，API 将返回 429 状态码，并在响应头中包含：

- `X-RateLimit-Limit`: 限制次数
- `X-RateLimit-Remaining`: 剩余次数
- `X-RateLimit-Reset`: 重置时间
- `Retry-After`: 重试等待时间（秒）

## 分页

支持分页的 API 使用以下查询参数：

- `page`: 页码（从 1 开始）
- `limit`: 每页数量（最大 100）

响应中的分页信息：

```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数验证失败 |
| 1002 | 用户已存在 |
| 1003 | 邮箱或密码错误 |
| 1004 | 任务不存在 |
| 1005 | 时间表不存在 |
| 1006 | 链接解析失败 |
| 1007 | 标签已存在 |
| 1008 | 团队不存在 |
| 1009 | 权限不足 |
| 1010 | 文件上传失败 |

## 更新日志

### v0.3.0 (2024-06-13)
- 添加企业级优化
- 添加完整的 API 文档
- 添加速率限制
- 添加安全增强

### v0.2.0 (2024-06-13)
- 实现子任务功能
- 实现重复任务
- 实现休息时间管理

### v0.1.0 (2024-06-12)
- 初始版本
- 基础功能实现

---

*最后更新: 2024-06-13*
