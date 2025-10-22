#!/bin/bash

echo "🚀 快速修复外部访问问题..."

# 1. 确保NodePort服务存在
echo "1. 确保NodePort服务存在..."
kubectl apply -f ingress.yaml

# 2. 检查NodePort服务状态
echo "2. 检查NodePort服务状态..."
NODEPORT=$(kubectl get service nginx-gateway-nodeport -n mywork -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$NODEPORT" ]; then
    echo "✅ NodePort服务存在，端口: $NODEPORT"
else
    echo "❌ NodePort服务不存在，正在创建..."
    kubectl apply -f ingress.yaml
fi

# 3. 检查防火墙设置
echo "3. 检查防火墙设置..."
if command -v ufw &> /dev/null; then
    echo "检查UFW防火墙状态..."
    sudo ufw status | grep -E "(80|443|30080)" || echo "⚠️  防火墙可能阻止了端口访问"
    echo "如果需要，运行以下命令开放端口："
    echo "  sudo ufw allow 80"
    echo "  sudo ufw allow 443"
    echo "  sudo ufw allow 30080"
else
    echo "ℹ️  UFW防火墙未安装，请检查其他防火墙设置"
fi

# 4. 检查端口监听
echo "4. 检查端口监听状态..."
netstat -tlnp | grep -E ":80|:30080" || echo "⚠️  端口没有监听，可能服务未启动"

# 5. 提供访问方式
echo ""
echo "🌐 访问方式："
echo "主要方式: http://47.84.114.53:30080"
echo "备用方式: http://47.84.114.53 (如果配置了Ingress Controller)"
echo ""

# 6. 测试命令
echo "🔍 测试命令："
echo "curl -I http://47.84.114.53:30080"
echo "telnet 47.84.114.53 30080"
echo ""

# 7. 如果还是不行，提供LoadBalancer方案
echo "🔧 如果NodePort仍然无法访问，尝试LoadBalancer："
echo "kubectl patch service nginx-gateway-nodeport -n mywork -p '{\"spec\":{\"type\":\"LoadBalancer\"}}'"
echo ""

echo "📋 检查清单："
echo "□ NodePort服务运行正常"
echo "□ 端口30080在监听"
echo "□ 防火墙允许30080端口"
echo "□ 云服务商安全组开放30080端口"
echo "□ 网络连接正常"
