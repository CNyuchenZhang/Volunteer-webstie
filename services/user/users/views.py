"""
Views for the users app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from functools import wraps
from rest_framework.views import APIView
from django.http import JsonResponse

from .models import User, UserProfile, UserAchievement, UserActivity, UserNotification
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserUpdateSerializer, UserProfileSerializer, UserAchievementSerializer,
    UserActivitySerializer, UserNotificationSerializer, PasswordChangeSerializer,
    UserStatsSerializer
)


def require_role(roles):
    """
    装饰器：要求用户具有特定角色
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if request.user.role not in roles:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # 注册不需要认证
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'token': token.key,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # 登录不需要认证
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # 验证管理员登录
        if user.role == 'admin':
            # 检查是否是预定义的管理员账户
            if not self._is_valid_admin_user(user):
                return Response({
                    'error': 'Invalid admin credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create or get auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Login user
        login(request, user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'token': token.key,
            'message': 'Login successful'
        })
    
    def _is_valid_admin_user(self, user):
        """
        验证管理员用户是否有效
        这里可以设置特定的管理员账户验证逻辑
        """
        # 放宽为：凡是数据库中角色为 admin 的用户均可登录
        # 避免硬编码邮箱导致新建管理员无法登录
        return getattr(user, 'role', None) == 'admin'


class UserLogoutView(generics.GenericAPIView):
    """
    User logout endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Delete auth token
        try:
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist) as exc:
            import logging
            logging.getLogger(__name__).info(
                "No auth token to delete during logout: %s", type(exc).__name__
            )
        
        # Logout user
        logout(request)
        
        return Response({'message': 'Logout successful'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile endpoint.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """
    User update endpoint.
    """
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    User profile update endpoint.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class PasswordChangeView(generics.GenericAPIView):
    """
    Password change endpoint.
    """
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class UserAvatarUploadView(generics.GenericAPIView):
    """
    User avatar upload endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        from django.db import transaction
        import logging
        
        logger = logging.getLogger(__name__)
        user = request.user
        avatar_file = request.FILES.get('avatar')
        
        if not avatar_file:
            return Response(
                {'error': 'No avatar file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # 删除旧头像
                if user.avatar:
                    try:
                        user.avatar.delete(save=False)
                    except Exception as e:
                        logger.warning(f"Failed to delete old avatar: {str(e)}")
                
                # 保存新头像
                user.avatar = avatar_file
                # 显式保存 avatar 字段
                user.save(update_fields=['avatar', 'updated_at'])
                
                # 强制刷新以确保数据库已更新
                user.refresh_from_db()
                
                # 验证保存是否成功
                if not user.avatar:
                    logger.error("Avatar field is empty after save!")
                    raise Exception("Failed to save avatar to database")
                
                # 返回头像 URL
                avatar_url = request.build_absolute_uri(user.avatar.url)
                
                logger.info(f"Avatar uploaded successfully for user {user.id}: {user.avatar.name}")
                
                return Response({
                    'avatar': avatar_url,
                    'message': 'Avatar uploaded successfully'
                })
                
        except Exception as e:
            logger.error(f"Error uploading avatar: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to upload avatar: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserAvatarRemoveView(generics.GenericAPIView):
    """
    User avatar remove endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        user = request.user
        
        if user.avatar:
            user.avatar.delete(save=True)
        
        return Response({
            'avatar': None,
            'message': 'Avatar removed successfully'
        })


class UserStatsView(generics.GenericAPIView):
    """
    User statistics endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Get recent activities (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_activities = UserActivity.objects.filter(
            user=user,
            registered_at__gte=thirty_days_ago
        ).order_by('-registered_at')[:5]
        
        # Get recent achievements (last 30 days)
        recent_achievements = UserAchievement.objects.filter(
            user=user,
            earned_at__gte=thirty_days_ago
        ).order_by('-earned_at')[:5]
        
        stats = {
            'total_hours': user.total_volunteer_hours,
            'activities_joined': UserActivity.objects.filter(user=user).count(),
            'achievements_earned': UserAchievement.objects.filter(user=user).count(),
            'impact_score': user.impact_score,
            'volunteer_level': user.get_volunteer_level(),
            'recent_activities': UserActivitySerializer(recent_activities, many=True).data,
            'recent_achievements': UserAchievementSerializer(recent_achievements, many=True).data,
        }
        
        return Response(stats)


class UserAchievementsView(generics.ListAPIView):
    """
    User achievements endpoint.
    """
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user)


class UserActivitiesView(generics.ListAPIView):
    """
    User activities endpoint.
    """
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)


class UserNotificationsView(generics.ListAPIView):
    """
    User notifications endpoint.
    """
    serializer_class = UserNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserNotification.objects.filter(user=self.request.user)
    
    def get(self, request, *args, **kwargs):
        # Get unread count
        unread_count = UserNotification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        # Get notifications
        notifications = self.get_queryset()
        
        return Response({
            'unread_count': unread_count,
            'notifications': UserNotificationSerializer(notifications, many=True).data
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a notification as read.
    """
    try:
        notification = UserNotification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'})
    except UserNotification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read.
    """
    UserNotification.objects.filter(
        user=request.user,
        is_read=False
    ).update(is_read=True, read_at=timezone.now())
    
    return Response({'message': 'All notifications marked as read'})


@api_view(['POST'])
@permission_classes([AllowAny])  # 允许其他服务调用
def create_notification(request):
    """
    Create a user notification (for internal service use).
    """
    try:
        user_id = request.data.get('user_id')
        notification_type = request.data.get('notification_type', 'system')
        title = request.data.get('title')
        message = request.data.get('message')
        activity_id = request.data.get('activity_id')
        achievement_id = request.data.get('achievement_id')
        
        if not user_id or not title or not message:
            return Response(
                {'error': 'user_id, title, and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 获取用户
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 创建通知
        notification = UserNotification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            activity_id=activity_id,
            achievement_id=achievement_id,
        )
        
        serializer = UserNotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def global_stats(request):
    """
    Global statistics endpoint (public access).
    """
    total_volunteers = User.objects.filter(role='volunteer').count()
    total_ngos = User.objects.filter(role='organizer').count()
    
    return Response({
        'total_volunteers': total_volunteers,
        'total_ngos': total_ngos,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """
    Search users endpoint.
    """
    query = request.GET.get('q', '')
    role = request.GET.get('role', '')
    location = request.GET.get('location', '')

    queryset = User.objects.all()

    if query:
        queryset = queryset.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        )

    if role:
        queryset = queryset.filter(role=role)

    if location:
        queryset = queryset.filter(location__icontains=location)

    # Exclude current user
    queryset = queryset.exclude(id=request.user.id)

    serializer = UserSerializer(queryset[:20], many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return JsonResponse({'status': 'ok'}, status=200)

