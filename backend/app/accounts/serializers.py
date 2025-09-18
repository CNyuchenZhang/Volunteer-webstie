from rest_framework import serializers
from .models import Account
import re

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

    def validate_Character(self, value):
        """验证用户类型"""
        USER_TYPE_ADMIN = 0
        USER_TYPE_VOLUNTEER = 1
        USER_TYPE_NPO = 2

        if value not in [USER_TYPE_VOLUNTEER, USER_TYPE_ADMIN, USER_TYPE_NPO]:
            raise serializers.ValidationError("用户类型必须是Volunteer、NPO或Admin")
        return value

    def validate_password(self, value):
        """验证密码复杂度"""
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

    def create(self, validated_data):
        # 从验证后的数据中取出密码
        password = validated_data.pop('password')
        # 创建用户对象，不包括密码
        user = Account.objects.create(**validated_data)
        # 使用set_password方法加密密码
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