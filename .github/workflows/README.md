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

- unit（needs: sast）
  - 环境：内置 Postgres 15、Python 3.11、Node 18
  - 步骤：安装依赖 → 三服务 migrate+test 覆盖率 → 聚合检查（≥85%）→ 前端构建 → 上传 `coverage_xml`
  - 产物：`coverage-user.xml`、`coverage-activity.xml`、`coverage-notification.xml`
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
- 覆盖率：`coverage-*.xml`
- 集成/E2E：`newman-report.html`、`frontend/playwright-report/`
- 安全扫描：`*.sarif`
- 下载（CLI）：`gh run download <run-id> -n integration_artifacts`

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
 - SARIF 查看：GitHub Security → Code scanning alerts 上传，或本地 VS Code SARIF Viewer 打开。
 - 并发控制（可选）：可在顶层添加 `concurrency` 避免同分支重复运行。

## 🧵 流水线依赖关系（PR）
```
sast  →  unit  →  integration  →  dast
              └──────────────→  container_iac_scan
```

## 📚 参考
- GitHub Actions: https://docs.github.com/en/actions
- Kubernetes: https://kubernetes.io/docs/
