#!/bin/bash

echo "🚀 修复nginx-ingress-controller外部访问问题..."

# 1. 检查当前状态
echo "1. 检查当前状态..."
kubectl get service ingress-nginx-controller -n ingress-nginx

# 2. 获取访问信息
EXTERNAL_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
NODEPORT=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)

echo ""
echo "当前访问方式："
if [ -n "$EXTERNAL_IP" ]; then
    echo "✅ LoadBalancer: http://$EXTERNAL_IP"
else
    echo "❌ LoadBalancer不可用"
fi

if [ -n "$NODEPORT" ]; then
    echo "✅ NodePort: http://47.84.114.53:$NODEPORT"
else
    echo "❌ NodePort不可用"
fi

# 3. 如果都没有，强制配置NodePort
if [ -z "$EXTERNAL_IP" ] && [ -z "$NODEPORT" ]; then
    echo ""
    echo "3. 强制配置NodePort..."
    kubectl patch service ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"NodePort"}}'
    
    # 等待配置生效
    sleep 5
    
    # 重新获取NodePort
    NODEPORT=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
    if [ -n "$NODEPORT" ]; then
        echo "✅ NodePort配置成功: $NODEPORT"
        echo "访问地址: http://47.84.114.53:$NODEPORT"
    fi
fi

# 4. 应用您的Ingress配置
echo ""
echo "4. 应用您的Ingress配置..."
kubectl apply -f ingress.yaml

# 5. 检查Ingress状态
echo "5. 检查Ingress状态..."
kubectl get ingress -n mywork

# 6. 测试访问
echo ""
echo "6. 测试访问..."
if [ -n "$EXTERNAL_IP" ]; then
    echo "测试LoadBalancer: curl -I http://$EXTERNAL_IP"
    curl -I http://$EXTERNAL_IP 2>/dev/null || echo "❌ LoadBalancer访问失败"
fi

if [ -n "$NODEPORT" ]; then
    echo "测试NodePort: curl -I http://47.84.114.53:$NODEPORT"
    curl -I http://47.84.114.53:$NODEPORT 2>/dev/null || echo "❌ NodePort访问失败"
fi

# 7. 检查您的NodePort服务
echo ""
echo "7. 检查您的NodePort服务..."
kubectl get service nginx-gateway-nodeport -n mywork
echo "测试您的NodePort: curl -I http://47.84.114.53:30080"
curl -I http://47.84.114.53:30080 2>/dev/null || echo "❌ 您的NodePort访问失败"

# 8. 提供最终解决方案
echo ""
echo "🎯 最终访问方式："
echo "1. 您的NodePort服务: http://47.84.114.53:30080"
if [ -n "$NODEPORT" ]; then
    echo "2. Ingress Controller NodePort: http://47.84.114.53:$NODEPORT"
fi
if [ -n "$EXTERNAL_IP" ]; then
    echo "3. LoadBalancer: http://$EXTERNAL_IP"
fi

echo ""
echo "🔍 如果仍然无法访问，请检查："
echo "1. 防火墙设置: sudo ufw allow 80 && sudo ufw allow 443"
echo "2. 云服务商安全组设置"
echo "3. 网络连接: ping 47.84.114.53"
