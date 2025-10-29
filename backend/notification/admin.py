"""
Admin configuration for notification service.
"""
from django.contrib import admin
from .models import Notification, NotificationTemplate, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'recipient_name', 'notification_type', 'title', 'priority',
        'is_read', 'is_sent', 'created_at'
    ]
    list_filter = ['notification_type', 'priority', 'is_read', 'is_sent', 'created_at']
    search_fields = ['recipient_name', 'recipient_email', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'read_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Recipient', {
            'fields': ('recipient_id', 'recipient_email', 'recipient_name')
        }),
        ('Content', {
            'fields': ('notification_type', 'title', 'message', 'priority')
        }),
        ('Status', {
            'fields': ('is_read', 'is_sent', 'sent_at', 'read_at')
        }),
        ('Related Objects', {
            'fields': ('activity_id', 'user_id')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'notification_type', 'is_active', 'created_at']
    list_filter = ['notification_type', 'is_active', 'created_at']
    search_fields = ['name', 'subject_template']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'email_notifications', 'sms_notifications', 'push_notifications']
    list_filter = ['email_notifications', 'sms_notifications', 'push_notifications']
    search_fields = ['user_id']
    readonly_fields = ['created_at', 'updated_at']
