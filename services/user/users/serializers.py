"""
Serializers for the users app.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, UserAchievement, UserActivity, UserNotification
from django.conf import settings

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        
        # 验证角色选择
        role = attrs.get('role')
        if role == 'admin':
            raise serializers.ValidationError("Admin role cannot be registered through this endpoint.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_avatar(self, obj):
        if obj.user.avatar:  # ⚠️ 注意这里是 obj.user.avatar
            return f"{settings.MEDIA_DOMAIN}{obj.user.avatar.url}"
        return None

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user model.
    """
    profile = UserProfileSerializer(read_only=True)
    volunteer_level = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'bio', 'avatar', 'role', 'location', 'date_of_birth',
            'is_verified', 'total_volunteer_hours', 'impact_score',
            'interests', 'skills', 'languages', 'email_notifications',
            'sms_notifications', 'push_notifications', 'created_at',
            'updated_at', 'profile', 'volunteer_level', 'full_name'
        )
        read_only_fields = (
            'id', 'is_verified', 'total_volunteer_hours', 'impact_score',
            'created_at', 'updated_at'
        )
    
    # def get_avatar(self, obj):
    #     """返回头像的完整URL"""
    #     if obj.avatar:
    #         request = self.context.get('request')
    #         if request:
    #             return request.build_absolute_uri(obj.avatar.url)
    #         return obj.avatar.url
    #     return None
    # def get_avatar(self, obj):
    #     """返回头像的完整URL"""
    #     if obj.avatar:
    #         request = self.context.get('request')
    #         if request:
    #             return f"http://47.79.239.219:30081{obj.avatar.url}"
    #         return obj.avatar.url
    #     return None
    # def get_avatar(self, obj):
    #     """返回头像的完整 URL"""
    #     if not obj.avatar:
    #         return None

    #     request = self.context.get('request')
    #     # ✅ 优先使用 request.build_absolute_uri（自动带端口）
    #     if request:
    #         return request.build_absolute_uri(obj.avatar.url)

    #     # ✅ 如果没有 request，则根据配置动态拼接域名
    #     base_url = getattr(settings, "MEDIA_DOMAIN", None)
    #     if base_url:
    #         return f"{base_url}{obj.avatar.url}"

    #     # ✅ 默认退回相对路径
    #     return obj.avatar.url
    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        # 使用固定 MEDIA_DOMAIN
        base = getattr(settings, 'MEDIA_DOMAIN', None)
        if base:
            return f"{base}{obj.avatar.url}"
        return obj.avatar.url


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information.
    """
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'phone', 'bio',
            'location', 'date_of_birth', 'interests', 'skills',
            'languages', 'email_notifications', 'sms_notifications',
            'push_notifications'
        )


class UserAchievementSerializer(serializers.ModelSerializer):
    """
    Serializer for user achievements.
    """
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ('user', 'earned_at')


class UserActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for user activities.
    """
    class Meta:
        model = UserActivity
        fields = '__all__'
        read_only_fields = ('user', 'registered_at')


class UserNotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for user notifications.
    """
    class Meta:
        model = UserNotification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class UserStatsSerializer(serializers.Serializer):
    """
    Serializer for user statistics.
    """
    total_hours = serializers.IntegerField()
    activities_joined = serializers.IntegerField()
    achievements_earned = serializers.IntegerField()
    impact_score = serializers.IntegerField()
    volunteer_level = serializers.CharField()
    recent_activities = UserActivitySerializer(many=True)
    recent_achievements = UserAchievementSerializer(many=True)
