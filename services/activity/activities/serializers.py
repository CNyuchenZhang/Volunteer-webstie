"""
Serializers for activities app.
"""
from rest_framework import serializers
from .models import (
    ActivityCategory, Activity, ActivityParticipant, ActivityReview,
    ActivityTag, ActivityTagMapping, ActivityLike, ActivityShare
)


class ActivityCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityCategory
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    participants_count = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'published_at', 'views_count', 'likes_count', 'shares_count']
    
    def get_participants_count(self, obj):
        return obj.get_participants_count()
    
    def get_available_spots(self, obj):
        return obj.get_available_spots()


class ActivityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'title', 'description', 'category', 'location',
            'start_date', 'end_date', 'max_participants'
        ]
    
    def create(self, validated_data):
        # 设置组织者信息
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['organizer_id'] = request.user.id
            # 安全地获取用户姓名
            first_name = getattr(request.user, 'first_name', '') or ''
            last_name = getattr(request.user, 'last_name', '') or ''
            validated_data['organizer_name'] = f"{first_name} {last_name}".strip() or request.user.username
            validated_data['organizer_email'] = request.user.email
            validated_data['organizer_phone'] = getattr(request.user, 'phone', '') or ''
        else:
            # 如果未认证，抛出错误
            raise serializers.ValidationError("Authentication required to create activities")
        
        # 新创建的活动默认为待审批状态
        validated_data['status'] = 'pending_approval'
        validated_data['approval_status'] = 'pending'
        
        return super().create(validated_data)


class ActivityApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['approval_status', 'rejection_reason', 'admin_notes']
    
    def update(self, instance, validated_data):
        # 如果批准，更新状态为已批准
        if validated_data.get('approval_status') == 'approved':
            instance.status = 'approved'
            instance.approved_by_id = self.context.get('request').user.id
            from django.utils import timezone
            instance.approved_at = timezone.now()
        elif validated_data.get('approval_status') == 'rejected':
            instance.status = 'rejected'
        
        return super().update(instance, validated_data)


class ActivityStatusUpdateSerializer(serializers.ModelSerializer):
    """
    NGO可以修改的活动状态序列化器
    """
    class Meta:
        model = Activity
        fields = ['status']
    
    def validate_status(self, value):
        # 只允许NGO修改状态为cancelled或waitlist
        allowed_statuses = ['cancelled', 'waitlist']
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Only 'cancelled' and 'waitlist' statuses are allowed. Got: {value}"
            )
        return value


class ActivityParticipantSerializer(serializers.ModelSerializer):
    activity_title = serializers.CharField(source='activity.title', read_only=True)
    
    class Meta:
        model = ActivityParticipant
        fields = '__all__'
        read_only_fields = ['registered_at', 'attended_at', 'completed_at', 'cancelled_at']


class ActivityParticipantApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityParticipant
        fields = [
            'activity', 'application_message', 'skills_match', 'experience_level',
            'emergency_contact_name', 'emergency_contact_phone'
        ]
    
    def create(self, validated_data):
        # 设置用户信息
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['user_id'] = request.user.id
            # 安全地获取用户姓名
            first_name = getattr(request.user, 'first_name', '') or ''
            last_name = getattr(request.user, 'last_name', '') or ''
            validated_data['user_name'] = f"{first_name} {last_name}".strip() or request.user.username
            validated_data['user_email'] = getattr(request.user, 'email', '') or ''
            validated_data['user_phone'] = getattr(request.user, 'phone', '') or ''
        else:
            # 如果未认证，抛出错误
            raise serializers.ValidationError("Authentication required to join activities")
        
        # 新申请默认为已申请状态
        validated_data['status'] = 'applied'
        
        return super().create(validated_data)


class ActivityParticipantApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityParticipant
        fields = ['status', 'rejection_reason', 'organizer_notes']
    
    def update(self, instance, validated_data):
        # 如果批准，更新状态为已批准
        if validated_data.get('status') == 'approved':
            instance.approved_by_id = self.context.get('request').user.id
            from django.utils import timezone
            instance.approved_at = timezone.now()
        
        return super().update(instance, validated_data)


class ActivityReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityReview
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ActivityTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityTag
        fields = '__all__'


class ActivityTagMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityTagMapping
        fields = '__all__'


class ActivityLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLike
        fields = '__all__'


class ActivityShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityShare
        fields = '__all__'
