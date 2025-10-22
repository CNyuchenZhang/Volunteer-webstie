# 流量架构图

## 流量流向

```
外部请求 → Ingress → Nginx Gateway → 后端服务
```

### 详细流程

1. **外部访问**
   - 用户通过浏览器访问 `http://volunteer-platform.local` 或 `http://localhost`
   - 请求首先到达 Kubernetes Ingress Controller

2. **Ingress 路由**
   - Ingress 将请求转发到 `nginx-gateway-service:80`
   - 支持多个主机名：`volunteer-platform.local`, `localhost`, 以及默认路由

3. **Nginx Gateway 处理**
   - Nginx Gateway 根据路径进行路由：
     - `/` → `frontend-service` (前端应用)
     - `/api/v1/users/` → `user-service` (用户服务)
     - `/api/v1/activities/` → `activity-service` (活动服务)
     - `/api/v1/notifications/` → `notification-service` (通知服务)
     - `/media/` → `user-service` (媒体文件)

4. **后端服务**
   - 所有后端服务统一使用端口 8000
   - 服务间通信使用 Kubernetes DNS 名称
   - 支持健康检查和负载均衡

## 部署文件

- `namespace.yaml` - 命名空间定义
- `configmap.yaml` - 应用配置
- `microservices-deployments.yaml` - 后端服务部署
- `microservices-services.yaml` - 后端服务配置
- `frontend-deployment.yaml` - 前端服务部署
- `nginx-deployment.yaml` - Nginx 网关部署
- `ingress.yaml` - Ingress 配置
- `deploy.sh` - 部署脚本

## 访问方式

1. **通过 Ingress (推荐)**
   - 主域名: `http://volunteer-platform.local`
   - 本地测试: `http://localhost`

2. **直接访问服务**
   - 前端: `http://<节点IP>:30080`
   - 用户服务: `http://<节点IP>:30081`
   - 活动服务: `http://<节点IP>:30082`

## 健康检查

所有服务都配置了 liveness 和 readiness 探针：
- 后端服务: `/api/v1/health/`
- 前端服务: `/health`
- Nginx 网关: `/health`
