"""
Custom authentication for activity service.
"""
from rest_framework.authentication import TokenAuthentication as DRFTokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class UserServiceTokenAuthentication(DRFTokenAuthentication):
    """
    Custom token authentication that validates tokens with user service.
    """

    def authenticate_credentials(self, key):
        """
        Validate token with user service.
        """
        try:
            # DRF的Token模型通过self.get_model()获取（兼容自定义Token模型配置）
            token = self.get_model().objects.select_related('user').get(key=key)
        except self.get_model().DoesNotExist:
            # Token不存在 → 认证失败
            raise AuthenticationFailed('Invalid token')

            # 验证用户是否激活（DRF默认认证逻辑）
        if not token.user.is_active:
            raise AuthenticationFailed('User account is disabled')

            # 验证通过：返回用户和token
        return (token.user, token)


class MockUser:
    """
    Mock user object for cross-service authentication.
    """

    def __init__(self, user_data):
        self.id = user_data.get('id')
        self.username = user_data.get('username')
        self.email = user_data.get('email')
        self.first_name = user_data.get('first_name', '')
        self.last_name = user_data.get('last_name', '')
        self.role = user_data.get('role')
        self.phone = user_data.get('phone', '')
        self.is_authenticated = True
        self.is_anonymous = False

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return False

    def has_module_perms(self, app_label):
        return False
