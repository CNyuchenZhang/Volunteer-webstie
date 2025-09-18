from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
import hashlib

User = get_user_model()

class SHA256AuthenticationBackend(BaseBackend):
    """
    自定义认证后端，支持SHA256加密的密码
    """
    
    def authenticate(self, request, username=None, password=None, Character=None, **kwargs):
        try:
            # 根据用户名和Character查找用户
            user = User.objects.get(username=username, Character=Character)
            
            # 检查用户是否激活
            if not user.is_active:
                return None
            
            # 如果存储的密码是SHA256格式，直接比较
            if len(user.password) == 64 and all(c in '0123456789abcdef' for c in user.password.lower()):
                # 将输入的密码进行SHA256加密后比较
                hashed_input = hashlib.sha256(password.encode()).hexdigest()
                if user.password.lower() == hashed_input.lower():
                    return user
            else:
                # 使用Django默认的密码验证
                if user.check_password(password):
                    return user
                    
        except User.DoesNotExist:
            return None
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 