from rest_framework import serializers
from .models import Account
import re

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'password', 'Character', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
            'date_joined': {'read_only': True},
            'last_login': {'read_only': True},
            'is_active': {'read_only': True}
        }

    def validate_Character(self, value):
        """验证用户类型"""
        USER_TYPE_ADMIN = 0
        USER_TYPE_VOLUNTEER = 1
        USER_TYPE_NPO = 2

        if value not in [USER_TYPE_VOLUNTEER, USER_TYPE_ADMIN, USER_TYPE_NPO]:
            raise serializers.ValidationError("用户类型必须是Volunteer、NPO或Admin")
        return value

    def validate_password(self, value):
        """验证密码复杂度 - 接受SHA256加密后的密码"""
        # 如果是64位十六进制字符串，说明是SHA256加密后的密码，直接返回
        if len(value) == 64 and all(c in '0123456789abcdef' for c in value.lower()):
            return value
            
        # 如果是明文密码，进行复杂度验证
        if len(value) < 8:
            raise serializers.ValidationError("密码长度至少8位")

        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("密码必须包含至少一个大写字母")

        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("密码必须包含至少一个小写字母")

        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("密码必须包含至少一个数字")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("密码必须包含至少一个特殊字符")

        return value

    def validate_username(self, value):
        """验证用户名"""
        if len(value) > 20:
            raise serializers.ValidationError("用户名长度不能超过20个字符")

        if not re.match(r'^[a-zA-Z0-9_@+.-]+$', value):
            raise serializers.ValidationError("用户名只能包含字母、数字、_、@、+、.、-这些字符")

        if not any(c.isalpha() for c in value):
            raise serializers.ValidationError("用户名必须包含至少一个字母")

        if Account.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("该用户名已被注册")

        return value

    def validate_email(self, value):
        """验证邮箱"""
        if Account.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("该邮箱已被注册")
        return value

    def create(self, validated_data):
        # 从验证后的数据中取出密码
        password = validated_data.pop('password')
        # 创建用户对象，不包括密码
        user = Account.objects.create(**validated_data)
        
        # 如果密码已经是SHA256加密的，直接存储；否则使用Django的加密方式
        if len(password) == 64 and all(c in '0123456789abcdef' for c in password.lower()):
            # 已经是SHA256加密的密码，直接设置
            user.password = password
        else:
            # 明文密码，使用Django的加密方式
            user.set_password(password)
        
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    Character = serializers.IntegerField()
    def validate_Character(self, value):
        """验证用户类型"""
        if value not in [0, 1, 2]:
            raise serializers.ValidationError("用户类型必须是0、1或2")
        return value


class UsernameCheckSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
    )