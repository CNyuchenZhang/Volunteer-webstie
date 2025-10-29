"""
Signal handlers for notification service.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from .tasks import send_notification_email


@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    """
    Send notification when a new notification is created.
    """
    if created and not instance.is_sent:
        # Queue the notification for sending
        send_notification_email.delay(instance.id)
