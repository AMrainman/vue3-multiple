---
name: dev-workflow
description: >
  Complete development workflow automation for GitHub projects using JS/TS with ESLint + Prettier.
  Use this skill whenever the user mentions: committing code, pushing to git, creating a branch,
  opening a Pull Request, running lint, fixing code style, staging files, writing commit messages,
  checking CI status, or any step in the git-based development cycle — even if they only mention
  one part of the workflow (e.g. "help me commit this" or "push my changes"). Always use this skill
  proactively when the user is working inside a git repo and wants to ship or review code.
compatibility:
  tools: [PowerShell]
  requires: [git, node, eslint, prettier, gh CLI or GitHub API token]
parameters:
  - name: auto
    description: '自动模式，跳过所有用户确认步骤，直接执行全部操作'
    default: false
  - name: skip-lint
    description: '跳过 lint 检查和修复步骤'
    default: false
  - name: skip-pr
    description: '推送后跳过创建 PR'
    default: false
---

# Dev Workflow Skill

自动化完整的 GitHub 开发流程：lint → fix → commit → push → Pull Request。

> 所有命令基于 **Windows PowerShell**。git 相关命令在 CMD 中同样适用，API 调用部分需使用 PowerShell。

## 使用方式

- **交互模式（默认）**：在每个关键步骤暂停，等待用户确认
- **自动模式（`auto: true`）**：跳过所有确认，一键执行完整流程

### 自动模式调用示例

当用户说 "直接帮我推代码"、"一键提交"、"快速走完流程" 时，使用 `auto: true` 参数：

```
skill: dev-workflow
auto: true
```

---

## 执行逻辑（自动模式 vs 交互模式）

| 步骤        | 交互模式       | 自动模式         |
| ----------- | -------------- | ---------------- |
| Lint 检查后 | 询问是否修复   | 直接执行 `--fix` |
| Commit 信息 | 展示供确认修改 | 直接提交         |
| Push 前     | 确认推送       | 直接推送         |
| 创建 PR 前  | 询问是否创建   | 直接创建 PR      |

---

## 完整流程概览

```md
1. 预检查 → 验证 git 仓库、工作区状态、当前分支
2. Lint & 格式检查 → ESLint 检查 + Prettier 检查
3. 自动修复 → eslint --fix + prettier --write
4. 暂存 & 提交 → git add，生成 Conventional Commit 信息
5. 推送 → git push（新分支自动设置 upstream）
6. 创建 Pull Request → 通过 GitHub API 创建 PR，自动生成描述
7. CI 状态监控（可选） → 轮询 Actions 状态并汇报结果
```

执行破坏性或不可逆操作（push、创建 PR）前，必须先与用户确认。

---

## 第 1 步 — 预检查

执行任何操作前，先验证环境：

```powershell
# 1. 是否在 git 仓库中？
git rev-parse --is-inside-work-tree

# 2. 当前分支名称
git branch --show-current

# 3. 是否有未暂存/已暂存的改动？
git status --short

# 4. 是否配置了远程仓库？
git remote -v

# 5. 检查是否存在 package.json（Node 项目标志）
if (Test-Path "package.json") { Write-Host "检测到 Node 项目" }
```

**判断逻辑：**

- 不在 git 仓库中 → 停止并告知用户
- 当前在 `main` 或 `master` 分支 → 警告用户，建议创建功能分支
- 没有任何改动 → 告知用户没有内容可提交
- 没有 `package.json` → 跳过 ESLint/Prettier 步骤，直接走纯 git 流程

---

## 第 2 步 — 分支管理

如果用户在 `main`/`master` 上，或需要新建功能分支：

```powershell
# 创建并切换到新分支
git checkout -b <分支名>
```

**分支命名规范：**

```
<类型>/<简短描述>
feat/add-login-page
fix/null-pointer-on-submit
chore/update-dependencies
refactor/extract-auth-service
```

---

## 第 3 步 — Lint 检查

先检查、后修复，让用户了解当前问题：

```powershell
# Prettier 格式检查（暂不写入）
npx prettier --check .

# ESLint 检查（暂不修复）
npx eslint . --ext .js,.jsx,.ts,.tsx
```

汇报摘要：

- 有 lint 错误的文件数量
- 有格式问题的文件数量
- 列出问题最多的文件

---

## 第 4 步 — 自动修复

**交互模式：** 询问用户："发现 X 个 lint 问题和 Y 个格式问题，是否自动修复？[Y/n]"

**自动模式：** 直接执行修复，仅输出摘要。

```powershell
# 修复 Prettier 格式
npx prettier --write .

# 修复 ESLint 问题
npx eslint . --ext .js,.jsx,.ts,.tsx --fix
```

**修复后：**

- 重新运行检查，确认错误清零
- 如果 --fix 后仍有 ESLint 错误（需手动修复），清晰展示并停止流程
- 有剩余 lint 错误时，不得继续提交

---

## 第 5 步 — 暂存文件

```powershell
# 展示将要暂存的改动
git diff --stat

# 暂存所有改动（默认行为）
git add .

# 若用户指定文件，则只暂存对应文件
git add <文件1> <文件2>
```

---

## 第 6 步 — 生成 Commit 信息

根据 diff 内容生成 Conventional Commit 格式的提交信息：

```powershell
# 获取已暂存的 diff 内容用于分析
git diff --cached --stat
git diff --cached -- . ':(exclude)*.lock' ':(exclude)package-lock.json'
```

**Conventional Commits 格式：**

```
<类型>(<范围>): <简短描述>

[可选正文]

[可选页脚]
```

**类型说明：**

| 类型       | 使用场景                        |
| ---------- | ------------------------------- |
| `feat`     | 新增功能                        |
| `fix`      | 修复 bug                        |
| `chore`    | 构建、依赖、工具链变更          |
| `refactor` | 代码重构（不影响功能）          |
| `style`    | 仅格式调整（通常来自 lint fix） |
| `test`     | 新增或修改测试                  |
| `docs`     | 仅文档变更                      |
| `perf`     | 性能优化                        |
| `ci`       | CI/CD 配置变更                  |

**流程：**

1. 分析已暂存的 diff
2. 提议一条 commit 信息
3. **交互模式：** 展示给用户，供其确认或修改
   **自动模式：** 直接使用生成的 commit 信息提交

```powershell
git commit -m "<类型>(<范围>): <描述>"
```

多行 commit 信息：

```powershell
git commit -m "<类型>(<范围>): <描述>" -m "<正文内容>"
```

---

## 第 7 步 — 推送到 GitHub

```powershell
# 推送到已有的 upstream
git push

# 新分支首次推送，自动设置 upstream
git push --set-upstream origin <分支名>
```

推送成功后，保存远程 URL 和分支名，供后续创建 PR 使用。

---

## 第 8 步 — 创建 Pull Request

完整的 GitHub API 说明请参阅 `references/github-pr.md`。

**快速摘要：**

```powershell
# 获取项目远程地址
git remote get-url origin
# 从 URL 中提取 owner/repo
# 例：git@github.com:myteam/myproject.git → myteam/myproject
```

调用 GitHub API 创建 PR（PowerShell 原生方式）：

```powershell
$headers = @{
    "Authorization" = "Bearer $env:GITHUB_TOKEN"
    "Content-Type"  = "application/json"
}
$body = @{
    head  = "<当前分支>"
    base  = "main"
    title = "<从 commit 信息自动生成>"
    body  = "<自动生成，见下方模板>"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
    -Uri "https://api.github.com/repos/<OWNER>/<REPO>/pulls" `
    -Headers $headers `
    -Body $body
```

**PR 标题：** 使用 commit 信息的第一行。

**PR 描述 — 自动生成模板：**

```markdown
## 这个 PR 做了什么？

<1-2 句话概括改动内容>

## 变更内容

<根据 git diff --stat 列出主要改动>

## 如何测试

<根据改动内容建议测试步骤>

## 检查清单

- [ ] 代码已审查
- [ ] 测试通过
- [ ] 无 lint 错误
```

**交互模式：** 提交前让用户审阅并编辑描述内容。

**自动模式：** 直接使用生成的描述创建 PR，不等待确认。

**Token 处理：**

- 优先检查环境变量：`$env:GITHUB_TOKEN`
- 未设置时，询问用户提供（不存储 token）
- Owner/Repo：优先使用 `gh` CLI 获取，否则从远程 URL 解析

---

## 第 9 步 — CI 状态监控（可选）

PR 创建后，主动询问是否监控 GitHub Actions：

```powershell
# 优先使用 gh CLI
gh run list --branch <分支名> --limit 1

# 或通过 API 查询
$headers = @{ "Authorization" = "Bearer $env:GITHUB_TOKEN" }
Invoke-RestMethod `
    -Uri "https://api.github.com/repos/<OWNER>/<REPO>/actions/runs?branch=<分支名>&per_page=1" `
    -Headers $headers
```

每 30 秒轮询一次，workflow 结束（通过/失败）后汇报结果。
如果失败，展示失败的 job，并询问是否获取日志。

---

## 常用快捷场景

### 自动模式（`auto: true`）

当用户说 "直接帮我推代码"、"一键提交"、"快速走完流程" 时，执行完整流程且**不等待确认**：

1. 预检查 → 通过则静默继续
2. Lint + 修复 → 有 package.json 时自动执行
3. 暂存全部 → `git add .`
4. 生成 commit 信息 → 直接使用，不确认
5. 推送 → 直接执行
6. 创建 PR → 直接创建（除非 `skip-pr: true`）

### 交互模式（默认）

当用户说 "帮我推代码" 时，执行完整流程但需要确认：

1. 预检查 → 通过则静默
2. Lint + 修复 → 有 package.json 时自动执行
3. 暂存全部 → `git add .`
4. 生成 commit 信息 → 展示给用户快速确认
5. 推送 → 执行
6. 询问是否创建 PR

当用户说"帮我创建 PR"时，假设已推送完成，直接跳到第 8 步。

---

## 错误处理

| 错误情况                        | 处理方式                             |
| ------------------------------- | ------------------------------------ |
| --fix 后仍有 lint 错误          | 展示错误，停止流程，要求用户手动修复 |
| push 被拒绝（non-fast-forward） | 执行 `git pull --rebase`，再重试推送 |
| 分支已存在于远程                | 询问是否直接推送，或重命名分支       |
| GITHUB_TOKEN 未设置             | 提示用户设置，并提供操作说明         |
| PR 已存在                       | 展示已有 PR 的 URL，跳过创建         |
| 存在合并冲突                    | 列出冲突文件，引导用户解决冲突       |

---

## 参考文件

- `references/github-pr.md` — GitHub API 完整参考：PR 创建、owner/repo 获取、Actions 轮询
