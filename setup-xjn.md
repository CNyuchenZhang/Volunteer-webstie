# 如何本地启动这个项目
1. git pull (目前xjn这个分支可以通过这个办法成功启动)
2. 打开项目文件夹，进入./Volunteer-website文件夹
3. 在电脑中启动Docker Desktop应用（这个可能需要你搜一下docker的安装教程）
4. 在终端输入 ```docker compose up -d```命令，
   -d 表示在后台运行（ detached模式）。此命令会构建镜像（如果需要）、创建并启动所有定义的服务、网络和数据卷。
5. 使用 docker compose logs 查看所有服务的日志。<br>
   - 添加 -f 可以实时跟踪日志输出，添加服务名（如 docker compose logs web -f）可以查看特定服务的日志。<br>
   - ```docker compose logs -f backend```<br>
   - 使用 ```docker compose ps``` 查看所有容器的状态，确认它们是否都处于 "Up" 状态。
6. 我不知道最开始的时候需不需要**迁移数据库**，目前最好手动迁移一下。```docker compose exec backend python manage.py migrate```
7. 停止项目```docker compose down```
8. ```docker compose build --no-cache```指令可以强制重新构建镜像，防止项目文件更改之后缓存依旧存在，发生报错
<br>运行完需要再次运行```docker compose up -d```命令启动项目。
### 注意：response中的refresh和access与JWT Token有关。
## 备忘录：
- ``` git checkout yifan -- backend/app/accounts/views.py```可以通过这条指令将别人的分支的指定文件覆盖到自己的分支里。 <br>注意，运行这条指令之前，一定要checkout到自己的分支中。
- 以防万一，如果postman正常，前端代码没问题，但是前端访问不了后端数据的话，可以看一下后端core的settings.py中
```
# 配置CORS允许前端访问
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",  # Vue开发服务器默认端口
#     "http://127.0.0.1:5173",
#     "http://localhost:8080",
#     "http://127.0.0.1:8080",
#     "http://127.0.0.1:8081",
#     "http://localhost:8081",
#     "http://nginx:80"
# ]
```
把代码注释取消再运行一下，看看是不是因为跨域访问的问题，如果还不行，我也不知道了，可以问问deepseek老师。

---
## 待解决的事项：
1. django的secret-key和postgreSQL的密码等现在是硬编码在代码中，容易造成安全问题。需要设计.env文件
2. JWT认证 - Token好像没有在settings.py中设置。这个token是前端自我验证的数据吗？
3. 前后端加密问题 https://blog.csdn.net/weixin_42510217/article/details/119322521<br>
如果前端已经对密码进行了加密，那么后端需要将密码解码，然后进行密码格式的检验,之后对密码进行加密，存入数据库
### 4. email应该设置为必填项 && register方法的返回参数需要微调 && 接口实际的的返回值的HTTP状态码与API文档中存在不同，需要校验