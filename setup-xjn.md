# 如何本地启动这个项目
1. git pull (目前xjn这个分支可以通过这个办法成功启动)
2. 打开项目文件夹，进入./Volunteer-website文件夹
3. 在电脑中启动Docker Desktop应用
4. 在终端输入 ```docker compose up -d```命令，
   -d 表示在后台运行（ detached模式）。此命令会构建镜像（如果需要）、创建并启动所有定义的服务、网络和数据卷。
5. 使用 docker compose logs 查看所有服务的日志。添加 -f 可以实时跟踪日志输出，添加服务名（如 docker compose logs web -f）可以查看特定服务的日志。
使用 docker compose ps 查看所有容器的状态，确认它们是否都处于 "Up" 状态。
6. 停止项目```docker compose down```