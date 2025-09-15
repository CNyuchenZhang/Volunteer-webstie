from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Account(AbstractUser):
#     内置的User模型包含：
#     username	必填，150字符以内，唯一
#     first_name	可选，30字符以内
#     last_name	可选，150字符以内
#     email	可选邮箱地址
#     password	必填，存储为哈希值
#     groups	多对多关系到 Group 模型
#     user_permissions	多对多关系到 Permission 模型
#     is_staff	布尔值，是否可以访问admin
#     is_active	布尔值，是否激活
#     is_superuser	布尔值，是否有所有权限
#     last_login	上次登录时间
#     date_joined	账户创建时间
# 问题：如果将email的代码删除，则email不是必填项。那么，如何规定user类原来的参数为必填项？
    Character = models.IntegerField(blank = False)


    def save(self, *args, **kwargs):
        # 如果是超级用户，自动设置为 admin
        if self.is_superuser and not self.Character:
            self.Character = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username