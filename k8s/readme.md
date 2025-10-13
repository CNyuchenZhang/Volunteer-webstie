# 启动本地 Registry
docker run -d -p 5000:5000 --name registry registry:2

# 验证 Registry 运行状态
curl http://localhost:5000/v2/_catalog

# 构建所有服务
docker-compose build

# 推送镜像到本地仓库
docker-compose push

# 检查镜像是否成功推送到本地仓库
curl http://localhost:5000/v2/volunteer-platform/user-service/tags/list

# 重新部署服务
kubectl delete -f microservices-deployments.yaml
kubectl apply -f microservices-deployments.yaml

# 检查 Pod 状态
kubectl get pods -n volunteer-platform