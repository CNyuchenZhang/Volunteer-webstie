#!/bin/bash

echo "🔧 修复外部访问问题..."

# 1. 重新应用Ingress配置
echo "1. 重新应用Ingress配置..."
kubectl apply -f ingress.yaml

# 2. 检查并创建NodePort服务（作为备用方案）
echo "2. 确保NodePort服务可用..."
kubectl apply -f ingress.yaml

# 3. 检查服务状态
echo "3. 检查服务状态..."
kubectl get services -n mywork

# 4. 获取访问信息
echo ""
echo "🌐 访问方式："
echo ""

# 检查Ingress Controller
INGRESS_IP=$(kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$INGRESS_IP" ]; then
    echo "✅ 通过Ingress访问: http://$INGRESS_IP"
else
    echo "❌ Ingress Controller没有外部IP"
fi

# 检查NodePort
NODEPORT=$(kubectl get service nginx-gateway-nodeport -n mywork -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$NODEPORT" ]; then
    echo "✅ 通过NodePort访问: http://47.84.114.53:$NODEPORT"
else
    echo "❌ NodePort服务不可用"
fi

echo ""
echo "🔍 如果仍然无法访问，请检查："
echo "1. 服务器防火墙设置"
echo "2. 云服务商安全组设置"
echo "3. Ingress Controller是否正常运行"
echo "4. 运行诊断脚本: ./diagnose-access.sh"
