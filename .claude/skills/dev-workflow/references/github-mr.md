# GitHub API 参考 — Pull Request 与 Actions CI

> 所有脚本基于 **Windows PowerShell**。

## 身份认证

```powershell
# 当前会话临时设置 Token
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 所需权限范围：repo（含 pull requests 读写）
# 生成地址：GitHub → Settings → Developer settings → Personal access tokens
```

---

## 获取 Owner / Repo

### 从远程 URL 解析

```powershell
# 获取远程仓库地址
$remote = git remote get-url origin
# 例：git@github.com:myteam/myproject.git
# 或：https://github.com/myteam/myproject.git

# 提取 owner/repo（兼容 SSH 和 HTTPS 格式）
$ownerRepo = $remote -replace '.*github\.com[:/]', '' -replace '\.git$', ''
# 结果：myteam/myproject

$owner = $ownerRepo.Split('/')[0]
$repo  = $ownerRepo.Split('/')[1]
```

### 使用 gh CLI（推荐）

```powershell
# 检查是否已安装 gh
Get-Command gh -ErrorAction SilentlyContinue

# 查看当前仓库信息
gh repo view

# 获取 owner 和 repo（JSON 格式）
gh repo view --json owner,name
```

---

## 创建 Pull Request

```powershell
$owner       = "<owner>"
$repo        = "<repo>"
$headBranch  = git branch --show-current
$baseBranch  = "main"   # 或 "master"、"develop"，请与用户确认目标分支

$headers = @{
    "Authorization" = "Bearer $env:GITHUB_TOKEN"
    "Content-Type"  = "application/json"
}
$body = @{
    head  = $headBranch
    base  = $baseBranch
    title = $prTitle    # 提前赋值
    body  = $prBody     # 提前赋值
    draft = $false
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls" `
    -Headers $headers `
    -Body $body
```

**需要保存的响应字段：**

- `number` — PR 编号（用于展示）
- `html_url` — PR 直达链接（展示给用户）：`$response.html_url`
- `id` — 内部 ID（用于查询 checks）

---

## 检查 PR 是否已存在

```powershell
$headers = @{ "Authorization" = "Bearer $env:GITHUB_TOKEN" }
$existing = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls?head=${owner}:${headBranch}&state=open" `
    -Headers $headers

# 如果返回数组非空，说明该分支已有开启中的 PR
if ($existing.Count -gt 0) {
    Write-Host "PR 已存在：$($existing[0].html_url)"
}
```

---

## 查询分支的 Actions Workflow Runs

```powershell
$headers = @{ "Authorization" = "Bearer $env:GITHUB_TOKEN" }
$runs = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/actions/runs?branch=$headBranch&per_page=1" `
    -Headers $headers

# 响应字段说明：
# $runs.workflow_runs[0].status     → queued | in_progress | completed
# $runs.workflow_runs[0].conclusion → success | failure | cancelled | skipped | neutral
# $runs.workflow_runs[0].html_url   → Actions 页面链接
```

---

## 查询失败的 Jobs

```powershell
$runId   = "<workflow run ID>"
$headers = @{ "Authorization" = "Bearer $env:GITHUB_TOKEN" }
$jobs = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/actions/runs/$runId/jobs" `
    -Headers $headers

# 过滤失败的 job，展示名称和链接
$jobs.jobs | Where-Object { $_.conclusion -eq "failure" } | ForEach-Object {
    Write-Host "失败 Job：$($_.name)"
    Write-Host "日志链接：$($_.html_url)"
}
```

---

## 获取 Job 日志

```powershell
$jobId   = "<job ID>"
$headers = @{ "Authorization" = "Bearer $env:GITHUB_TOKEN" }

# 日志以纯文本返回，保存到文件再查看
Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/actions/jobs/$jobId/logs" `
    -Headers $headers `
    -OutFile "job-log.txt"

# 只查看最后 50 行
Get-Content "job-log.txt" -Tail 50
```

---

## CI 轮询脚本

```powershell
param(
    [string]$Owner,
    [string]$Repo,
    [string]$Branch
)

$maxWait  = 300   # 最长等待时间：300 秒（5 分钟）
$interval = 30    # 轮询间隔：30 秒
$elapsed  = 0
$headers  = @{ "Authorization" = "Bearer $env:GITHUB_TOKEN" }

Write-Host "正在等待分支 $Branch 的 Actions workflow..."

while ($elapsed -lt $maxWait) {
    $runs = Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$Owner/$Repo/actions/runs?branch=$Branch&per_page=1" `
        -Headers $headers

    $run        = $runs.workflow_runs[0]
    $status     = if ($run) { $run.status } else { "not_found" }
    $conclusion = if ($run) { $run.conclusion } else { $null }

    Write-Host "[$elapsed 秒] 状态：$status / 结论：$conclusion"

    if ($status -eq "completed") {
        switch ($conclusion) {
            "success"   { Write-Host "✅ CI 通过！"; exit 0 }
            "failure"   { Write-Host "❌ CI 失败"; exit 1 }
            "cancelled" { Write-Host "❌ CI 已取消"; exit 1 }
            default     { Write-Host "⚠️ CI 完成，结论：$conclusion"; exit 1 }
        }
    }
    elseif ($status -eq "not_found") {
        Write-Host "⏳ Workflow 尚未创建..."
    }
    else {
        Write-Host "⏳ 仍在运行中（$status）..."
    }

    Start-Sleep -Seconds $interval
    $elapsed += $interval
}

Write-Host "⏰ 等待 CI 超时"
exit 2
```

**使用方式：**

```powershell
.\ci-poll.ps1 -Owner myteam -Repo myproject -Branch feat/my-feature
```

---

## gh CLI 常用命令

```powershell
# 安装（使用 winget，Windows 内置包管理器）
winget install GitHub.cli
# 或下载安装包：https://cli.github.com

# 登录认证
gh auth login

# 创建 PR
gh pr create `
    --title "feat: add login page" `
    --body "..." `
    --base main

# 查看当前 PR 状态
gh pr view

# 查看 CI 状态
gh run list --branch <分支名>
gh run watch

# 列出所有开启中的 PR
gh pr list
```

有 `gh` 时优先使用，比直接调用 API 更简洁，且自动处理认证。
