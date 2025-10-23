# 简化CI/CD工作流说明

本项目使用简化的GitHub Actions工作流，专注于基础测试和部署功能。

## 📋 工作流概览

### `simple-cicd.yml` - 简化CI/CD流程
- **触发条件**: 推送到main/develop分支，PR到main/develop分支
- **功能**: 
  - 运行所有服务测试（用户、活动、通知、前端）
  - 自动部署到Kubernetes集群
  - 健康检查和状态验证

## 🚀 使用方法

### 自动触发
- 推送到 `main` 或 `develop` 分支时自动运行
- 创建Pull Request时自动运行测试

### 手动触发
```bash
# 查看工作流状态
gh run list

# 查看特定工作流状态
gh run list --workflow=simple-cicd.yml

# 查看工作流日志
gh run view <run-id>
```

## 🔧 配置要求

### 必需的Secrets

在GitHub仓库设置中添加以下secrets：

- `KUBE_CONFIG`: Base64编码的kubeconfig文件

## 📊 工作流程

1. **测试阶段**:
   - 用户服务测试
   - 活动服务测试  
   - 通知服务测试
   - 前端测试

2. **部署阶段** (仅main分支):
   - 部署到Kubernetes集群
   - 健康检查
   - 状态验证

## 🔍 故障排除

### 常见问题

1. **测试失败**:
   - 检查数据库连接
   - 验证环境变量
   - 查看详细日志

2. **部署失败**:
   - 检查Kubernetes配置
   - 查看Pod状态
   - 验证服务连通性

### 调试命令

```bash
# 查看Pod状态
kubectl get pods -n mywork

# 查看服务日志
kubectl logs -n mywork -l app=user-service

# 检查资源使用
kubectl top pods -n mywork

# 查看Ingress状态
kubectl get ingress -n mywork
```

## 📚 相关文档

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Kubernetes文档](https://kubernetes.io/docs/)
- [项目部署脚本](k8s/deploy.sh)
