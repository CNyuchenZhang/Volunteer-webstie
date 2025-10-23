"""
Views for notification service.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Notification, NotificationTemplate, NotificationPreference
from .serializers import (
    NotificationSerializer, NotificationTemplateSerializer, 
    NotificationPreferenceSerializer
)
from .tasks import send_notification_email


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]  # 允许其他服务创建通知/前端读取
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['notification_type', 'is_read', 'is_sent', 'priority', 'recipient_email', 'recipient_id']
    search_fields = ['title', 'message', 'recipient_name']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter by recipient to support role-specific views."""
        queryset = super().get_queryset()
        recipient_email = self.request.query_params.get('recipient_email')
        recipient_id = self.request.query_params.get('recipient_id')
        notif_type = self.request.query_params.get('notification_type')
        if recipient_email:
            queryset = queryset.filter(recipient_email=recipient_email)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)
        if notif_type:
            queryset = queryset.filter(notification_type=notif_type)
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read for a user."""
        user_id = request.data.get('user_id')
        if user_id:
            Notification.objects.filter(recipient_id=user_id, is_read=False).update(
                is_read=True
            )
            return Response({'status': 'all notifications marked as read'})
        return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        """Resend a notification."""
        notification = self.get_object()
        # Trigger email sending task
        send_notification_email.delay(notification.id)
        return Response({'status': 'notification queued for resending'})


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notification templates.
    """
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['notification_type', 'is_active']
    search_fields = ['name', 'subject_template']


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user notification preferences.
    """
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter preferences by user."""
        queryset = super().get_queryset()
        # In a real implementation, you would filter by the authenticated user
        return queryset
