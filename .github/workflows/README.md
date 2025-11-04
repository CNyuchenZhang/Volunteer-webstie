# CI/CD 工作流说明

本项目使用 GitHub Actions 进行测试、扫描与部署。关键工作流：

## 📋 工作流概览（仅解释 `aliCloudCICD.yml`）

### 触发条件
- pull_request 到 `main`：只跑 CI（测试、集成、扫描），不部署。
- push 到 `main`：只跑部署（SSH 到服务器 + K8s 部署）。
- 可选：可在 `on:` 增加 `workflow_dispatch`（手动运行）与 `schedule`（定时）

### 作业与依赖（仅 PR 执行）

- sast
  - 步骤：Checkout → Gitleaks → 安装 Bandit/Semgrep/pip-audit → 生成 SARIF → 上传 `sast_reports`
  - 产物：`gitleaks.sarif`、`bandit.sarif`、`semgrep.sarif`、`pip-audit-*.sarif`
  - 常见失败：规则过严/误报。当前 SAST 软失败（`|| true`），可逐步改硬失败。
  - SARIF 查看方式：见下方 "如何查看 SARIF 文件" 章节

- unit（needs: sast）
  - 环境：内置 Postgres 15、Python 3.11、Node 18
  - 步骤：安装依赖 → 三服务 migrate+test 覆盖率 → 生成 HTML 报告 → 聚合检查（≥85%）→ 前端构建 → 上传 `coverage_reports`
  - 产物：`coverage-*.xml`、`coverage-*-html/`（详细 HTML 报告）、`coverage-summary.html`（汇总报告）
  - 常见失败：数据库迁移缺失、测试依赖缺失、覆盖率不足、前端构建失败

- integration（needs: unit）
  - 环境：`docker-compose.test.yml` 启动四服务
  - 步骤：健康检查 → Newman 运行集合 → Playwright E2E（含截图/视频/HTML 报告）→ 上传 `integration_artifacts`
  - 产物：`newman-report.html`、`frontend/playwright-report/`
  - 常见失败：服务未 Ready/端口冲突、网络不通、E2E 选择器超时

- container_iac_scan（needs: unit）
  - 容器安全：Trivy 扫描三服务镜像（CRITICAL/HIGH 列表）
  - K8s/IaC：Checkov 扫描 `k8s/` 清单（软失败，可逐步收紧）
  - 产物：控制台输出（必要时可扩展为文件格式）

- dast（needs: integration）
  - OWASP ZAP Baseline 对本地集成环境（`http://localhost:8001`）执行 DAST
  - 产物：`zap_report`（HTML）

生成产物（Artifacts）：
- `coverage-*.xml`、`newman-report.html`、`frontend/playwright-report/`、`*.sarif`、`zap_report`、`perf_results`

必需环境变量/配置：
- PR 阶段：内置 Postgres，无需 Secrets。

### 作业：deploy（仅 push 到 main 触发）
- 运行环境：`ubuntu-22.04`
- 前置：需要仓库 Secrets
  - `SSH_HOST`：目标机地址
  - `SSH_USER`：SSH 用户名
  - `aliCloud`：SSH 私钥（Actions Secret 名称即为 `aliCloud`）
- 主要步骤：
  1) Checkout 代码
  2) SSH 执行：`git pull`、`docker compose build`、镜像导入 containerd（`ctr -n k8s.io images import -`）
  3) 校验：镜像导入完成、`kubectl` 可用与连通
  4) 部署：依次 `kubectl apply` 所有 `k8s/` 清单；等待 Deployment Ready
  5) 网关与 Ingress：部署 Nginx 与 Ingress；输出状态与访问信息
  6) 汇总：写入 `$GITHUB_STEP_SUMMARY` 部署摘要
  - 常见失败：服务器缺少 docker/ctr/kubectl、kubeconfig 不可用、镜像导入失败、K8s 资源冲突

### 作业：perf（仅 push，按需可改为手动/定时）
- 环境：`docker-compose.perf.yml`（Gunicorn 多 worker，更接近生产）
- 步骤：启动 perf 环境 → k6 load → 安装 JMeter 并执行 → 上传 `perf_results`
- 产物：`jmeter.jtl`、`jmeter-report/`

注意事项：
- 所有 YAML 缩进为两个空格；`with: script: |` 下的脚本需再缩进两个空格。
- 目标机需具备 Docker、containerd、kubectl 与 kubeconfig（可从系统环境或默认路径加载）。

### `ci.yml`（等价的CI流程，供独立运行/验证）
- 与 `aliCloudCICD.yml` 中“测试/扫描”阶段内容一致，用于单独验证 CI 行为。

### `testCICD.yml`（轻量工作流）
- 用于演示/局部验证（内容较少）。

## 🔐 必需 Secrets（仓库 Settings → Secrets and variables → Actions）
- `SSH_HOST`：生产服务器地址
- `SSH_USER`：SSH 用户名
- `aliCloud`：SSH 私钥

可选：如镜像仓库凭据、额外扫描配置等。

## 📦 生成的构件（Artifacts）
- 覆盖率：`coverage-*.xml`、`coverage-*-html/`（详细 HTML）、`coverage-summary.html`（汇总）
- 集成/E2E：`newman-report.html`、`frontend/playwright-report/`
- 安全扫描：`*.sarif`、`container_iac_scan_results`（Trivy HTML、Checkov TXT）
- DAST：`zap-report`（HTML、JSON、MD）
- 性能：`perf_results`（JMeter 报告）

### 📸 如何查看 Playwright 截图和视频

**在 GitHub Actions 中查看：**
1. 进入仓库 → **Actions** → 选择对应的 Workflow Run
2. 在页面右侧或底部找到 **Artifacts** 区域
3. 下载 `integration_artifacts` 构件
4. 解压后，进入 `frontend/playwright-report/` 目录：
   - **HTML 报告**：打开 `index.html`（在浏览器中可查看所有测试结果、截图和视频）
   - **截图**：位于 `test-results/` 目录（仅在测试失败时生成）
   - **视频**：位于 `test-results/` 目录（仅在测试失败时生成）

**使用 GitHub CLI 下载：**
```bash
# 下载 integration_artifacts
gh run download <run-id> -n integration_artifacts

# 解压后查看
cd frontend/playwright-report
# 打开 index.html 在浏览器中查看
```

**本地查看（如果本地运行了测试）：**
```bash
cd frontend
npx playwright show-report playwright-report
# 或直接打开 playwright-report/index.html
```

**注意：** 根据配置（`screenshot: 'only-on-failure'` 和 `video: 'retain-on-failure'`），截图和视频只在测试失败时生成。如需每次测试都生成，可修改 `frontend/playwright.config.ts`。

### 📊 如何查看代码覆盖率 HTML 报告

**在 GitHub Actions 中查看：**
1. 进入仓库 → **Actions** → 选择对应的 Workflow Run
2. 在页面右侧或底部找到 **Artifacts** 区域
3. 下载 `coverage_reports` 构件
4. 解压后：
   - **汇总报告**：打开 `coverage-summary.html`（在浏览器中查看整体覆盖率概览）
   - **详细报告**：
     - `coverage-user-html/index.html` - User Service 详细覆盖率
     - `coverage-activity-html/index.html` - Activity Service 详细覆盖率
     - `coverage-notification-html/index.html` - Notification Service 详细覆盖率

**使用 GitHub CLI 下载：**
```bash
# 下载 coverage_reports
gh run download <run-id> -n coverage_reports

# 解压后查看
open coverage-summary.html  # macOS
xdg-open coverage-summary.html  # Linux
start coverage-summary.html  # Windows
```

**本地生成（如果本地运行了测试）：**
```bash
# 在对应服务目录下
cd services/user
coverage html
# 打开 htmlcov/index.html
```

**HTML 报告特点：**
- ✅ 可视化进度条和百分比
- ✅ 按文件查看覆盖率详情
- ✅ 高亮显示未覆盖的代码行
- ✅ 支持点击跳转到源代码

### 🔍 如何查看 SARIF 文件

SARIF (Static Analysis Results Interchange Format) 是安全扫描结果的标准化格式。

**方式 1：GitHub Code Scanning（推荐）**
1. 进入仓库 → **Security** → **Code scanning alerts**
2. 如果 SARIF 文件已通过 GitHub Actions 上传，漏洞会自动显示在这里
3. 可以按工具、严重性、文件等筛选查看

**方式 2：VS Code SARIF Viewer 扩展**
1. 在 VS Code 中安装扩展：**SARIF Viewer**（Microsoft）
2. 下载 `sast_reports` artifact
3. 解压后，在 VS Code 中打开任一 `.sarif` 文件
4. 扩展会自动解析并显示在 **Problems** 面板中

**方式 3：在线 SARIF 查看器**
- 访问：https://sarifviewer.azurewebsites.net/
- 上传 `.sarif` 文件即可查看

**方式 4：命令行工具（sarif-tools）**
```bash
# 安装
npm install -g @microsoft/sarif-tools

# 转换为 HTML
sarif-tools sarif-to-html gitleaks.sarif -o gitleaks-report.html
```

**SARIF 文件说明：**
- `gitleaks.sarif` - 密钥泄露扫描结果
- `bandit.sarif` - Python 代码安全问题
- `semgrep.sarif` - 通用代码安全问题
- `pip-audit-*.sarif` - Python 依赖漏洞扫描

**注意：** SARIF 文件是 JSON 格式，可以直接用文本编辑器打开，但建议使用上述工具查看以获得更好的可视化效果。

## 🧪 本地复现（可选）
```bash
# 集成环境
docker compose -f docker-compose.test.yml up -d --build

# Postman 集合
newman run tests/postman_collection.json -e tests/postman_env.json

# 前端 E2E（需在 frontend/ 安装依赖）
cd frontend && npm i && npx playwright install && npm test

# 性能环境
docker compose -f docker-compose.perf.yml up -d --build
k6 run tests/perf/k6-load.js
jmeter -n -t tests/perf/jmeter_test.jmx -l jmeter.jtl -e -o jmeter-report
```

## 🔍 常见问题
- YAML 解析错误（隐式键/缩进）：确保 `steps:` 下每步为“两个空格 + - name:”，多行脚本放在 `run: |` 或 `with: script: |` 且内容再缩进两个空格。
- Python 覆盖率步骤失败：确认已安装 `coverage`，并在对应服务目录执行。
- Postman/Playwright 失败：先检查三个服务 `/api/v1/health/` 是否就绪，再看 `integration_artifacts`。
 - SARIF 查看：详见上方 "如何查看 SARIF 文件" 章节。
 - 并发控制（可选）：可在顶层添加 `concurrency` 避免同分支重复运行。

## 🧵 流水线依赖关系（PR）
```
sast  →  unit  →  integration  →  dast
              └──────────────→  container_iac_scan
```

## 📚 参考
- GitHub Actions: https://docs.github.com/en/actions
- Kubernetes: https://kubernetes.io/docs/
