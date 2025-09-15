## 一些杂七杂八的备忘录
1. 创建管理员的方法：
    - ```docker compose exec backend python manage.py createsuperuser```在后端手动创建超级管理员
    - 登录http://localhost:8000/admin/，输入刚刚创建的管理员信息，登录系统。在Accounts的USER中手动添加character = 0 的平台管理员
2. 数据库迁移的指令：
    - ```docker compose exec backend python manage.py migrate```