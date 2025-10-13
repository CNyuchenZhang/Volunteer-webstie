"""
Views for activities app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from .authentication import UserServiceTokenAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import (
    ActivityCategory, Activity, ActivityParticipant, ActivityReview,
    ActivityTag, ActivityTagMapping, ActivityLike, ActivityShare
)
from .serializers import (
    ActivityCategorySerializer, ActivitySerializer, ActivityCreateSerializer,
    ActivityApprovalSerializer, ActivityStatusUpdateSerializer, ActivityParticipantSerializer,
    ActivityParticipantApplicationSerializer, ActivityParticipantApprovalSerializer,
    ActivityReviewSerializer, ActivityTagSerializer, ActivityTagMappingSerializer,
    ActivityLikeSerializer, ActivityShareSerializer
)

# 自定义权限类
class ActivityPermission(permissions.BasePermission):
    """
    活动权限控制：
    - 任何人都可以查看活动列表（但看到的内容根据角色过滤）
    - 只有认证用户且角色为organizer的用户可以创建活动
    - 只有admin可以审批活动
    - 只有NGO可以修改自己活动的状态为cancelled/waitlist
    """
    
    def has_permission(self, request, view):
        # 允许所有人查看活动列表
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 创建活动需要认证且角色为organizer
        if request.method == 'POST':
            return (
                request.user and 
                request.user.is_authenticated and 
                hasattr(request.user, 'role') and 
                request.user.role == 'organizer'
            )
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # 查看活动详情：根据角色和活动状态决定
        if request.method in permissions.SAFE_METHODS:
            if request.user.is_authenticated:
                if request.user.role == 'admin':
                    return True  # 管理员可以看到所有活动
                elif request.user.role == 'organizer':
                    # NGO可以看到自己的活动或已批准的活动
                    return obj.organizer_id == request.user.id or obj.approval_status == 'approved'
                else:
                    # 志愿者只能看到已批准的活动
                    return obj.approval_status == 'approved'
            else:
                # 未登录用户只能看到已批准的活动
                return obj.approval_status == 'approved'
        
        # 修改活动：只有NGO可以修改自己的活动状态
        if request.method in ['PUT', 'PATCH']:
            return (
                request.user.is_authenticated and 
                request.user.role == 'organizer' and 
                obj.organizer_id == request.user.id
            )
        
        # 删除活动：只有NGO可以删除自己的活动
        if request.method == 'DELETE':
            return (
                request.user.is_authenticated and 
                request.user.role == 'organizer' and 
                obj.organizer_id == request.user.id
            )
        
        return False


class ActivityCategoryViewSet(generics.ListAPIView):
    """
    List all activity categories.
    """
    queryset = ActivityCategory.objects.filter(is_active=True)
    serializer_class = ActivityCategorySerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # 完全禁用认证


class ActivityViewSet(generics.ListCreateAPIView):
    """
    List and create activities.
    """
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'approval_status', 'organizer_id']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'start_date', 'views_count', 'likes_count']
    ordering = ['-created_at']
    permission_classes = [ActivityPermission]  # 使用自定义权限类
    authentication_classes = [UserServiceTokenAuthentication]  # 使用跨服务认证
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivitySerializer

    def perform_create(self, serializer):
        activity = serializer.save()
        # NGO 创建活动后通知管理员（仅管理员可见）
        try:
            import requests
            notification_data = {
                'recipient_id': 1,
                'recipient_email': 'admin@volunteer-platform.com',
                'recipient_name': 'Admin',
                # 1) Admin-only: 某 NGO 的活动待审批
                'notification_type': 'activity_status_change',
                'title': '有新的活动待审批',
                'message': f"{activity.organizer_name} 的活动《{activity.title}》待审批",
                'priority': 'high',
                'activity_id': activity.id,
            }
            try:
                response = requests.post(
                    'http://notification-service:8000/api/v1/notifications/', 
                    json=notification_data, 
                    timeout=5,
                    headers={'Content-Type': 'application/json'}
                )
                if response.status_code not in [200, 201]:
                    print(f"Failed to send notification: {response.status_code} - {response.text}")
            except requests.exceptions.RequestException as e:
                print(f"Error sending notification: {e}")
        except Exception as e:
            print(f"Error in notification creation: {e}")
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 根据用户角色过滤活动
        if self.request.user.is_authenticated:
            if self.request.user.role == 'admin':
                # 管理员可以看到所有活动（包括待审批的）
                return queryset
            elif self.request.user.role == 'organizer':
                # NGO组织者可以看到：
                # 1. 自己发布的所有活动（包括待审批的）
                # 2. 其他组织者发布的已批准活动
                return queryset.filter(
                    Q(organizer_id=self.request.user.id) |  # 自己的活动
                    Q(approval_status='approved')  # 已批准的活动
                )
            else:
                # 志愿者只能看到已批准的活动
                return queryset.filter(approval_status='approved')
        else:
            # 未登录用户只能看到已批准的活动
            return queryset.filter(approval_status='approved')


class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an activity.
    """
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [ActivityPermission]  # 使用自定义权限类
    authentication_classes = [UserServiceTokenAuthentication]  # 使用跨服务认证
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            # 如果是NGO修改自己的活动状态，使用状态更新序列化器
            if (self.request.user.is_authenticated and 
                self.request.user.role == 'organizer' and 
                hasattr(self, 'get_object')):
                try:
                    obj = self.get_object()
                    if obj.organizer_id == self.request.user.id:
                        return ActivityStatusUpdateSerializer
                except:
                    pass
            return ActivityCreateSerializer
        return ActivitySerializer


class ActivityApprovalView(generics.UpdateAPIView):
    """
    Approve or reject an activity (Admin only).
    """
    queryset = Activity.objects.all()
    serializer_class = ActivityApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [UserServiceTokenAuthentication]
    
    def get_queryset(self):
        # 管理员可获取所有活动，方便对任意状态执行审批动作
        return Activity.objects.all()
    
    def has_permission(self, request, view):
        # 只有admin可以审批活动
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role == 'admin'
        )
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # 发送通知给组织者
        approval_status = request.data.get('approval_status')
        admin_notes = request.data.get('admin_notes', '')
        
        if approval_status in ['approved', 'rejected']:
            # 审批结果发送给 NGO 组织者
            self._send_approval_notification(instance, approval_status, admin_notes)
        
        return Response(serializer.data)
    
    def _send_approval_notification(self, activity, approval_status, admin_notes=None):
        """
        发送活动审批通知给 NGO
        """
        try:
            # 这里应该调用通知服务的API或发送消息到消息队列
            # 为了简化，我们直接创建一个通知记录
            import requests
            
            # 2) NGO-only: 活动审批结果（通过/拒绝）
            notification_data = {
                'recipient_id': activity.organizer_id,
                'recipient_email': activity.organizer_email,
                'recipient_name': activity.organizer_name,
                'notification_type': 'activity_approval' if approval_status == 'approved' else 'activity_rejection',
                'title': '活动已通过审批' if approval_status == 'approved' else '活动审批被拒绝',
                'message': self._get_approval_message(activity.id, approval_status, admin_notes),
                'priority': 'high',
                'activity_id': activity.id,
            }
            
            # 发送到通知服务
            # 注意：这里需要通知服务运行在正确的端口
            try:
                response = requests.post(
                    'http://notification-service:8000/api/v1/notifications/',
                    json=notification_data,
                    timeout=5
                )
                if response.status_code == 201:
                    print(f"Notification sent successfully for activity {activity.id}")
                else:
                    print(f"Failed to send notification: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Error sending notification: {e}")
                
        except Exception as e:
            print(f"Error in _send_approval_notification: {e}")
    
    def _get_approval_message(self, activity_id, approval_status, admin_notes=None):
        """
        生成审批消息
        """
        if approval_status == 'approved':
            message = f"您提交的活动 (ID: {activity_id}) 已通过审批。"
        else:
            message = f"您提交的活动 (ID: {activity_id}) 审批被拒绝。"
            if admin_notes:
                message += f"\n\n拒绝原因：{admin_notes}"
        
        return message


class ActivityParticipantViewSet(generics.ListCreateAPIView):
    """
    List and create activity participants.
    """
    queryset = ActivityParticipant.objects.all()
    serializer_class = ActivityParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['activity', 'status', 'user_id']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityParticipantApplicationSerializer
        return ActivityParticipantSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # 志愿者申请后通知 NGO 组织者
        try:
            participant_id = response.data.get('id')
            if participant_id:
                participant = ActivityParticipant.objects.get(id=participant_id)
                activity = participant.activity
                import requests
                # 3) NGO-only: 志愿者报名了活动
                notification_data = {
                    'recipient_id': activity.organizer_id,
                    'recipient_email': activity.organizer_email,
                    'recipient_name': activity.organizer_name,
                    'notification_type': 'activity_status_change',
                    'title': '新的志愿者报名',
                    'message': f"志愿者 {participant.user_name} 报名了《{activity.title}》",
                    'priority': 'medium',
                    'activity_id': activity.id,
                    'user_id': participant.user_id,
                }
                try:
                    requests.post('http://notification-service:8000/api/v1/notifications/', json=notification_data, timeout=5)
                except requests.exceptions.RequestException:
                    pass
        except Exception:
            pass
        return response
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 根据用户角色过滤参与者
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role'):
            if self.request.user.role == 'organizer':
                # 组织者可以看到自己活动的参与者
                return queryset.filter(activity__organizer_id=self.request.user.id)
            else:
                # 志愿者只能看到自己的申请
                return queryset.filter(user_id=self.request.user.id)
        else:
            # 匿名用户可以看到所有参与者（用于测试）
            return queryset


class ActivityParticipantApprovalView(generics.UpdateAPIView):
    """
    Approve or reject activity participants (Organizer only).
    """
    queryset = ActivityParticipant.objects.all()
    serializer_class = ActivityParticipantApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # 只有组织者可以审批参与者
        if self.request.user.is_authenticated and self.request.user.role == 'organizer':
            return ActivityParticipant.objects.filter(activity__organizer_id=self.request.user.id)
        return ActivityParticipant.objects.none()
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # 审批后通知志愿者
        try:
            import requests
            # 4) Volunteer-only: 报名审批通过/拒绝
            notification_data = {
                'recipient_id': instance.user_id,
                'recipient_email': instance.user_email,
                'recipient_name': instance.user_name,
                'notification_type': 'volunteer_approval' if instance.status == 'approved' else 'volunteer_rejection',
                'title': '报名审批结果',
                'message': f"您报名的活动 (ID: {instance.activity_id}) 已被{ '通过' if instance.status=='approved' else '拒绝' }",
                'priority': 'medium',
                'activity_id': instance.activity_id,
                'user_id': instance.user_id,
            }
            try:
                requests.post('http://notification-service:8000/api/v1/notifications/', json=notification_data, timeout=5)
            except requests.exceptions.RequestException:
                pass
        except Exception:
            pass
        return Response(serializer.data)


class ActivityReviewViewSet(generics.ListCreateAPIView):
    """
    List and create activity reviews.
    """
    queryset = ActivityReview.objects.all()
    serializer_class = ActivityReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['activity', 'rating', 'is_verified']


class ActivityTagViewSet(generics.ListAPIView):
    """
    List all activity tags.
    """
    queryset = ActivityTag.objects.filter(is_active=True)
    serializer_class = ActivityTagSerializer
    permission_classes = [permissions.AllowAny]


class ActivityLikeView(generics.CreateAPIView):
    """
    Like an activity.
    """
    serializer_class = ActivityLikeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        activity_id = request.data.get('activity')
        user_id = request.user.id
        
        # 检查是否已经点赞
        like, created = ActivityLike.objects.get_or_create(
            activity_id=activity_id,
            user_id=user_id
        )
        
        if created:
            # 更新活动点赞数
            activity = Activity.objects.get(id=activity_id)
            activity.likes_count += 1
            activity.save()
            
            return Response({'message': 'Activity liked successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Activity already liked'}, status=status.HTTP_400_BAD_REQUEST)


class ActivityShareView(generics.CreateAPIView):
    """
    Share an activity.
    """
    serializer_class = ActivityShareSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        activity_id = request.data.get('activity')
        platform = request.data.get('platform', 'general')
        user_id = request.user.id
        
        # 创建分享记录
        share = ActivityShare.objects.create(
            activity_id=activity_id,
            user_id=user_id,
            platform=platform
        )
        
        # 更新活动分享数
        activity = Activity.objects.get(id=activity_id)
        activity.shares_count += 1
        activity.save()
        
        return Response({'message': 'Activity shared successfully'}, status=status.HTTP_201_CREATED)
