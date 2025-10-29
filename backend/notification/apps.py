"""
App configuration for notification service.
"""
from django.apps import AppConfig


class NotificationServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notification'
    verbose_name = 'Notification Service'

    def ready(self):
        """Import signal handlers when the app is ready."""
        # import notification_service.signals
        from . import signals
