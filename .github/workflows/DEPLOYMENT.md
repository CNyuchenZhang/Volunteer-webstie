# 🚀 部署文档 (Deployment Documentation)

本文档详细说明 Volunteer Platform 在 CI/CD 流程中的持续部署（CD）阶段。

---

## 部署概述

本项目的部署采用**自动化 CI/CD 流程**，通过 GitHub Actions 在推送到 `main` 分支时自动触发部署。部署过程分为 **6 个阶段**，依次执行，确保系统稳定可靠地部署到 Kubernetes 集群。

### 部署架构

- **目标环境**: Kubernetes 集群
- **命名空间**: `mywork`
- **部署方式**: 通过 SSH 连接到远程服务器执行部署命令
- **镜像存储**: containerd (Kubernetes 容器运行时)

### 部署流程概览

```
准备和构建镜像 → 导入镜像到 containerd → 部署基础设施 → 部署应用服务 → 部署网关和 Ingress → 验证部署状态
```

---

## 部署触发条件

部署仅在以下条件下触发：

- **事件类型**: `push` 事件
- **目标分支**: `main` 分支
- **前提条件**: 所有 PR 阶段的测试和扫描必须通过

### 部署前的检查

在部署开始前，系统会确保：

1. ✅ 代码已通过所有测试（单元测试、集成测试）
2. ✅ 代码已通过安全扫描（SAST、DAST、容器扫描）
3. ✅ 代码已通过性能测试
4. ✅ 代码已合并到 `main` 分支

---

## 部署阶段详解

### 阶段 1: 准备和构建镜像 (prepare_and_build)

**GitHub Actions Job**: `prepare_and_build`

**执行时机**: 推送到 `main` 分支时

**执行步骤**:

1. **代码检出**
   - 在远程服务器上检出最新代码

2. **更新代码**
   - 执行 `git pull` 获取最新代码

3. **构建 Docker 镜像**
   - 使用 `docker compose build` 构建所有服务镜像
   - 构建的镜像包括：
     - `jsrgzyc/user-service:latest`
     - `jsrgzyc/activity-service:latest`
     - `jsrgzyc/notification-service:latest`
     - `jsrgzyc/frontend:latest`

4. **验证镜像**
   - 检查镜像是否成功构建

**输出**:
- 构建完成的 Docker 镜像

**依赖**: 无（首个部署阶段）

---

### 阶段 2: 导入镜像到 containerd (import_images)

**GitHub Actions Job**: `import_images`

**执行时机**: `prepare_and_build` 完成后

**执行步骤**:

1. **镜像导入**
   - 将 Docker 镜像保存为 tar 文件
   - 使用 `ctr` 命令导入到 containerd 的 `k8s.io` 命名空间
   - 导入的镜像：
     - `jsrgzyc/user-service:latest`
     - `jsrgzyc/activity-service:latest`
     - `jsrgzyc/notification-service:latest`
     - `jsrgzyc/frontend:latest`

2. **验证镜像导入**
   - 使用 `ctr -n k8s.io images list` 检查镜像是否成功导入
   - 最多重试 10 次，每次间隔 2 秒
   - 如果超时未导入成功，部署失败

**输出**:
- containerd 中可用的镜像列表

**依赖**: `prepare_and_build`

---

### 阶段 3: 部署基础设施 (deploy_infrastructure)

**GitHub Actions Job**: `deploy_infrastructure`

**执行时机**: `import_images` 完成后

**执行步骤**:

1. **环境检查**
   - 检查 `kubectl` 是否可用
   - 验证 Kubernetes 集群连接

2. **创建命名空间**
   - 应用 `k8s/namespace.yaml`
   - 创建 `mywork` 命名空间（如果不存在）

3. **创建配置**
   - 应用 `k8s/configmap.yaml`
   - 创建应用配置 ConfigMap

4. **部署数据库**
   - 应用 `k8s/postgres-deployment.yaml`
   - 部署 PostgreSQL 数据库服务
   - 等待数据库部署完成（最多 300 秒）

**部署的资源**:
- **Namespace**: `mywork`
- **ConfigMap**: 应用配置
- **PostgreSQL Deployment**: 数据库部署
- **PostgreSQL Service**: 数据库服务（ClusterIP）

**输出**:
- 基础设施资源状态

**依赖**: `import_images`

---

### 阶段 4: 部署应用服务 (deploy_services)

**GitHub Actions Job**: `deploy_services`

**执行时机**: `deploy_infrastructure` 完成后

**执行步骤**:

1. **部署微服务**
   - 应用 `k8s/microservices-deployments.yaml`
     - 部署 `user-service` (3 副本)
     - 部署 `activity-service` (3 副本)
     - 部署 `notification-service` (3 副本)
   - 应用 `k8s/microservices-services.yaml`
     - 创建微服务的 Service 资源

2. **部署前端**
   - 应用 `k8s/frontend-deployment.yaml`
   - 部署 `frontend-service`

3. **等待服务就绪**
   - 等待以下部署就绪（最多 300 秒）：
     - `user-service`
     - `activity-service`
     - `notification-service`
     - `frontend-service`

**部署的资源**:
- **User Service Deployment**: 3 副本
- **Activity Service Deployment**: 3 副本
- **Notification Service Deployment**: 3 副本
- **Frontend Service Deployment**: 前端服务
- **微服务 Services**: ClusterIP 类型的服务

**输出**:
- 应用服务 Pod 状态

**依赖**: `deploy_infrastructure`

---

### 阶段 5: 部署网关和 Ingress (deploy_gateway)

**GitHub Actions Job**: `deploy_gateway`

**执行时机**: `deploy_services` 完成后

**执行步骤**:

1. **部署 Nginx 网关**
   - 应用 `k8s/nginx-deployment.yaml`
   - 部署 `nginx-gateway` (2 副本)
   - 等待网关部署完成（最多 300 秒）

2. **部署 Ingress**
   - 应用 `k8s/ingress-nginx-controller.yaml`
   - 应用 `k8s/ingress.yaml`
   - 配置 Ingress 路由规则

**部署的资源**:
- **Nginx Gateway Deployment**: 2 副本
- **Nginx Gateway Service**: ClusterIP 类型
- **Ingress Controller**: Nginx Ingress Controller
- **Ingress**: 路由规则配置

**输出**:
- 网关和 Ingress 状态

**依赖**: `deploy_services`

---

### 阶段 6: 验证部署状态 (verify_deployment)

**GitHub Actions Job**: `verify_deployment`

**执行时机**: `deploy_gateway` 完成后

**执行步骤**:

1. **检查资源状态**
   - 列出所有 Pods: `kubectl get pods -n mywork`
   - 列出所有 Services: `kubectl get services -n mywork`
   - 列出所有 Ingress: `kubectl get ingress -n mywork`
   - 列出所有 ConfigMaps: `kubectl get configmaps -n mywork`
   - 列出所有 Deployments: `kubectl get deployments -n mywork`

2. **获取访问信息**
   - Ingress 访问地址: `kubectl get ingress -n mywork -o wide`
   - NodePort 访问地址: `kubectl get service nginx-gateway-nodeport -n mywork -o wide`
   - 集群内访问地址: `kubectl get service nginx-gateway-service -n mywork -o jsonpath='{.spec.clusterIP}'`

3. **生成部署摘要**
   - 在 GitHub Actions 中生成部署摘要
   - 显示所有部署阶段的状态
   - 列出已部署的服务

**输出**:
- 完整的资源状态报告
- 访问地址信息
- GitHub Actions 部署摘要

**依赖**: `deploy_gateway`

---

## 部署的 Kubernetes 资源

### 命名空间 (Namespace)

- **名称**: `mywork`
- **用途**: 隔离所有应用资源

### 配置 (ConfigMap)

- **名称**: `nginx-config`
- **用途**: 存储 Nginx 网关配置

### 数据库 (PostgreSQL)

- **Deployment**: `postgres`
- **Service**: `postgres` (ClusterIP, 端口 5432)
- **镜像**: `postgres:13`
- **副本数**: 1

### 微服务

#### User Service
- **Deployment**: `user-service`
- **Service**: `user-service` (ClusterIP, 端口 8000)
- **镜像**: `jsrgzyc/user-service:latest`
- **副本数**: 3
- **健康检查**: `/api/v1/health/`

#### Activity Service
- **Deployment**: `activity-service`
- **Service**: `activity-service` (ClusterIP, 端口 8000)
- **镜像**: `jsrgzyc/activity-service:latest`
- **副本数**: 3
- **健康检查**: `/api/v1/health/`

#### Notification Service
- **Deployment**: `notification-service`
- **Service**: `notification-service` (ClusterIP, 端口 8000)
- **镜像**: `jsrgzyc/notification-service:latest`
- **副本数**: 3
- **健康检查**: `/api/v1/health/`

### 前端服务

- **Deployment**: `frontend-service`
- **镜像**: `jsrgzyc/frontend:latest`
- **副本数**: 根据配置

### 网关服务

- **Deployment**: `nginx-gateway`
- **Service**: `nginx-gateway-service` (ClusterIP, 端口 80)
- **镜像**: `nginx:1.25-alpine`
- **副本数**: 2
- **健康检查**: `/health`

### Ingress

- **Ingress Controller**: Nginx Ingress Controller
- **Ingress**: 配置路由规则，将外部流量路由到内部服务

---

## 部署验证

### 自动验证

部署流程会自动验证：

1. ✅ **镜像导入**: 所有镜像成功导入到 containerd
2. ✅ **基础设施**: 命名空间、ConfigMap、数据库部署成功
3. ✅ **应用服务**: 所有微服务和前端服务部署成功
4. ✅ **网关服务**: Nginx 网关和 Ingress 部署成功
5. ✅ **资源状态**: 所有 Pods、Services、Ingress 正常运行

### 手动验证

部署完成后，可以手动验证：

```bash
# 检查所有 Pods 状态
kubectl get pods -n mywork

# 检查所有 Services
kubectl get services -n mywork

# 检查所有 Deployments
kubectl get deployments -n mywork

# 检查 Ingress
kubectl get ingress -n mywork

# 查看 Pod 日志
kubectl logs <pod-name> -n mywork

# 查看服务描述
kubectl describe service <service-name> -n mywork
```

### 健康检查

所有服务都配置了健康检查端点：

- **微服务**: `/api/v1/health/`
- **Nginx 网关**: `/health`

可以通过以下方式检查服务健康状态：

```bash
# 在 Pod 内检查
kubectl exec <pod-name> -n mywork -- curl http://localhost:8000/api/v1/health/

# 通过 Service 检查
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- \
  curl http://user-service:8000/api/v1/health/
```

---

## 故障排查

### 常见问题

#### 1. 镜像构建失败

**症状**: `prepare_and_build` 阶段失败

**可能原因**:
- Docker 构建错误
- 依赖项安装失败
- Dockerfile 配置错误

**解决方法**:
```bash
# 在远程服务器上手动构建
cd /home/project/Volunteer-platform
docker compose build --no-cache
```

#### 2. 镜像导入失败

**症状**: `import_images` 阶段超时或失败

**可能原因**:
- containerd 未运行
- 镜像文件损坏
- 磁盘空间不足

**解决方法**:
```bash
# 检查 containerd 状态
systemctl status containerd

# 检查镜像是否存在
docker images | grep jsrgzyc

# 手动导入镜像
docker save jsrgzyc/user-service:latest | ctr -n k8s.io images import -
```

#### 3. 数据库部署失败

**症状**: `deploy_infrastructure` 阶段数据库未就绪

**可能原因**:
- 资源不足
- 配置错误
- 端口冲突

**解决方法**:
```bash
# 检查数据库 Pod 状态
kubectl get pods -n mywork | grep postgres

# 查看数据库 Pod 日志
kubectl logs -n mywork <postgres-pod-name>

# 检查数据库事件
kubectl describe pod <postgres-pod-name> -n mywork
```

#### 4. 服务部署失败

**症状**: `deploy_services` 阶段服务未就绪

**可能原因**:
- 镜像拉取失败
- 健康检查失败
- 资源限制

**解决方法**:
```bash
# 检查服务 Pod 状态
kubectl get pods -n mywork

# 查看 Pod 日志
kubectl logs <pod-name> -n mywork

# 查看 Pod 事件
kubectl describe pod <pod-name> -n mywork

# 检查镜像是否存在
ctr -n k8s.io images list | grep jsrgzyc
```

#### 5. 网关部署失败

**症状**: `deploy_gateway` 阶段网关未就绪

**可能原因**:
- ConfigMap 配置错误
- 端口冲突
- 资源限制

**解决方法**:
```bash
# 检查 Nginx 配置
kubectl get configmap nginx-config -n mywork -o yaml

# 查看网关 Pod 日志
kubectl logs -n mywork -l app=nginx-gateway

# 检查网关服务
kubectl get service nginx-gateway-service -n mywork
```

### 回滚部署

如果需要回滚到之前的版本：

```bash
# 查看部署历史
kubectl rollout history deployment/<deployment-name> -n mywork

# 回滚到上一个版本
kubectl rollout undo deployment/<deployment-name> -n mywork

# 回滚到指定版本
kubectl rollout undo deployment/<deployment-name> -n mywork --to-revision=<revision-number>
```

### 删除部署

如果需要完全删除部署：

```bash
# 删除所有资源（谨慎操作！）
kubectl delete namespace mywork

# 或者使用部署脚本
cd k8s
./deploy.sh dev delete
```

---

## 手动部署

如果需要手动执行部署（不通过 CI/CD），可以使用以下方法：

### 方法 1: 使用部署脚本

```bash
cd k8s
./deploy.sh dev deploy
```

### 方法 2: 手动执行部署步骤

```bash
# 1. 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 2. 创建配置
kubectl apply -f k8s/configmap.yaml

# 3. 部署数据库
kubectl apply -f k8s/postgres-deployment.yaml

# 4. 部署微服务
kubectl apply -f k8s/microservices-deployments.yaml
kubectl apply -f k8s/microservices-services.yaml

# 5. 部署前端
kubectl apply -f k8s/frontend-deployment.yaml

# 6. 部署网关
kubectl apply -f k8s/nginx-deployment.yaml

# 7. 部署 Ingress
kubectl apply -f k8s/ingress-nginx-controller.yaml
kubectl apply -f k8s/ingress.yaml

# 8. 检查状态
kubectl get all -n mywork
```

### 方法 3: 使用 Docker Compose（本地开发）

```bash
docker compose up -d --build
```

---

## 部署时间线

典型的部署时间线：

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

## 部署监控

### GitHub Actions 摘要

每次部署完成后，GitHub Actions 会生成一个部署摘要，包括：

- ✅ 所有部署阶段的状态
- ✅ 已部署的服务列表
- ✅ 部署时间和持续时间

### Kubernetes 资源监控

可以使用以下命令监控部署状态：

```bash
# 实时查看 Pod 状态
kubectl get pods -n mywork -w

# 查看所有资源状态
kubectl get all -n mywork

# 查看资源使用情况
kubectl top pods -n mywork
kubectl top nodes
```

---

## 最佳实践

1. **渐进式部署**: 部署过程分为多个阶段，确保每个阶段成功后再继续
2. **健康检查**: 所有服务都配置了健康检查，确保服务正常运行
3. **资源验证**: 部署前验证所有必需资源（镜像、配置等）
4. **错误处理**: 每个阶段都有错误处理和重试机制
5. **状态监控**: 部署完成后自动验证所有资源状态

---

## 总结

本项目的部署流程采用**自动化、分阶段、可验证**的方式，确保系统能够稳定可靠地部署到 Kubernetes 集群。通过详细的日志和状态检查，可以快速定位和解决部署过程中的问题。

如有任何问题，请参考：
- [故障排查](#故障排查) 章节
- Kubernetes 官方文档
- 项目 README 文件

