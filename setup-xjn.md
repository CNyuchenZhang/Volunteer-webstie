# 如何本地启动这个项目
1. git pull (目前xjn这个分支可以通过这个办法成功启动)
2. 打开项目文件夹，进入./Volunteer-website文件夹
3. 在电脑中启动Docker Desktop应用（这个可能需要你搜一下docker的安装教程）
4. 在终端输入 ```docker compose up -d```命令，
   -d 表示在后台运行（ detached模式）。此命令会构建镜像（如果需要）、创建并启动所有定义的服务、网络和数据卷。
5. 使用 docker compose logs 查看所有服务的日志。
<br>·  添加 -f 可以实时跟踪日志输出，添加服务名（如 docker compose logs web -f）可以查看特定服务的日志。
<br>·  使用 ```docker compose ps``` 查看所有容器的状态，确认它们是否都处于 "Up" 状态。
6. 我不知道最开始的时候需不需要迁移数据库，目前最好手动迁移一下。```docker compose exec backend python manage.py migrate```
7. 停止项目```docker compose down```
8. ```docker compose build --no-cache```指令可以强制重新构建镜像，防止项目文件更改之后缓存依旧存在，发生报错
<br>运行完需要再次运行```docker compose up -d```命令启动项目。

---
### 备忘录：
- ``` git checkout yifan -- backend/app/accounts/views.py```可以通过这条指令将别人的分支的指定文件覆盖到自己的分支里。 <br>注意，运行这条指令之前，一定要checkout到自己的分支中。
