#!/bin/bash

echo "🚀 创建LoadBalancer服务用于外部访问..."

# 1. 创建LoadBalancer服务
echo "1. 创建LoadBalancer服务..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: nginx-gateway-loadbalancer
  namespace: mywork
spec:
  type: LoadBalancer
  selector:
    app: nginx-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
EOF

# 2. 等待LoadBalancer分配外部IP
echo "2. 等待LoadBalancer分配外部IP..."
kubectl get service nginx-gateway-loadbalancer -n mywork

# 3. 检查外部IP
echo "3. 检查外部IP..."
EXTERNAL_IP=$(kubectl get service nginx-gateway-loadbalancer -n mywork -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$EXTERNAL_IP" ]; then
    echo "✅ LoadBalancer外部IP: $EXTERNAL_IP"
    echo "访问地址: http://$EXTERNAL_IP"
else
    echo "⚠️  LoadBalancer还没有分配外部IP，请等待几分钟..."
    echo "或者检查云服务商是否支持LoadBalancer"
fi

# 4. 如果LoadBalancer不可用，使用NodePort
echo "4. 如果LoadBalancer不可用，使用NodePort..."
NODEPORT=$(kubectl get service nginx-gateway-nodeport -n mywork -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$NODEPORT" ]; then
    echo "✅ NodePort服务可用: http://47.84.114.53:$NODEPORT"
fi

echo ""
echo "🎯 推荐访问方式："
echo "1. LoadBalancer: http://$EXTERNAL_IP (如果可用)"
echo "2. NodePort: http://47.84.114.53:30080"
echo "3. 直接IP: http://47.84.114.53 (需要配置Ingress Controller)"

echo ""
echo "🔍 如果仍然无法访问，请检查："
echo "1. 云服务商是否支持LoadBalancer"
echo "2. 防火墙和安全组设置"
echo "3. 运行诊断脚本: ./diagnose-external-access.sh"
