"""
Notification models for the volunteer platform.
"""
from django.db import models
from django.utils import timezone


class Notification(models.Model):
    """
    System notifications.
    """
    NOTIFICATION_TYPES = [
        ('activity_approval', 'Activity Approval'),
        ('activity_rejection', 'Activity Rejection'),
        ('volunteer_approval', 'Volunteer Approval'),
        ('volunteer_rejection', 'Volunteer Rejection'),
        ('activity_status_change', 'Activity Status Change'),
        ('activity_reminder', 'Activity Reminder'),
        ('system_announcement', 'System Announcement'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Recipient
    recipient_id = models.PositiveIntegerField()  # Reference to user service
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=255)
    
    # Notification content
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Status
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    # Related objects
    activity_id = models.PositiveIntegerField(blank=True, null=True)
    user_id = models.PositiveIntegerField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.recipient_name} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_sent(self):
        """Mark notification as sent."""
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at'])


class NotificationTemplate(models.Model):
    """
    Notification templates for different types of notifications.
    """
    name = models.CharField(max_length=100, unique=True)
    notification_type = models.CharField(max_length=50)
    subject_template = models.CharField(max_length=255)
    message_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
    
    def __str__(self):
        return self.name


class NotificationPreference(models.Model):
    """
    User notification preferences.
    """
    user_id = models.PositiveIntegerField(unique=True)  # Reference to user service
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    
    # Specific notification types
    activity_updates = models.BooleanField(default=True)
    volunteer_updates = models.BooleanField(default=True)
    system_announcements = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Preferences for user {self.user_id}"
