# Pre-Commit Check Skill

## Description
检查代码是否应该上传到 GitHub，清理临时文件并将本地文件加入 .gitignore。

## When to Use
- 在提交代码到 GitHub 之前
- 当用户说 "检查代码"、"准备上传"、"pre-commit" 时
- 当用户想要清理项目时

## Instructions

### 1. 检查并删除临时文件

删除以下类型的临时文件：

```bash
# 测试和覆盖率报告
rm -rf coverage/ test-results/ playwright-report/
rm -rf accessibility-report/ performance-report/
rm -rf complexity-report/ duplication-report/ dead-code-report/
rm -rf jscpd-report/ snyk-report/ gitleaks-report/
rm -rf checkov-report/ docker-bench-report/ trivy-report/
rm -rf lighthouse-report/ .lighthouseci/

# 构建分析
rm -rf .next/analyze/ bundle-analysis/

# 文档生成
rm -rf docs/api/ docs/components.json

# 日志文件
rm -f *.log npm-debug.log* yarn-debug.log* yarn-error.log*
rm -f outdated-report.json license-report.json

# 备份文件
rm -f *.bak *.backup *.sql
rm -f files-backup-*.tar.gz planmanage.tar

# 临时文件
rm -f *.tmp *.temp
rm -rf auto-backup-suite-* auto-test-suite-* auto-monitor-suite-* auto-notify-suite-*

# Claude 临时文件
rm -rf .claude/auto-*
```

### 2. 检查敏感文件

确保以下文件不存在或已被 .gitignore 忽略：

- `.env` / `.env.local` / `.env.*.local`
- `*.pem` (私钥文件)
- `node_modules/`
- `.vercel/`
- `*.db` / `*.sqlite` / `*.sqlite3`

如果这些文件存在且未被忽略，添加到 .gitignore。

### 3. 更新 .gitignore

检查 .gitignore 是否包含以下必要条目，如果缺少则添加：

```gitignore
# 临时文件
*.tmp
*.temp
coverage/
test-results/
playwright-report/
accessibility-report/
performance-report/
complexity-report/
duplication-report/
dead-code-report/
jscpd-report/
snyk-report/
gitleaks-report/
checkov-report/
docker-bench-report/
trivy-report/
lighthouse-report/
.lighthouseci/

# 构建分析
.next/analyze/
bundle-analysis/

# 文档生成
docs/api/
docs/components.json

# 日志
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
outdated-report.json
license-report.json

# 备份
*.bak
*.backup
*.sql
files-backup-*.tar.gz
planmanage.tar

# 自动生成的工作流套件
auto-backup-suite-*
auto-test-suite-*
auto-monitor-suite-*
auto-notify-suite-*
.github/workflows/auto-*-suite-v*.yml

# Claude 临时文件
.claude/auto-*

# 数据库文件
*.db
*.sqlite
*.sqlite3

# 敏感文件
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.pem
```

### 4. 检查大文件

检查是否有不应该提交的大文件：

```bash
# 查找大于 1MB 的文件（排除 node_modules 和 .git）
find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" | head -20
```

如果发现大文件，提醒用户是否应该添加到 .gitignore。

### 5. 检查 Git 状态

```bash
git status --short
```

显示当前修改状态，确认所有更改都是预期的。

### 6. 输出检查报告

最后输出一个简洁的检查报告：

```
✅ Pre-Commit Check Complete

📁 Temporary files cleaned: [数量]
📝 .gitignore updated: [是/否]
⚠️  Warnings: [数量或无]

Ready to commit!
```

## Example Usage

用户: "检查代码准备上传"
用户: "pre-commit check"
用户: "清理临时文件"
