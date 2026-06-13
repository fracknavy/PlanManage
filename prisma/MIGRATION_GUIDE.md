# Prisma 数据库迁移指南

## 概述

本项目使用 Prisma 进行数据库管理和迁移。迁移文件存储在 `prisma/migrations/` 目录中，并纳入版本控制，以确保数据库结构的一致性。

## 迁移工作流

### 1. 开发环境

在开发环境中，当你修改了 `prisma/schema.prisma` 文件后，需要创建新的迁移：

```bash
# 创建迁移（推荐使用描述性名称）
npx prisma migrate dev --name <migration_name>

# 示例
npx prisma migrate dev --name add_user_avatar
npx prisma migrate dev --name create_audit_log_table
```

这个命令会：
- 检测 schema 变化
- 生成 SQL 迁移文件
- 应用迁移到数据库
- 重新生成 Prisma Client

### 2. 生产环境

在生产环境中，使用 `migrate deploy` 命令应用迁移：

```bash
# 应用所有待执行的迁移
npx prisma migrate deploy
```

这个命令会：
- 检查 `prisma/migrations/` 目录
- 应用所有未执行的迁移
- 不会生成新的迁移文件

### 3. 重置数据库

如果需要重置数据库（仅在开发环境）：

```bash
# 重置数据库并重新应用所有迁移
npx prisma migrate reset

# 或者手动操作
npx prisma db push --force-reset
```

## 迁移文件结构

```
prisma/
├── schema.prisma              # 数据库 Schema
├── migrations/                # 迁移文件目录（版本控制）
│   ├── 20240612000000_init/   # 初始迁移
│   │   └── migration.sql
│   ├── 20240613000000_add_subtasks/
│   │   └── migration.sql
│   └── migration_lock.toml    # 迁移锁文件
└── MIGRATION_GUIDE.md         # 本文件
```

## 最佳实践

### 1. 迁移命名规范

使用小写字母和下划线，描述性命名：

```bash
# ✅ 好的命名
npx prisma migrate dev --name add_user_avatar_url
npx prisma migrate dev --name create_audit_log_table
npx prisma migrate dev --name add_task_tags_relation

# ❌ 不好的命名
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name test
```

### 2. 迁移内容审查

在提交迁移之前，检查生成的 SQL 文件：

```bash
# 查看迁移文件
cat prisma/migrations/<timestamp>_<name>/migration.sql
```

确保：
- SQL 语句正确
- 没有意外的数据丢失
- 索引创建合理
- 外键约束正确

### 3. 数据迁移

如果需要在迁移中包含数据操作：

```sql
-- 在 migration.sql 中添加数据迁移
-- 示例：为现有用户设置默认头像
UPDATE "User" 
SET "avatarUrl" = '/avatars/default.png' 
WHERE "avatarUrl" IS NULL;
```

### 4. 回滚策略

Prisma 不直接支持迁移回滚。如果需要回滚：

1. **开发环境**：使用 `npx prisma migrate reset` 重置数据库
2. **生产环境**：手动创建新的迁移来撤销变更

```bash
# 创建撤销迁移
npx prisma migrate dev --name revert_add_user_avatar
```

然后手动编辑生成的 SQL 文件。

## 常见问题

### 1. 迁移冲突

如果多人同时修改 schema：

```bash
# 拉取最新代码
git pull

# 重新生成迁移
npx prisma migrate dev
```

### 2. 数据库连接问题

```bash
# 检查数据库连接
npx prisma db pull

# 验证 schema
npx prisma validate
```

### 3. 迁移历史不一致

```bash
# 查看迁移状态
npx prisma migrate status

# 标记迁移为已应用（谨慎使用）
npx prisma migrate resolve --applied <migration_name>
```

## 部署检查清单

部署前确保：

- [ ] 所有迁移文件已提交到版本控制
- [ ] 在测试环境验证迁移
- [ ] 备份生产数据库
- [ ] 检查迁移依赖关系
- [ ] 验证 Prisma Client 生成

## 相关命令

```bash
# 生成 Prisma Client
npx prisma generate

# 查看数据库结构
npx prisma db pull

# 验证 schema
npx prisma validate

# 打开 Prisma Studio
npx prisma studio

# 查看迁移状态
npx prisma migrate status
```

---

*最后更新: 2024-06-13*
