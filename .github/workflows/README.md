# 🚀 Volunteer Platform CI/CD 工作流详细说明

本文档详细说明 Volunteer Platform 项目的完整 CI/CD 工作流程，包括持续集成（CI）和持续部署（CD）的所有阶段。

---

## 工作流概览

本项目使用 **GitHub Actions** 实现完整的 CI/CD 流程，包括：

### 工作流文件

- **`aliCloudCICD.yml`** - 主工作流文件，包含完整的 CI/CD 流程

### 工作流流程

```
Pull Request 触发 → CI 阶段（测试、扫描、验证）
                                      ↓
                              所有检查通过
                                      ↓
Push to Main 触发 → CD 阶段（构建、部署到 Kubernetes）
```

### 流水线依赖关系

**CI 阶段（Pull Request）：**
```
sast (安全扫描)
  ↓
unit (单元测试 + 覆盖率)
  ↓                    ↓
integration          container_iac_scan
  ↓                    (容器/IaC 扫描)
dast (动态安全扫描)
  ↓
perf (性能测试)
```

**CD 阶段（Push to Main）：**
```
prepare_and_build (准备和构建镜像)
  ↓
import_images (导入镜像到 containerd)
  ↓
deploy_infrastructure (部署基础设施)
  ↓
deploy_services (部署应用服务)
  ↓
deploy_gateway (部署网关和 Ingress)
  ↓
verify_deployment (验证部署状态)
```

---

## 触发条件

### Pull Request 触发

- **事件**: `pull_request`
- **分支**: 目标分支为 `main`
- **触发类型**: `opened`, `synchronize`, `reopened`
- **执行阶段**: CI 阶段（测试、扫描、验证）
- **不会执行**: 部署阶段

### Push 触发

- **事件**: `push`
- **分支**: `main` 分支
- **执行阶段**: CD 阶段（构建、部署）
- **前提条件**: 代码已通过所有 PR 检查

---

## CI 阶段详解（Pull Request）

### 1. SAST - 代码与依赖安全扫描

**Job 名称**: `sast`

**执行时机**: Pull Request 创建、更新或重新打开时

**运行环境**: `ubuntu-22.04`

**主要步骤**:

1. **代码检出**
   - 使用 `actions/checkout@v4`
   - `fetch-depth: 0` - 获取完整 Git 历史（Gitleaks 需要）

2. **Python 环境设置**
   - 安装 Python 3.11

3. **Gitleaks - 密钥泄露检测**
   - 扫描代码中的密钥泄露（API 密钥、密码、令牌等）
   - 输出格式：SARIF
   - 需要 `GITHUB_TOKEN` 环境变量

4. **安装 SAST 工具**
   - Bandit - Python 安全扫描
   - Semgrep - 通用代码安全扫描
   - pip-audit - Python 依赖漏洞扫描

5. **Bandit - Python SAST**
   - 扫描 `services/` 目录下的 Python 代码
   - 检测 SQL 注入、命令执行等安全问题
   - 输出格式：SARIF

6. **Semgrep - 通用代码安全扫描**
   - 基于规则的代码安全问题检测
   - 跨语言支持
   - 输出格式：SARIF

7. **pip-audit - 依赖漏洞扫描**
   - 分别扫描三个服务的依赖：
     - `services/user/requirements.txt`
     - `services/activity/requirements.txt`
     - `services/notification/requirements.txt`
   - 输出格式：SARIF

8. **生成 SAST HTML 报告**
   - 将 SARIF 格式转换为 HTML
   - 生成汇总报告 `sast-summary.html`

9. **上传 SAST 产物**
   - Artifact 名称: `sast_reports`
   - 包含: 所有 `.sarif` 文件和 `.html` 文件
   - 保留时间: 7 天

**生成的产物**:
- **SARIF 格式**:
  - `gitleaks.sarif` - 密钥泄露检测
  - `bandit.sarif` - Python 安全扫描
  - `semgrep.sarif` - 通用代码安全扫描
  - `pip-audit-user.sarif` - User Service 依赖漏洞
  - `pip-audit-activity.sarif` - Activity Service 依赖漏洞
  - `pip-audit-notification.sarif` - Notification Service 依赖漏洞
- **HTML 格式**:
  - `gitleaks.html`, `bandit.html`, `semgrep.html`, `pip-audit-*.html` - 各工具详细报告
  - `sast-summary.html` - 汇总报告

**常见失败原因**:
- 规则过严或误报（当前为软失败 `|| true`）
- Git 历史获取失败
- GITHUB_TOKEN 未配置

**查看方式**: 详见 [查看 SAST 安全扫描报告](#查看-sast-安全扫描报告)

---

### 2. Unit - 单元测试与覆盖率

**Job 名称**: `unit`

**执行时机**: `sast` 完成后

**运行环境**: `ubuntu-22.04`

**服务依赖**:
- PostgreSQL 15 (通过 GitHub Actions services)

**主要步骤**:

1. **环境设置**
   - 安装 Python 3.11
   - 安装 Node.js 18（带 npm 缓存）

2. **依赖安装**
   - Python: `coverage`, `requirements.txt`（三个服务）
   - Node.js: 前端依赖（`npm ci`）

3. **前端单元测试（带覆盖率）**
   - 使用 Vitest 运行前端单元测试
   - 收集覆盖率数据
   - 内存优化：`NODE_OPTIONS: "--max-old-space-size=6144"`
   - 如果失败，回退到不带覆盖率的测试

4. **后端服务测试（带覆盖率）**
   - **User Service**:
     - 运行迁移: `python manage.py migrate`
     - 运行测试: `coverage run manage.py test users.tests`
     - 生成报告: `coverage xml` 和 `coverage html`
   - **Activity Service**: 同上
   - **Notification Service**: 同上

5. **覆盖率阈值检查**
   - 聚合所有服务的覆盖率
   - 目标阈值: ≥ 85%
   - 当前策略: 低于阈值时发出警告，但不阻止 CI（`continue-on-error: true`）

6. **生成合并覆盖率 HTML 报告**
   - 生成 `coverage-summary.html` - 所有服务的汇总报告
   - 包含前端和后端覆盖率

7. **前端构建测试**
   - 运行 `npm run build` 验证前端构建成功

8. **上传覆盖率产物**
   - Artifact 名称: `coverage_reports`
   - 包含:
     - `coverage-*.xml` - XML 格式覆盖率报告
     - `coverage-*-html/` - 各服务的详细 HTML 报告
     - `coverage-summary.html` - 汇总报告
     - `frontend/coverage/` - 前端覆盖率报告
   - 保留时间: 7 天

**生成的产物**:
- **XML 格式**: `coverage-user.xml`, `coverage-activity.xml`, `coverage-notification.xml`
- **HTML 详细报告**:
  - `coverage-user-html/index.html`
  - `coverage-activity-html/index.html`
  - `coverage-notification-html/index.html`
  - `frontend/coverage/index.html`
- **汇总报告**: `coverage-summary.html`

**常见失败原因**:
- 数据库迁移失败
- 测试依赖缺失
- 覆盖率不足（当前为警告）
- 前端构建失败
- 内存溢出（已优化）

**查看方式**: 详见 [查看代码覆盖率 HTML 报告](#查看代码覆盖率-html-报告)

---

### 3. Integration - 集成与端到端测试

**Job 名称**: `integration`

**执行时机**: `unit` 完成后

**运行环境**: `ubuntu-22.04`

**主要步骤**:

1. **代码检出**

2. **启动集成测试环境**
   - 使用 `docker-compose.test.yml` 启动服务
   - 启动的服务：
     - `user-service` (端口 8001)
     - `activity-service` (端口 8002)
     - `notification-service` (端口 8003)
     - `frontend` (端口 8080)

3. **等待服务健康检查**
   - 轮询检查所有服务的 `/api/v1/health/` 端点
   - 最多等待 60 次，每次间隔 2 秒

4. **安装测试工具**
   - Newman (Postman CLI)
   - Playwright (E2E 测试框架)

5. **运行 Postman API 集成测试**
   - 使用 Newman 运行 `tests/postman_collection.json`
   - 环境配置: `tests/postman_env.json`
   - 生成 HTML 报告: `newman-report.html`

6. **运行 Playwright E2E 测试**
   - 运行前端 E2E 测试
   - 生成 HTML 报告、截图和视频
   - 输出目录: `frontend/playwright-report/`

7. **上传集成测试产物**
   - Artifact 名称: `integration_artifacts`
   - 包含:
     - `newman-report.html` - Postman 测试报告
     - `frontend/playwright-report/` - Playwright 报告（包含截图和视频）
   - 保留时间: 7 天

**生成的产物**:
- **Postman 报告**: `newman-report.html`
- **Playwright 报告**: 
  - `frontend/playwright-report/index.html` - HTML 报告
  - `frontend/playwright-report/test-results/` - 截图和视频（仅在失败时生成）

**常见失败原因**:
- 服务未就绪（健康检查失败）
- 端口冲突
- 网络不通
- E2E 选择器超时
- Docker Compose 启动失败

**查看方式**: 详见 [查看 Playwright 截图和视频](#查看-playwright-截图和视频)

---

### 4. Container IaC Scan - 容器镜像与基础设施扫描

**Job 名称**: `container_iac_scan`

**执行时机**: `unit` 完成后（与 `integration` 并行）

**运行环境**: `ubuntu-22.04`

**主要步骤**:

1. **代码检出**

2. **构建镜像**
   - 构建所有服务镜像（用于扫描）:
     - `user-service:ci`
     - `activity-service:ci`
     - `notification-service:ci`

3. **Trivy 镜像扫描**
   - 扫描所有服务镜像
   - 扫描 Dockerfile
   - 扫描严重性: CRITICAL, HIGH
   - 输出格式: JSON

4. **生成 Trivy HTML 报告**
   - 将 JSON 报告转换为 HTML
   - 为每个扫描结果生成单独的 HTML 文件

5. **Checkov 扫描**
   - **Dockerfile 扫描**: 扫描所有 Dockerfile
   - **Kubernetes 扫描**: 扫描 `k8s/` 目录下的 K8s 清单
   - 输出格式: CLI (文本文件)

6. **上传扫描结果**
   - Artifact 名称: `container_iac_scan_results`
   - 包含:
     - `trivy-*.json` - Trivy JSON 报告
     - `trivy-*.html` - Trivy HTML 报告
     - `checkov-*.txt` - Checkov 文本报告
   - 保留时间: 7 天

**生成的产物**:
- **Trivy JSON**: `trivy-user-image.json`, `trivy-activity-image.json`, `trivy-notification-image.json`, `trivy-*-dockerfile.json`
- **Trivy HTML**: `trivy-*.html` - 各镜像和 Dockerfile 的详细扫描报告
- **Checkov 文本**: `checkov-dockerfile.txt`, `checkov-k8s.txt`

**常见失败原因**:
- 镜像构建失败
- Trivy 扫描超时（当前为软失败）
- Checkov 规则过严（当前为软失败）

**查看方式**: 下载 `container_iac_scan_results` artifact，打开 HTML 文件查看

---

### 5. DAST - 动态应用安全测试

**Job 名称**: `dast`

**执行时机**: `integration` 完成后

**运行环境**: `ubuntu-22.04`

**权限要求**:
- `contents: read`
- `security-events: write`
- `actions: read`

**主要步骤**:

1. **代码检出**

2. **确保集成环境运行**
   - 启动 `docker-compose.test.yml`（如果未运行）

3. **等待服务就绪**
   - 验证 `user-service` 健康检查端点

4. **OWASP ZAP Baseline 扫描**
   - 目标: `http://localhost:8001` (user-service)
   - 规则文件: `.zap/rules.tsv`
   - 选项: `-a -m 5`
   - 不创建 GitHub Issues (`allow_issue_writing: false`)
   - 不上传 artifact（手动上传）

5. **生成 ZAP JSON 汇总**
   - 解析 `report_json.json`
   - 生成 `zap-summary.html` 汇总报告

6. **上传 ZAP 报告**
   - Artifact 名称: `zapReport`
   - 包含:
     - `report_html.html` - ZAP 完整 HTML 报告
     - `report_json.json` - ZAP JSON 数据
     - `report_md.md` - ZAP Markdown 报告
     - `zap-summary.html` - ZAP 扫描汇总报告
   - 保留时间: 7 天

**生成的产物**:
- **HTML 格式**: `report_html.html`, `zap-summary.html`
- **JSON 格式**: `report_json.json`
- **Markdown 格式**: `report_md.md`

**常见失败原因**:
- 服务未就绪
- ZAP 扫描超时
- 权限不足（Resource not accessible by integration）

**查看方式**: 下载 `zapReport` artifact，打开 HTML 文件查看

---

### 6. Perf - 性能测试

**Job 名称**: `perf`

**执行时机**: `integration` 完成后（Pull Request 时）

**运行环境**: `ubuntu-22.04`

**主要步骤**:

1. **代码检出**

2. **启动性能测试环境**
   - 使用 `docker-compose.perf.yml` 启动服务
   - 使用 Gunicorn 多 worker 模式（更接近生产环境）

3. **等待服务就绪**
   - 验证所有服务的健康检查端点

4. **k6 负载测试**
   - 运行 `tests/perf/k6-load.js`
   - 输出格式: JSON
   - 生成 `k6-results.json`

5. **生成 k6 汇总报告**
   - 解析 k6 JSON 结果
   - 生成 `k6-summary.html` 汇总报告

6. **安装 JMeter**

7. **运行 JMeter 性能测试**
   - 运行 `tests/perf/jmeter_test.jmx`
   - 输出格式: JTL (CSV) 和 HTML
   - 生成 `jmeter.jtl` 和 `jmeter-report/`

8. **生成 JMeter JTL 汇总**
   - 解析 JTL 文件
   - 生成 `jmeter-summary.html` 汇总报告

9. **上传性能测试产物**
   - **k6 产物** (`perf_results_k6`):
     - `k6-results.json`
     - `k6-summary.json`
     - `k6-summary.html`
   - **JMeter 产物** (`perf_results_jmeter`):
     - `jmeter.jtl`
     - `jmeter-summary.html`
     - `jmeter-report/**` (完整 HTML 报告目录)
   - 保留时间: 7 天

**生成的产物**:
- **k6 报告**:
  - `k6-results.json`, `k6-summary.json` - JSON 格式
  - `k6-summary.html` - HTML 汇总报告
- **JMeter 报告**:
  - `jmeter.jtl` - 原始测试数据
  - `jmeter-summary.html` - HTML 汇总报告
  - `jmeter-report/` - 详细 HTML 报告目录

**常见失败原因**:
- 服务未就绪
- k6 测试超时（当前为软失败）
- JMeter 测试失败（当前为软失败）

**查看方式**: 下载 `perf_results_k6` 和 `perf_results_jmeter` artifacts，打开 HTML 文件查看

---

## CD 阶段详解（Push to Main）

当代码推送到 `main` 分支时，会自动触发部署流程。部署过程分为 **6 个阶段**，依次执行。

详细说明请参考: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### 部署阶段概览

1. **prepare_and_build** - 准备和构建镜像
2. **import_images** - 导入镜像到 containerd
3. **deploy_infrastructure** - 部署基础设施（命名空间、配置、数据库）
4. **deploy_services** - 部署应用服务（微服务和前端）
5. **deploy_gateway** - 部署网关和 Ingress
6. **verify_deployment** - 验证部署状态

### 部署时间线

| 阶段 | 预计时间 | 说明 |
|------|---------|------|
| 准备和构建镜像 | 5-10 分钟 | 取决于代码变更和镜像大小 |
| 导入镜像到 containerd | 2-5 分钟 | 取决于镜像大小和网络速度 |
| 部署基础设施 | 2-3 分钟 | 数据库启动需要时间 |
| 部署应用服务 | 3-5 分钟 | 等待所有 Pod 就绪 |
| 部署网关和 Ingress | 1-2 分钟 | 网关启动较快 |
| 验证部署状态 | < 1 分钟 | 快速检查所有资源 |

**总预计时间**: 15-25 分钟

---

## 生成的产物（Artifacts）

所有测试和扫描结果都会上传为 GitHub Actions Artifacts，可在 Actions 页面下载查看。

### Artifact 列表

| Artifact 名称 | 包含内容 | 生成阶段 | 保留时间 |
|--------------|---------|---------|---------|
| `sast_reports` | SARIF 和 HTML 格式的 SAST 扫描报告 | `sast` | 7 天 |
| `coverage_reports` | 代码覆盖率 XML 和 HTML 报告 | `unit` | 7 天 |
| `integration_artifacts` | Postman 和 Playwright 测试报告 | `integration` | 7 天 |
| `container_iac_scan_results` | Trivy 和 Checkov 扫描报告 | `container_iac_scan` | 7 天 |
| `zapReport` | OWASP ZAP DAST 扫描报告 | `dast` | 7 天 |
| `perf_results_k6` | k6 性能测试报告 | `perf` | 7 天 |
| `perf_results_jmeter` | JMeter 性能测试报告 | `perf` | 7 天 |

### 如何下载 Artifacts

**在 GitHub Actions 页面**:
1. 进入仓库 → **Actions** 标签页
2. 选择对应的 Workflow Run
3. 在页面右侧或底部找到 **Artifacts** 区域
4. 点击 Artifact 名称下载

**使用 GitHub CLI**:
```bash
# 列出所有 workflow runs
gh run list

# 下载特定 artifact
gh run download <run-id> -n <artifact-name>

# 下载所有 artifacts
gh run download <run-id>
```

---

## 环境变量和 Secrets

### 必需的 Secrets

在仓库的 **Settings → Secrets and variables → Actions** 中配置：

| Secret 名称 | 说明 | 使用阶段 |
|-----------|------|---------|
| `SSH_HOST` | 目标服务器地址 | CD 阶段 |
| `SSH_USER` | SSH 用户名 | CD 阶段 |
| `aliCloud` | SSH 私钥 | CD 阶段 |

### 自动提供的环境变量

GitHub Actions 自动提供：
- `GITHUB_TOKEN` - 用于 Gitleaks 扫描 PR 变更

### 环境变量使用

在 CI 阶段，所有测试使用内置服务（PostgreSQL），无需额外配置。

在 CD 阶段，通过 SSH 连接到远程服务器执行部署命令。

---

## 查看测试报告

### 📸 查看 Playwright 截图和视频

**在 GitHub Actions 中查看**:
1. 进入仓库 → **Actions** → 选择对应的 Workflow Run
2. 在页面右侧或底部找到 **Artifacts** 区域
3. 下载 `integration_artifacts` 构件
4. 解压后，进入 `frontend/playwright-report/` 目录：
   - **HTML 报告**: 打开 `index.html`（在浏览器中可查看所有测试结果、截图和视频）
   - **截图**: 位于 `test-results/` 目录（仅在测试失败时生成）
   - **视频**: 位于 `test-results/` 目录（仅在测试失败时生成）

**使用 GitHub CLI 下载**:
```bash
# 下载 integration_artifacts
gh run download <run-id> -n integration_artifacts

# 解压后查看
cd frontend/playwright-report
# 打开 index.html 在浏览器中查看
```

**本地查看**:
```bash
cd frontend
npx playwright show-report playwright-report
# 或直接打开 playwright-report/index.html
```

**注意**: 根据配置，截图和视频只在测试失败时生成。

---

### 📊 查看代码覆盖率 HTML 报告

**在 GitHub Actions 中查看**:
1. 进入仓库 → **Actions** → 选择对应的 Workflow Run
2. 在页面右侧或底部找到 **Artifacts** 区域
3. 下载 `coverage_reports` 构件
4. 解压后：
   - **汇总报告**: 打开 `coverage-summary.html`（查看整体覆盖率概览）
   - **详细报告**:
     - `coverage-user-html/index.html` - User Service 详细覆盖率
     - `coverage-activity-html/index.html` - Activity Service 详细覆盖率
     - `coverage-notification-html/index.html` - Notification Service 详细覆盖率
     - `frontend/coverage/index.html` - Frontend 详细覆盖率

**使用 GitHub CLI 下载**:
```bash
# 下载 coverage_reports
gh run download <run-id> -n coverage_reports

# 解压后查看
open coverage-summary.html  # macOS
xdg-open coverage-summary.html  # Linux
start coverage-summary.html  # Windows
```

**HTML 报告特点**:
- ✅ 可视化进度条和百分比
- ✅ 按文件查看覆盖率详情
- ✅ 高亮显示未覆盖的代码行
- ✅ 支持点击跳转到源代码

---

### 🔒 查看 SAST 安全扫描报告

**推荐方式：HTML 报告（最方便）**

**在 GitHub Actions 中查看**:
1. 进入仓库 → **Actions** → 选择对应的 Workflow Run
2. 在页面右侧或底部找到 **Artifacts** 区域
3. 下载 `sast_reports` 构件
4. 解压后：
   - **汇总报告**: 打开 `sast-summary.html`（查看所有扫描工具的概览）
   - **详细报告**: 打开各个工具的 HTML 文件：
     - `gitleaks.html` - 密钥泄露检测结果
     - `bandit.html` - Python 代码安全问题
     - `semgrep.html` - 通用代码安全扫描
     - `pip-audit-*.html` - 各服务的依赖漏洞扫描

**使用 GitHub CLI 下载**:
```bash
# 下载 sast_reports
gh run download <run-id> -n sast_reports

# 解压后查看
open sast-summary.html  # macOS
xdg-open sast-summary.html  # Linux
start sast-summary.html  # Windows
```

**HTML 报告特点**:
- ✅ 可视化表格展示所有安全问题
- ✅ 按严重性分类（Error、Warning、Note）
- ✅ 显示问题位置（文件路径和行号）
- ✅ 清晰的问题描述
- ✅ 汇总页面快速了解整体情况

**其他查看方式（SARIF 格式）**:

**方式 1：GitHub Code Scanning**
1. 进入仓库 → **Security** → **Code scanning alerts**
2. 如果 SARIF 文件已上传，漏洞会自动显示在这里

**方式 2：VS Code SARIF Viewer 扩展**
1. 安装扩展：**SARIF Viewer**（Microsoft）
2. 在 VS Code 中打开 `.sarif` 文件
3. 扩展会自动解析并显示在 **Problems** 面板中

**方式 3：在线查看器**
- 访问：https://sarifviewer.azurewebsites.net/
- 上传 `.sarif` 文件即可查看

**扫描工具说明**:
- **Gitleaks** - 检测代码中的密钥泄露（API 密钥、密码、令牌等）
- **Bandit** - Python 代码安全漏洞扫描（SQL 注入、命令执行等）
- **Semgrep** - 通用代码安全问题（跨语言，基于规则）
- **pip-audit** - Python 依赖包漏洞扫描（按服务分别扫描）

---

## 故障排查

### 常见问题

#### 1. YAML 解析错误

**症状**: Workflow 无法解析，提示 "Implicit keys need to be on a single line"

**解决方法**:
- 确保所有缩进为 **两个空格**
- `steps:` 下每步为 `- name:`
- 多行脚本使用 `run: |` 或 `with: script: |`，内容再缩进两个空格

#### 2. 单元测试失败

**症状**: `unit` job 失败

**可能原因**:
- 数据库迁移失败
- 测试依赖缺失
- 覆盖率不足（当前为警告，不阻止 CI）

**解决方法**:
```bash
# 本地复现
cd services/user
python manage.py migrate --settings=user_service.settings.base
python manage.py test users.tests --settings=user_service.settings.base
```

#### 3. 集成测试失败

**症状**: `integration` job 失败

**可能原因**:
- 服务未就绪（健康检查失败）
- 端口冲突
- 网络不通
- E2E 选择器超时

**解决方法**:
```bash
# 检查服务健康状态
curl http://localhost:8001/api/v1/health/
curl http://localhost:8002/api/v1/health/
curl http://localhost:8003/api/v1/health/

# 查看 Docker 容器日志
docker compose -f docker-compose.test.yml logs
```

#### 4. 前端内存溢出

**症状**: `Worker terminated due to reaching memory limit: JS heap out of memory`

**解决方法**:
- 已优化内存配置（`NODE_OPTIONS: "--max-old-space-size=6144"`）
- 如果仍失败，测试会自动回退到不带覆盖率的模式

#### 5. 部署失败

**症状**: CD 阶段失败

**可能原因**:
- 服务器缺少 docker/ctr/kubectl
- kubeconfig 不可用
- 镜像导入失败
- K8s 资源冲突

**解决方法**: 详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的故障排查章节

---

## 本地复现

### 集成测试环境

```bash
# 启动测试环境
docker compose -f docker-compose.test.yml up -d --build

# 等待服务就绪
sleep 10

# 运行 Postman 测试
newman run tests/postman_collection.json -e tests/postman_env.json

# 运行 Playwright E2E 测试
cd frontend
npm install
npx playwright install
npm test
```

### 性能测试环境

```bash
# 启动性能测试环境
docker compose -f docker-compose.perf.yml up -d --build

# 等待服务就绪
sleep 10

# k6 负载测试
k6 run tests/perf/k6-load.js

# JMeter 性能测试
jmeter -n -t tests/perf/jmeter_test.jmx -l jmeter.jtl -e -o jmeter-report
```

### 单元测试

```bash
# User Service
cd services/user
python manage.py migrate --settings=user_service.settings.base
coverage run --source=. manage.py test users.tests --settings=user_service.settings.base
coverage html

# Activity Service
cd services/activity
python manage.py migrate --settings=activity_service.settings.base
coverage run --source=. manage.py test activities.tests --settings=activity_service.settings.base
coverage html

# Notification Service
cd services/notification
python manage.py migrate --settings=notification_service.settings
coverage run --source=. manage.py test notification_service.tests --settings=notification_service.settings
coverage html

# Frontend
cd frontend
npm install
npm run test:unit:coverage
```

---

## 最佳实践

### CI 阶段

1. **测试先行**: 所有代码变更必须通过测试
2. **安全扫描**: 定期检查安全扫描结果，及时修复漏洞
3. **覆盖率监控**: 保持代码覆盖率 ≥ 85%
4. **快速反馈**: CI 阶段应快速完成，提供及时反馈

### CD 阶段

1. **渐进式部署**: 分阶段部署，确保每个阶段成功后再继续
2. **健康检查**: 所有服务都配置健康检查
3. **资源验证**: 部署前验证所有必需资源
4. **状态监控**: 部署完成后自动验证所有资源状态
5. **回滚准备**: 保持部署历史，便于快速回滚

### 代码质量

1. **测试独立性**: 每个测试应该独立运行
2. **Mock 外部依赖**: 使用 Mock 避免依赖外部服务
3. **覆盖边界情况**: 测试正常流程和异常情况
4. **性能测试**: 定期进行性能测试，确保系统性能

---

## 参考文档

### 项目文档

- **[TESTING.md](./TESTING.md)** - 详细的测试功能说明
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 详细的部署流程说明

### 外部文档

- **GitHub Actions**: https://docs.github.com/en/actions
- **Kubernetes**: https://kubernetes.io/docs/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **Trivy**: https://aquasecurity.github.io/trivy/
- **OWASP ZAP**: https://www.zaproxy.org/

---

## 总结

本项目的 CI/CD 流程采用**自动化、分阶段、可验证**的方式，确保：

- ✅ **代码质量**: 通过单元测试、集成测试、E2E 测试
- ✅ **安全性**: 通过 SAST、DAST、容器扫描
- ✅ **性能**: 通过 k6 和 JMeter 性能测试
- ✅ **可靠性**: 通过分阶段部署和健康检查

通过多层次的测试和验证，确保系统能够稳定可靠地运行。

如有任何问题，请参考相关文档或查看 GitHub Actions 日志。
