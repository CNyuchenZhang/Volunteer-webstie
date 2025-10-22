#!/bin/bash

echo "🚀 导入现有镜像到containerd..."

# 1. 检查现有镜像
echo "1. 检查现有镜像..."
docker images | grep jsrgzyc

# 2. 导入镜像到containerd
echo "2. 导入镜像到containerd..."

echo "导入user-service..."
if docker images | grep -q "jsrgzyc/user-service"; then
    docker save jsrgzyc/user-service:latest | ctr -n k8s.io images import -
    echo "✅ user-service导入成功"
else
    echo "❌ user-service镜像不存在"
fi

echo "导入activity-service..."
if docker images | grep -q "jsrgzyc/activity-service"; then
    docker save jsrgzyc/activity-service:latest | ctr -n k8s.io images import -
    echo "✅ activity-service导入成功"
else
    echo "❌ activity-service镜像不存在"
fi

echo "导入notification-service..."
if docker images | grep -q "jsrgzyc/notification-service"; then
    docker save jsrgzyc/notification-service:latest | ctr -n k8s.io images import -
    echo "✅ notification-service导入成功"
else
    echo "❌ notification-service镜像不存在"
fi

echo "导入frontend..."
if docker images | grep -q "jsrgzyc/frontend"; then
    docker save jsrgzyc/frontend:latest | ctr -n k8s.io images import -
    echo "✅ frontend导入成功"
else
    echo "❌ frontend镜像不存在"
fi

# 3. 检查导入结果
echo "3. 检查导入结果..."
ctr -n k8s.io images list | grep jsrgzyc

echo ""
echo "🎯 导入完成！"
echo "现在您可以在kubeadm集群中使用这些镜像了"

echo ""
echo "📋 检查清单："
echo "□ 镜像存在"
echo "□ 镜像导入到containerd"
echo "□ 镜像在k8s.io命名空间中可用"
