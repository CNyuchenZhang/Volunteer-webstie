#!/bin/bash

echo "🔍 诊断外部访问问题..."
echo "服务器IP: 47.84.114.53"
echo ""

# 检查Ingress Controller
echo "1. 检查Ingress Controller状态..."
kubectl get pods -n ingress-nginx 2>/dev/null || echo "❌ ingress-nginx命名空间不存在或没有Pod"
echo ""

# 检查Ingress状态
echo "2. 检查Ingress状态..."
kubectl get ingress -n mywork
echo ""

# 检查Services
echo "3. 检查Services状态..."
kubectl get services -n mywork
echo ""

# 检查Pods状态
echo "4. 检查Pods状态..."
kubectl get pods -n mywork
echo ""

# 检查nginx-gateway服务详情
echo "5. 检查nginx-gateway服务详情..."
kubectl describe service nginx-gateway-service -n mywork
echo ""

# 检查Ingress详情
echo "6. 检查Ingress详情..."
kubectl describe ingress mywork-ingress -n mywork
echo ""

# 检查NodePort服务
echo "7. 检查NodePort服务..."
kubectl get service nginx-gateway-nodeport -n mywork
echo ""

# 检查防火墙状态（如果可能）
echo "8. 检查端口监听状态..."
netstat -tlnp | grep :80 || echo "❌ 端口80没有监听"
netstat -tlnp | grep :443 || echo "❌ 端口443没有监听"
echo ""

# 检查Ingress Controller的Service
echo "9. 检查Ingress Controller的Service..."
kubectl get services -n ingress-nginx 2>/dev/null || echo "❌ 无法获取ingress-nginx服务"
echo ""

echo "🔧 可能的解决方案："
echo "1. 如果Ingress Controller没有运行，请安装nginx-ingress-controller"
echo "2. 如果端口没有监听，请检查防火墙设置"
echo "3. 如果使用NodePort，请尝试访问: http://47.84.114.53:30080"
echo "4. 检查云服务商的安全组设置，确保开放80和443端口"
