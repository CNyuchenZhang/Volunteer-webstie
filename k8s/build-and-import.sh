#!/bin/bash

echo "🚀 构建并导入镜像到containerd..."

# 1. 构建所有镜像
echo "1. 构建所有镜像..."
docker compose build

# 2. 标记镜像
echo "2. 标记镜像..."
docker tag volunteer-platform_user-service:latest jsrgzyc/user-service:latest
docker tag volunteer-platform_activity-service:latest jsrgzyc/activity-service:latest
docker tag volunteer-platform_notification-service:latest jsrgzyc/notification-service:latest
docker tag volunteer-platform_frontend-service:latest jsrgzyc/frontend:latest

# 3. 导入镜像到containerd
echo "3. 导入镜像到containerd..."
echo "导入user-service..."
docker save jsrgzyc/user-service:latest | ctr -n k8s.io images import -

echo "导入activity-service..."
docker save jsrgzyc/activity-service:latest | ctr -n k8s.io images import -

echo "导入notification-service..."
docker save jsrgzyc/notification-service:latest | ctr -n k8s.io images import -

echo "导入frontend..."
docker save jsrgzyc/frontend:latest | ctr -n k8s.io images import -

# 4. 检查镜像
echo "4. 检查镜像..."
ctr -n k8s.io images list | grep jsrgzyc

# 5. 清理Docker镜像（可选）
echo "5. 清理Docker镜像（可选）..."
read -p "是否清理Docker镜像？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker rmi jsrgzyc/user-service:latest
    docker rmi jsrgzyc/activity-service:latest
    docker rmi jsrgzyc/notification-service:latest
    docker rmi jsrgzyc/frontend:latest
    echo "✅ Docker镜像已清理"
fi

echo ""
echo "🎯 构建完成！"
echo "现在您可以在kubeadm集群中使用这些镜像了"

echo ""
echo "📋 检查清单："
echo "□ 镜像构建成功"
echo "□ 镜像标记正确"
echo "□ 镜像导入到containerd"
echo "□ 镜像在k8s.io命名空间中可用"
