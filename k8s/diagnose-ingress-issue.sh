#!/bin/bash

echo "🔍 诊断nginx-ingress-controller外部访问问题..."
echo ""

# 1. 检查ingress-nginx-controller服务状态
echo "1. 检查ingress-nginx-controller服务状态..."
kubectl get service ingress-nginx-controller -n ingress-nginx -o wide
echo ""

# 2. 检查服务详情
echo "2. 检查服务详情..."
kubectl describe service ingress-nginx-controller -n ingress-nginx
echo ""

# 3. 检查Pod状态
echo "3. 检查Pod状态..."
kubectl get pods -n ingress-nginx
echo ""

# 4. 检查外部IP
echo "4. 检查外部IP..."
EXTERNAL_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$EXTERNAL_IP" ]; then
    echo "✅ 外部IP: $EXTERNAL_IP"
else
    echo "❌ 没有外部IP"
fi

# 5. 检查NodePort
echo "5. 检查NodePort..."
NODEPORT=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$NODEPORT" ]; then
    echo "✅ NodePort: $NODEPORT"
    echo "访问地址: http://47.84.114.53:$NODEPORT"
else
    echo "❌ 没有NodePort"
fi

# 6. 检查您的Ingress配置
echo "6. 检查您的Ingress配置..."
kubectl get ingress -n mywork
kubectl describe ingress mywork-ingress -n mywork
echo ""

# 7. 检查端口监听
echo "7. 检查端口监听..."
netstat -tlnp | grep -E ":80|:443" || echo "❌ 端口80/443没有监听"
echo ""

# 8. 检查防火墙
echo "8. 检查防火墙..."
if command -v ufw &> /dev/null; then
    sudo ufw status | grep -E "(80|443)" || echo "⚠️  防火墙可能阻止了端口"
else
    echo "ℹ️  UFW防火墙未安装"
fi
echo ""

# 9. 提供解决方案
echo "🔧 可能的解决方案："
echo ""

if [ -z "$EXTERNAL_IP" ] && [ -z "$NODEPORT" ]; then
    echo "❌ 问题：ingress-nginx-controller服务没有外部访问方式"
    echo "解决方案："
    echo "1. 检查云服务商是否支持LoadBalancer"
    echo "2. 手动配置NodePort："
    echo "   kubectl patch service ingress-nginx-controller -n ingress-nginx -p '{\"spec\":{\"type\":\"NodePort\"}}'"
    echo "3. 或者使用您的NodePort服务：http://47.84.114.53:30080"
elif [ -n "$EXTERNAL_IP" ]; then
    echo "✅ 有外部IP，但可能无法访问"
    echo "解决方案："
    echo "1. 检查云服务商安全组设置"
    echo "2. 检查防火墙设置"
    echo "3. 测试访问: curl -I http://$EXTERNAL_IP"
elif [ -n "$NODEPORT" ]; then
    echo "✅ 有NodePort，但可能无法访问"
    echo "解决方案："
    echo "1. 测试访问: curl -I http://47.84.114.53:$NODEPORT"
    echo "2. 检查防火墙: sudo ufw allow $NODEPORT"
    echo "3. 检查云服务商安全组"
fi

echo ""
echo "🎯 推荐测试步骤："
echo "1. 测试您的NodePort服务: curl -I http://47.84.114.53:30080"
echo "2. 如果可用，这就是最简单的解决方案"
echo "3. 如果不可用，检查防火墙和安全组设置"
