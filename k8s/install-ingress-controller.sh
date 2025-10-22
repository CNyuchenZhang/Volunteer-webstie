#!/bin/bash

echo "🚀 安装和配置nginx-ingress-controller..."

# 1. 检查当前状态
echo "1. 检查当前Ingress Controller状态..."
kubectl get pods -n ingress-nginx 2>/dev/null || echo "❌ ingress-nginx命名空间不存在"

# 2. 安装nginx-ingress-controller
echo "2. 安装nginx-ingress-controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 3. 等待Controller启动
echo "3. 等待Controller启动..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# 4. 检查Controller状态
echo "4. 检查Controller状态..."
kubectl get pods -n ingress-nginx
kubectl get services -n ingress-nginx

# 5. 获取外部IP
echo "5. 获取外部IP..."
INGRESS_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$INGRESS_IP" ]; then
    echo "✅ Ingress Controller外部IP: $INGRESS_IP"
    echo "访问地址: http://$INGRESS_IP"
else
    echo "⚠️  Ingress Controller没有外部IP，可能需要配置LoadBalancer"
fi

# 6. 如果使用NodePort，获取NodePort信息
echo "6. 检查NodePort配置..."
NODEPORT=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$NODEPORT" ]; then
    echo "✅ Ingress Controller NodePort: $NODEPORT"
    echo "访问地址: http://47.84.114.53:$NODEPORT"
fi

# 7. 应用您的Ingress配置
echo "7. 应用Ingress配置..."
kubectl apply -f ingress.yaml

# 8. 检查Ingress状态
echo "8. 检查Ingress状态..."
kubectl get ingress -n mywork
kubectl describe ingress mywork-ingress -n mywork

echo ""
echo "🎯 访问方式："
if [ -n "$INGRESS_IP" ]; then
    echo "✅ 通过Ingress Controller: http://$INGRESS_IP"
fi
if [ -n "$NODEPORT" ]; then
    echo "✅ 通过NodePort: http://47.84.114.53:$NODEPORT"
fi
echo "✅ 通过您的NodePort服务: http://47.84.114.53:30080"

echo ""
echo "🔍 如果仍然无法访问，请检查："
echo "1. 防火墙设置: sudo ufw allow 80 && sudo ufw allow 443"
echo "2. 云服务商安全组设置"
echo "3. 运行诊断脚本: ./diagnose-external-access.sh"
