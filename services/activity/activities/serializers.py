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
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'published_at', 'views_count', 'likes_count', 'shares_count']
    
    def get_participants_count(self, obj):
        return obj.get_participants_count()
    
    def get_available_spots(self, obj):
        return obj.get_available_spots()
    
    def get_images(self, obj):
        """返回完整的图片URL"""
        if not obj.images:
            return []
        
        request = self.context.get('request')
        if request:
            # 使用request构建完整URL
            return [request.build_absolute_uri(image_path) for image_path in obj.images]
        else:
            # 如果没有request，使用默认的媒体URL
            from django.conf import settings
            base_url = getattr(settings, 'MEDIA_DOMAIN', 'http://activity-service:8000')
            return [f"{base_url}{image_path}" for image_path in obj.images]


class ActivityCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = Activity
        fields = [
            'title', 'description', 'full_description', 'category', 'location', 'address',
            'start_date', 'end_date', 'registration_deadline', 'max_participants', 'min_participants',
            'required_skills', 'age_requirement', 'physical_requirements', 'equipment_needed',
            'images'
        ]
    
    def create(self, validated_data):
        import os
        from django.core.files.storage import default_storage
        from django.conf import settings
        
        # 提取images字段（如果存在）
        images_data = validated_data.pop('images', [])
        
        # 设置组织者信息
        request = self.context.get('request')
        # 检查认证：request 必须存在，有 user 属性，且 user 已认证
        if not request:
            raise serializers.ValidationError("Authentication required to create activities")
        if not hasattr(request, 'user'):
            raise serializers.ValidationError("Authentication required to create activities")
        if not (hasattr(request.user, 'is_authenticated') and request.user.is_authenticated):
            raise serializers.ValidationError("Authentication required to create activities")
        
        # 用户已认证，设置组织者信息
        validated_data['organizer_id'] = request.user.id
        # 安全地获取用户姓名
        first_name = getattr(request.user, 'first_name', '') or ''
        last_name = getattr(request.user, 'last_name', '') or ''
        validated_data['organizer_name'] = f"{first_name} {last_name}".strip() or request.user.username
        validated_data['organizer_email'] = request.user.email
        validated_data['organizer_phone'] = getattr(request.user, 'phone', '') or ''
        
        # 新创建的活动默认为待审批状态
        validated_data['status'] = 'pending_approval'
        validated_data['approval_status'] = 'pending'
        
        # 处理多个图片上传
        image_paths = []
        if images_data:
            for idx, image_file in enumerate(images_data):
                # 生成文件名
                ext = os.path.splitext(image_file.name)[1]
                filename = f"activity_{validated_data['organizer_id']}_{idx}_{image_file.name}"
                filepath = os.path.join('activities', filename)
                
                # 保存文件
                saved_path = default_storage.save(filepath, image_file)
                # 保存相对路径到数组，确保以/开头
                if not saved_path.startswith('/'):
                    saved_path = '/' + saved_path
                image_paths.append(saved_path)
        
        validated_data['images'] = image_paths
        
        return super().create(validated_data)


class ActivityApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['approval_status', 'rejection_reason', 'admin_notes']
    
    def update(self, instance, validated_data):
        # 如果批准，更新状态为已批准
        if validated_data.get('approval_status') == 'approved':
            instance.status = 'approved'
            # 安全地获取用户ID
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                instance.approved_by_id = request.user.id
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
