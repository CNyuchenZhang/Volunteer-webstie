"""
Serializers for notification service.
"""
from rest_framework import serializers
from .models import Notification, NotificationTemplate, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model.
    """
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'sent_at', 'read_at']
    
    def create(self, validated_data):
        """Create notification and trigger sending."""
        notification = super().create(validated_data)
        # Trigger email sending task
        from .tasks import send_notification_email
        send_notification_email.delay(notification.id)
        return notification


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationTemplate model.
    """
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationPreference model.
    """
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
