#!/bin/bash

echo "🔍 诊断外部访问问题..."
echo "服务器IP: 47.84.114.53"
echo ""

# 1. 检查NodePort服务
echo "1. 检查NodePort服务状态..."
kubectl get service nginx-gateway-nodeport -n mywork -o wide
echo ""

# 2. 检查Ingress Controller
echo "2. 检查Ingress Controller状态..."
kubectl get pods -n ingress-nginx 2>/dev/null || echo "❌ ingress-nginx命名空间不存在"
kubectl get services -n ingress-nginx 2>/dev/null || echo "❌ ingress-nginx服务不存在"
echo ""

# 3. 检查Ingress状态
echo "3. 检查Ingress状态..."
kubectl get ingress -n mywork
kubectl describe ingress mywork-ingress -n mywork
echo ""

# 4. 检查防火墙和端口
echo "4. 检查端口监听状态..."
echo "检查80端口:"
netstat -tlnp | grep :80 || echo "❌ 端口80没有监听"
echo "检查30080端口:"
netstat -tlnp | grep :30080 || echo "❌ 端口30080没有监听"
echo ""

# 5. 检查iptables规则
echo "5. 检查iptables规则..."
iptables -L -n | grep -E "(80|30080)" || echo "ℹ️  没有找到相关的iptables规则"
echo ""

# 6. 检查云服务商安全组（提示）
echo "6. 云服务商安全组检查提示:"
echo "请检查您的云服务商控制台，确保以下端口已开放："
echo "- 入站规则: 80/tcp (HTTP)"
echo "- 入站规则: 443/tcp (HTTPS)" 
echo "- 入站规则: 30080/tcp (NodePort)"
echo ""

# 7. 检查kube-proxy配置
echo "7. 检查kube-proxy配置..."
kubectl get configmap kube-proxy -n kube-system -o yaml | grep -A 5 -B 5 "mode" || echo "ℹ️  无法获取kube-proxy配置"
echo ""

# 8. 测试内部访问
echo "8. 测试内部访问..."
kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -qO- http://nginx-gateway-service.mywork.svc.cluster.local/health 2>/dev/null || echo "❌ 内部访问测试失败"
echo ""

echo "🔧 可能的解决方案："
echo ""
echo "方案1: 使用NodePort访问"
echo "  http://47.84.114.53:30080"
echo ""
echo "方案2: 配置LoadBalancer服务"
echo "  kubectl patch service nginx-gateway-nodeport -n mywork -p '{\"spec\":{\"type\":\"LoadBalancer\"}}'"
echo ""
echo "方案3: 安装和配置nginx-ingress-controller"
echo "  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml"
echo ""
echo "方案4: 检查防火墙设置"
echo "  sudo ufw allow 80"
echo "  sudo ufw allow 443" 
echo "  sudo ufw allow 30080"
echo ""
echo "方案5: 检查云服务商安全组"
echo "  确保开放80, 443, 30080端口"
