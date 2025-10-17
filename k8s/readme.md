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

# 使用 minikube image load（把本地 image 导入到 minikube）
docker pull localhost:5000/volunteer-platform/user-service:latest   # 如果在本地 registry
minikube image load localhost:5000/volunteer-platform/user-service:latest
kubectl apply -f k8s/microservices-deployments.yaml

# 添加可执行文件权限(只需要执行一次)
chmod +x ./deploy.sh

# 启动ingress-controller(kubernetes环境)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 启动ingress-controller(minikube环境)
minikube addons enable ingress

# 部署服务
./deploy.sh dev deploy

# 检查 Pod 状态
kubectl get pods -n volunteer-platform