"""
Views for activities app.
"""
from rest_framework import generics, status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from .authentication import UserServiceTokenAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Sum, F, ExpressionWrapper, fields
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


class ActivityViewSet(viewsets.ModelViewSet):
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
        print("\n" + "="*60)
        print(f"📢 新活动已创建:")
        print(f"   活动ID: {activity.id}")
        print(f"   活动名称: {activity.title}")
        print(f"   创建者: {activity.organizer_name} (ID: {activity.organizer_id})")
        print(f"   创建者邮箱: {activity.organizer_email}")
        print(f"   审批状态: {activity.approval_status}")
        print("="*60)
        print("正在发送通知给管理员...")
        # NGO 创建活动后通知所有管理员
        self._notify_admins_new_activity(activity)
        print("="*60 + "\n")
    
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
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """
        审批活动 (Admin only)
        """
        # 检查用户是否为admin
        if not (hasattr(request.user, 'role') and request.user.role == 'admin'):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        activity = self.get_object()
        
        # 直接更新活动状态，不依赖序列化器的context
        approval_status = request.data.get('approval_status')
        admin_notes = request.data.get('admin_notes', '')
        rejection_reason = request.data.get('rejection_reason', '')
        
        if approval_status == 'approved':
            activity.status = 'approved'
            activity.approved_by_id = request.user.id
            from django.utils import timezone
            activity.approved_at = timezone.now()
            activity.admin_notes = admin_notes
        elif approval_status == 'rejected':
            activity.status = 'rejected'
            activity.rejection_reason = rejection_reason
            activity.admin_notes = admin_notes
        
        activity.approval_status = approval_status
        activity.save()
        
        # 发送通知给组织者
        if approval_status in ['approved', 'rejected']:
            self._send_approval_notification(activity, approval_status, admin_notes)
        
        # 返回更新后的活动数据
        serializer = ActivitySerializer(activity)
        return Response(serializer.data)
    
    def _send_approval_notification(self, activity, approval_status, admin_notes=None):
        """
        发送活动审批通知给 NGO
        """
        try:
            import requests
            
            # 根据审批状态设置不同的通知内容
            if approval_status == 'approved':
                title = 'Activity Approved'
                message = f"Congratulations! Your activity \"{activity.title}\" (ID: {activity.id}) has been approved."
                if admin_notes:
                    message += f"\n\nAdmin notes: {admin_notes}"
            else:
                title = 'Activity Rejected'
                message = f"Sorry, your activity \"{activity.title}\" (ID: {activity.id}) has been rejected."
                if admin_notes:
                    message += f"\n\nRejection reason: {admin_notes}"
            
            notification_data = {
                'recipient_id': activity.organizer_id,
                'recipient_email': activity.organizer_email,
                'recipient_name': activity.organizer_name,
                'notification_type': 'activity_approval' if approval_status == 'approved' else 'activity_rejection',
                'title': title,
                'message': message,
                'priority': 'high',
                'activity_id': activity.id,
            }
            
            try:
                # 发送到通知服务
                response = requests.post(
                    'http://notification-service.mywork.svc.cluster.local:8000/api/v1/notifications/',
                    json=notification_data,
                    timeout=5
                )
                
                # 同时在用户服务中创建通知
                user_notification_data = {
                    'user_id': activity.organizer_id,
                    'notification_type': 'system',
                    'title': title,
                    'message': message,
                    'activity_id': activity.id,
                }
                requests.post(
                    'http://user-service.mywork.svc.cluster.local:8000/api/v1/notifications/create/',
                    json=user_notification_data,
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
            message = f"Your submitted activity (ID: {activity_id}) has been approved."
        else:
            message = f"Your submitted activity (ID: {activity_id}) has been rejected."
            if admin_notes:
                message += f"\n\nRejection reason: {admin_notes}"
        
        return message
    
    def _notify_admins_new_activity(self, activity):
        """
        通知所有管理员有新活动待审批
        """
        try:
            import requests
            
            # 获取所有管理员用户 - 通过公共API
            admins = []
            try:
                # 使用公共的global-stats端点来间接获取管理员信息
                # 或者直接使用固定的管理员ID列表
                # 由于跨服务调用的限制，我们使用默认的管理员列表
                # 在实际部署中，应该使用服务间的认证token或内部API
                
                # 尝试通过用户服务API获取管理员
                user_service_url = 'http://user-service.mywork.svc.cluster.local:8000/api/v1/search/'
                # 注意：这个API需要认证，所以我们使用fallback逻辑
                try:
                    response = requests.get(
                        user_service_url, 
                        params={'role': 'admin'},
                        timeout=3
                    )
                    if response.status_code == 200:
                        admins = response.json()
                        print(f"Successfully fetched {len(admins)} admin(s) from user service")
                except:
                    pass
                
                # 如果API调用失败，使用默认管理员ID列表
                if not admins:
                    # 根据您的数据库，管理员ID是8
                    default_admin_ids = [8]  # admin@volunteer-platform.com
                    
                    print(f"⚠ Unable to fetch admin list from API, using default admin IDs: {default_admin_ids}")
                    
                    for admin_id in default_admin_ids:
                        if admin_id == 8:
                            admins.append({
                                'id': 8,
                                'email': 'admin@volunteer-platform.com',
                                'first_name': 'Admin',
                                'last_name': 'User'
                            })
                        else:
                            admins.append({
                                'id': admin_id,
                                'email': f'admin{admin_id}@volunteer-platform.com',
                                'first_name': 'Admin',
                                'last_name': str(admin_id)
                            })
                    print(f"✓ Using admin list: {len(admins)} admin(s) - IDs: {default_admin_ids}")
                    
            except Exception as e:
                print(f"Error fetching admin users: {e}")
                # 最小化fallback：至少通知ID为8的管理员
                admins = [{'id': 8, 'email': 'admin@volunteer-platform.com', 'first_name': 'Admin', 'last_name': 'User'}]
            
            # 向每个管理员发送通知
            for admin in admins:
                admin_id = admin.get('id')
                admin_email = admin.get('email', f'admin{admin_id}@volunteer-platform.com')
                admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip() or f'Admin {admin_id}'
                
                # 准备详细的活动信息
                activity_info = f"""
Activity Name: {activity.title}
Activity ID: {activity.id}
Organizer: {activity.organizer_name}
Organizer Email: {activity.organizer_email}
Created At: {activity.created_at}
Location: {activity.location}
Start Date: {activity.start_date}
                """.strip()
                
                # 创建通知服务的通知
                notification_data = {
                    'recipient_id': admin_id,
                    'recipient_email': admin_email,
                    'recipient_name': admin_name,
                    'notification_type': 'activity_status_change',
                    'title': 'New Activity Pending Approval',
                    'message': f"Organizer {activity.organizer_name} ({activity.organizer_email}) has created a new activity \"{activity.title}\" (ID: {activity.id}) pending your approval.\n\n{activity_info}",
                    'priority': 'high',
                    'activity_id': activity.id,
                }
                
                try:
                    # 发送到通知服务
                    response = requests.post(
                        'http://notification-service.mywork.svc.cluster.local:8003/api/v1/notifications/',
                        json=notification_data,
                        timeout=5,
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    print(f"Notification service response for admin {admin_id}: {response.status_code}")
                    
                    # 同时在用户服务中创建通知
                    user_notification_data = {
                        'user_id': admin_id,
                        'notification_type': 'new_activity',
                        'title': 'New Activity Pending Approval',
                        'message': f"Organizer {activity.organizer_name} ({activity.organizer_email}) has created a new activity \"{activity.title}\" (ID: {activity.id}) pending your approval.\n\nActivity Details:\n- Title: {activity.title}\n- Location: {activity.location}\n- Start Date: {activity.start_date}",
                        'activity_id': activity.id,
                    }
                    user_response = requests.post(
                        'http://user-service.mywork.svc.cluster.local:8001/api/v1/notifications/create/',
                        json=user_notification_data,
                        timeout=5
                    )
                    
                    print(f"User service notification response for admin {admin_id}: {user_response.status_code}")
                    
                    if response.status_code in [200, 201]:
                        print(f"✓ Notification sent to admin {admin_id} ({admin_name}) for activity {activity.id}")
                    else:
                        print(f"✗ Failed to send notification to admin {admin_id}: {response.status_code} - {response.text}")
                        
                except requests.exceptions.RequestException as e:
                    print(f"✗ Error sending notification to admin {admin_id}: {e}")
                    
        except Exception as e:
            print(f"✗ Error in _notify_admins_new_activity: {e}")
            import traceback
            traceback.print_exc()




class AdminActivityApprovalViewSet(viewsets.ModelViewSet):
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
    
    def get_permissions(self):
        """
        只有admin可以访问这个ViewSet
        """
        permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def check_permissions(self, request):
        """
        检查用户是否为admin
        """
        super().check_permissions(request)
        if not (hasattr(request.user, 'role') and request.user.role == 'admin'):
            self.permission_denied(request, message='Admin access required')
    
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
            import requests
            
            # 根据审批状态设置不同的通知内容
            if approval_status == 'approved':
                title = 'Activity Approved'
                message = f"Congratulations! Your activity \"{activity.title}\" (ID: {activity.id}) has been approved."
                if admin_notes:
                    message += f"\n\nAdmin notes: {admin_notes}"
            else:
                title = 'Activity Rejected'
                message = f"Sorry, your activity \"{activity.title}\" (ID: {activity.id}) has been rejected."
                if admin_notes:
                    message += f"\n\nRejection reason: {admin_notes}"
            
            # 2) NGO-only: 活动审批结果（通过/拒绝）
            notification_data = {
                'recipient_id': activity.organizer_id,
                'recipient_email': activity.organizer_email,
                'recipient_name': activity.organizer_name,
                'notification_type': 'activity_approval' if approval_status == 'approved' else 'activity_rejection',
                'title': title,
                'message': message,
                'priority': 'high',
                'activity_id': activity.id,
            }
            
            try:
                # 发送到通知服务
                response = requests.post(
                    'http://notification-service.mywork.svc.cluster.local:8000/api/v1/notifications/',
                    json=notification_data,
                    timeout=5
                )
                
                # 同时在用户服务中创建通知
                user_notification_data = {
                    'user_id': activity.organizer_id,
                    'notification_type': 'system',
                    'title': title,
                    'message': message,
                    'activity_id': activity.id,
                }
                requests.post(
                    'http://user-service.mywork.svc.cluster.local:8000/api/v1/notifications/create/',
                    json=user_notification_data,
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
            message = f"Your submitted activity (ID: {activity_id}) has been approved."
        else:
            message = f"Your submitted activity (ID: {activity_id}) has been rejected."
            if admin_notes:
                message += f"\n\nRejection reason: {admin_notes}"
        
        return message


class ActivityParticipantViewSet(viewsets.ModelViewSet):
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

    def get_permissions(self):
        """
        根据操作类型设置不同的权限
        """
        if self.action in ['update', 'partial_update']:
            # 更新操作需要NGO组织者权限
            permission_classes = [permissions.IsAuthenticated]
        else:
            # 其他操作只需要认证
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def check_permissions(self, request):
        """
        检查用户权限
        """
        super().check_permissions(request)
        
        # 对于更新操作，检查是否为NGO组织者
        if self.action in ['update', 'partial_update']:
            if not (hasattr(request.user, 'role') and request.user.role == 'organizer'):
                self.permission_denied(request, message='Organizer access required')

    def create(self, request, *args, **kwargs):
        # 检查是否已经申请过这个活动
        activity_id = request.data.get('activity')
        user_id = request.user.id if request.user.is_authenticated else None
        
        if activity_id and user_id:
            existing_participant = ActivityParticipant.objects.filter(
                activity_id=activity_id,
                user_id=user_id
            ).first()
            
            if existing_participant:
                return Response(
                    {'error': 'You have already applied for this activity, please wait for approval'},
                    status=status.HTTP_409_CONFLICT
                )
        
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
                    'title': 'New Volunteer Application',
                    'message': f"Volunteer {participant.user_name} has applied for activity \"{activity.title}\"",
                    'priority': 'medium',
                    'activity_id': activity.id,
                    'user_id': participant.user_id,
                }
                try:
                    requests.post('http://notification-service.mywork.svc.cluster.local:8000/api/v1/notifications/', json=notification_data, timeout=5)
                except requests.exceptions.RequestException:
                    pass
        except Exception:
            pass
        return response
    
    def update(self, request, *args, **kwargs):
        """重写update方法以在审批后发送通知"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # 如果状态发生变化（从pending变为approved或rejected），发送通知
        new_status = serializer.instance.status
        if old_status != new_status and new_status in ['approved', 'rejected']:
            print("\n" + "="*60)
            print(f"📢 志愿者申请审批:")
            print(f"   申请ID: {instance.id}")
            print(f"   志愿者: {instance.user_name} (ID: {instance.user_id})")
            print(f"   志愿者邮箱: {instance.user_email}")
            print(f"   活动ID: {instance.activity_id}")
            print(f"   审批状态: {old_status} → {new_status}")
            print("="*60)
            print("正在发送通知给志愿者...")
            
            self._notify_volunteer_application_result(serializer.instance)
            
            print("="*60 + "\n")
        
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """PATCH方法"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def _notify_volunteer_application_result(self, participant):
        """通知志愿者申请审批结果"""
        try:
            import requests
            from .models import Activity
            
            # 获取活动详情
            activity = Activity.objects.get(id=participant.activity_id)
            
            print(f"   活动详情: {activity.title}")
            
            # 根据审批结果设置不同的通知内容
            if participant.status == 'approved':
                title = 'Application Approved'
                message = f"Congratulations! Your application for activity \"{activity.title}\" has been approved."
                notification_type = 'volunteer_approval'
            else:
                title = 'Application Rejected'
                message = f"Sorry, your application for activity \"{activity.title}\" has been rejected."
                notification_type = 'volunteer_rejection'
            
            print(f"   通知标题: {title}")
            print(f"   通知内容: {message}")
            
            # 创建通知服务的通知
            notification_data = {
                'recipient_id': participant.user_id,
                'recipient_email': participant.user_email,
                'recipient_name': participant.user_name,
                'notification_type': notification_type,
                'title': title,
                'message': message,
                'priority': 'medium',
                'activity_id': participant.activity_id,
                'user_id': participant.user_id,
            }
            
            try:
                # 发送到通知服务
                print(f"   → 发送通知到通知服务 (recipient_id={participant.user_id})...")
                response = requests.post(
                    'http://notification-service.mywork.svc.cluster.local:8000/api/v1/notifications/',
                    json=notification_data,
                    timeout=5
                )
                print(f"   ← 通知服务响应: {response.status_code}")
                
                # 同时在用户服务中创建通知
                user_notification_data = {
                    'user_id': participant.user_id,
                    'notification_type': 'activity_reminder' if participant.status == 'approved' else 'system',
                    'title': title,
                    'message': message,
                    'activity_id': participant.activity_id,
                }
                print(f"   → 发送通知到用户服务 (user_id={participant.user_id})...")
                user_response = requests.post(
                    'http://user-service.mywork.svc.cluster.local:8000/api/v1/notifications/create/',
                    json=user_notification_data,
                    timeout=5
                )
                print(f"   ← 用户服务响应: {user_response.status_code}")
                
                if response.status_code in [200, 201]:
                    print(f"   ✓ 志愿者通知发送成功 (participant_id={participant.id}, user_id={participant.user_id})")
                else:
                    print(f"   ✗ 志愿者通知发送失败: {response.status_code} - {response.text}")
            except requests.exceptions.RequestException as e:
                print(f"   ✗ 发送志愿者通知时出错: {e}")
                import traceback
                traceback.print_exc()
        except Exception as e:
            print(f"   ✗ _notify_volunteer_application_result 错误: {e}")
            import traceback
            traceback.print_exc()
    
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
        
        print("\n" + "="*60)
        print(f"📢 志愿者申请审批:")
        print(f"   申请ID: {instance.id}")
        print(f"   志愿者: {instance.user_name} (ID: {instance.user_id})")
        print(f"   志愿者邮箱: {instance.user_email}")
        print(f"   活动ID: {instance.activity_id}")
        print(f"   审批状态: {instance.status}")
        print("="*60)
        print("正在发送通知给志愿者...")
        
        # 审批后通知志愿者
        self._notify_volunteer_application_result(instance)
        
        print("="*60 + "\n")
        return Response(serializer.data)
    
    def _notify_volunteer_application_result(self, participant):
        """
        通知志愿者申请审批结果
        """
        try:
            import requests
            from .models import Activity
            
            # 获取活动详情
            activity = Activity.objects.get(id=participant.activity_id)
            
            print(f"   活动详情: {activity.title}")
            
            # 根据审批结果设置不同的通知内容
            if participant.status == 'approved':
                title = 'Application Approved'
                message = f"Congratulations! Your application for activity \"{activity.title}\" has been approved."
                notification_type = 'volunteer_approval'
            else:
                title = 'Application Rejected'
                message = f"Sorry, your application for activity \"{activity.title}\" has been rejected."
                notification_type = 'volunteer_rejection'
            
            print(f"   通知标题: {title}")
            print(f"   通知内容: {message}")
            
            # 创建通知服务的通知
            notification_data = {
                'recipient_id': participant.user_id,
                'recipient_email': participant.user_email,
                'recipient_name': participant.user_name,
                'notification_type': notification_type,
                'title': title,
                'message': message,
                'priority': 'medium',
                'activity_id': participant.activity_id,
                'user_id': participant.user_id,
            }
            
            try:
                # 发送到通知服务
                print(f"   → 发送通知到通知服务 (recipient_id={participant.user_id})...")
                response = requests.post(
                    'http://notification-service.mywork.svc.cluster.local:8003/api/v1/notifications/',
                    json=notification_data,
                    timeout=5
                )
                print(f"   ← 通知服务响应: {response.status_code}")
                
                # 同时在用户服务中创建通知
                user_notification_data = {
                    'user_id': participant.user_id,
                    'notification_type': 'activity_reminder' if participant.status == 'approved' else 'system',
                    'title': title,
                    'message': message,
                    'activity_id': participant.activity_id,
                }
                print(f"   → 发送通知到用户服务 (user_id={participant.user_id})...")
                user_response = requests.post(
                    'http://user-service.mywork.svc.cluster.local:8001/api/v1/notifications/create/',
                    json=user_notification_data,
                    timeout=5
                )
                print(f"   ← 用户服务响应: {user_response.status_code}")
                
                if response.status_code in [200, 201]:
                    print(f"   ✓ 志愿者通知发送成功 (participant_id={participant.id}, user_id={participant.user_id})")
                else:
                    print(f"   ✗ 志愿者通知发送失败: {response.status_code} - {response.text}")
            except requests.exceptions.RequestException as e:
                print(f"   ✗ 发送志愿者通知时出错: {e}")
                import traceback
                traceback.print_exc()
        except Exception as e:
            print(f"   ✗ _notify_volunteer_application_result 错误: {e}")
            import traceback
            traceback.print_exc()


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


class ActivityStatsView(APIView):
    """
    Provides statistics about activities.
    """
    def get(self, request, *args, **kwargs):
        total_activities = Activity.objects.filter(approval_status='approved').count()
        
        # Calculate total volunteer hours
        completed_participations = ActivityParticipant.objects.filter(status='completed')
        total_hours = completed_participations.annotate(
            duration=ExpressionWrapper(F('activity__end_date') - F('activity__start_date'), output_field=fields.DurationField())
        ).aggregate(total_duration=Sum('duration'))['total_duration']
        
        total_hours_in_hours = 0
        if total_hours:
            total_hours_in_hours = total_hours.total_seconds() / 3600

        return Response({
            'total_activities': total_activities,
            'total_hours': round(total_hours_in_hours, 2),
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return JsonResponse({'status': 'ok'}, status=200)
