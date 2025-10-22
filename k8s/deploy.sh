#!/bin/bash

# Volunteer Platform Kubernetes 部署脚本
# 使用方法: ./deploy.sh [环境] [操作]
# 环境: dev, staging, prod
# 操作: deploy, delete, update

set -e

ENVIRONMENT=${1:-dev}
OPERATION=${2:-deploy}
NAMESPACE="mywork"

echo "🚀 开始执行 Volunteer Platform"
echo "环境: $ENVIRONMENT"
echo "操作: $OPERATION"
echo "命名空间: $NAMESPACE"

# 检查 kubectl 是否可用
echo "🔍 检查 kubectl 是否可用..."
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 未安装或不在 PATH 中"
    exit 1
else
    echo "✅ kubectl 可用"
fi

# 检查集群连接
echo "🔗 检查 Kubernetes 集群连接..."
# 尝试快速检测 kubectl 与 API server 连通性
if kubectl cluster-info >/dev/null 2>&1; then
    echo "✅ Kubernetes 集群连接正常"
else
    echo "❌ 无法连接到 Kubernetes 集群，请检查 kubeconfig、网络与集群状态"
    exit 1
fi

# 创建命名空间
create_namespace() {
    echo "📦 创建命名空间..."
    kubectl apply -f namespace.yaml
}

# 创建 ConfigMap
create_config() {
    echo "⚙️  创建配置..."
    kubectl apply -f configmap.yaml
}

# 创建数据库服务
deploy_databases() {
    echo "🗄️  部署数据库服务..."
    kubectl apply -f postgres-deployment.yaml
}

# 部署前端
deploy_frontend() {
    echo "🔧 部署前端..."
    kubectl apply -f frontend-deployment.yaml
}

# 部署微服务
deploy_microservices() {
    echo "🔧 部署微服务..."
    kubectl apply -f microservices-deployments.yaml
    kubectl apply -f microservices-services.yaml
}

# 部署 nginx 网关（等待其他服务启动后）
deploy_gateway() {
    echo "🌐 部署 nginx 网关..."
    kubectl apply -f nginx-deployment.yaml
}

# 部署 Ingress
deploy_ingress() {
    echo "🚪 部署 Ingress..."
    kubectl apply -f ingress.yaml
    kubectl apply -f ingress-nginx-controller.yaml
}

# 等待基础服务部署完成
wait_for_base_services() {
    echo "⏳ 等待基础服务部署完成..."
    
    base_deployments=(
        "postgres"
        "user-service"
        "activity-service"
        "notification-service"
        "frontend-service"
    )
    
    for deployment in "${base_deployments[@]}"; do
        echo "等待 $deployment 就绪..."
        kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n $NAMESPACE
    done
}

# 等待nginx网关部署完成
wait_for_gateway() {
    echo "⏳ 等待 nginx 网关部署完成..."
    kubectl wait --for=condition=available --timeout=300s deployment/nginx-gateway -n $NAMESPACE
}

# 检查服务状态
check_status() {
    echo "📊 检查服务状态..."
    
    echo "=== Pods ==="
    kubectl get pods -n $NAMESPACE
    
    echo "=== Services ==="
    kubectl get services -n $NAMESPACE
    
    echo "=== Ingress ==="
    kubectl get ingress -n $NAMESPACE
    
    echo "=== ConfigMaps ==="
    kubectl get configmaps -n $NAMESPACE

    echo "=== Deployments ==="
    kubectl get deployments -n $NAMESPACE

}

# 获取访问信息
get_access_info() {
    echo "🔗 获取访问信息..."
    
    # 获取 Ingress 信息
    echo "=== Ingress 访问地址 ==="
    kubectl get ingress -n $NAMESPACE -o wide
    
    # 获取 NodePort 信息
    echo "=== NodePort 访问地址 ==="
    kubectl get service nginx-gateway-nodeport -n $NAMESPACE -o wide
    
    # 获取集群 IP
    CLUSTER_IP=$(kubectl get service nginx-gateway-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    echo "=== 集群内访问地址 ==="
    echo "http://$CLUSTER_IP"
}

# 删除部署
delete_deployment() {
    echo "🗑️  开始删除部署..."
    
    echo "1/7 删除 Ingress..."
    kubectl delete -f ingress.yaml --ignore-not-found=true
    kubectl delete -f ingress-nginx-controller.yaml --ignore-not-found=true
    
    echo "2/7 删除 Nginx 网关..."
    kubectl delete -f nginx-deployment.yaml --ignore-not-found=true
    
    echo "3/7 删除微服务..."
    if kubectl get services -n $NAMESPACE 2>/dev/null | grep -q .; then
        kubectl delete -f microservices-services.yaml --ignore-not-found=true
        kubectl delete -f frontend-deployment.yaml --ignore-not-found=true
        echo "等待服务删除完成..."
        kubectl wait --for=delete --all services --timeout=30s -n $NAMESPACE 2>/dev/null || true
    fi
    
    echo "4/7 删除微服务部署..."
    if kubectl get deployments -n $NAMESPACE 2>/dev/null | grep -q .; then
        kubectl delete -f microservices-deployments.yaml --ignore-not-found=true
        echo "等待 Pod 删除完成..."
        kubectl wait --for=delete --all pods --timeout=60s -n $NAMESPACE 2>/dev/null || true
    fi

    echo "5/7 删除 Postgres 资源..."
    if kubectl get deployments -n $NAMESPACE | grep -q postgres; then
        echo "删除 Postgres 部署和服务..."
        kubectl delete -f postgres-deployment.yaml --ignore-not-found=true
        echo "等待 Postgres Pod 删除完成..."
        kubectl wait --for=delete deployment/postgres --timeout=60s -n $NAMESPACE 2>/dev/null || true
    fi
    
    echo "6/7 删除配置映射..."
    kubectl delete -f configmap.yaml --ignore-not-found=true
    
    echo "7/7 删除命名空间..."
    kubectl delete -f namespace.yaml --ignore-not-found=true
    
    echo "删除部署完成"
}

# 更新部署
update_deployment() {
    echo "🔄 更新部署..."
    
    kubectl apply -f configmap.yaml
    kubectl apply -f microservices-deployments.yaml
    kubectl apply -f frontend-deployment.yaml
    kubectl apply -f nginx-deployment.yaml
    kubectl apply -f ingress-nginx-controller.yaml
    kubectl apply -f ingress.yaml
    
    echo "⏳ 等待更新完成..."
    wait_for_base_services
    wait_for_gateway
}

# 主逻辑
case $OPERATION in
    "deploy")
        create_namespace
        create_config
        deploy_databases
        deploy_microservices
        deploy_frontend
        wait_for_base_services
        deploy_gateway
        wait_for_gateway
        deploy_ingress
        check_status
        get_access_info
        echo "✅ 部署完成！"
        ;;
    "delete")
        delete_deployment
        ;;
    "update")
        update_deployment
        check_status
        echo "✅ 更新完成！"
        ;;
    "status")
        check_status
        ;;
    *)
        echo "❌ 未知操作: $OPERATION"
        echo "可用操作: deploy, delete, update, status"
        exit 1
        ;;
esac

echo "🎉 操作完成！"
