"""
Celery tasks for notification service.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import Notification


@shared_task
def send_notification_email(notification_id):
    """
    Send notification email.
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        
        # Send email
        send_mail(
            subject=notification.title,
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.recipient_email],
            fail_silently=False,
        )
        
        # Mark as sent
        notification.mark_as_sent()
        
        return f"Email sent successfully to {notification.recipient_email}"
        
    except Notification.DoesNotExist:
        return f"Notification with id {notification_id} not found"
    except Exception as e:
        return f"Error sending email: {str(e)}"


@shared_task
def send_activity_approval_notification(activity_id, approval_status, admin_notes=None):
    """
    Send notification when activity is approved or rejected.
    """
    try:
        # This would typically fetch activity details from activity service
        # For now, we'll create a mock notification
        
        if approval_status == 'approved':
            notification_type = 'activity_approval'
            title = "Activity Approved"
            message = f"Your submitted activity (ID: {activity_id}) has been approved."
        else:
            notification_type = 'activity_rejection'
            title = "Activity Rejected"
            message = f"Your submitted activity (ID: {activity_id}) has been rejected."
            if admin_notes:
                message += f"\n\nRejection reason: {admin_notes}"
        
        # Create notification
        notification = Notification.objects.create(
            recipient_id=1,  # This should be the actual organizer ID
            recipient_email="organizer@example.com",  # This should be the actual email
            recipient_name="Test Organizer",  # This should be the actual name
            notification_type=notification_type,
            title=title,
            message=message,
            priority='high',
            activity_id=activity_id,
        )
        
        # Send email
        send_notification_email.delay(notification.id)
        
        return f"Activity approval notification sent for activity {activity_id}"
        
    except Exception as e:
        return f"Error sending activity approval notification: {str(e)}"


@shared_task
def send_volunteer_application_notification(activity_id, volunteer_id, application_status):
    """
    Send notification when volunteer application is approved or rejected.
    """
    try:
        if application_status == 'approved':
            notification_type = 'volunteer_approval'
            title = "Volunteer Application Approved"
            message = f"Your volunteer application (Activity ID: {activity_id}) has been approved."
        else:
            notification_type = 'volunteer_rejection'
            title = "Volunteer Application Rejected"
            message = f"Your volunteer application (Activity ID: {activity_id}) has been rejected."
        
        # Create notification
        notification = Notification.objects.create(
            recipient_id=volunteer_id,
            recipient_email="volunteer@example.com",  # This should be the actual email
            recipient_name="Test Volunteer",  # This should be the actual name
            notification_type=notification_type,
            title=title,
            message=message,
            priority='medium',
            activity_id=activity_id,
            user_id=volunteer_id,
        )
        
        # Send email
        send_notification_email.delay(notification.id)
        
        return f"Volunteer application notification sent for activity {activity_id}"
        
    except Exception as e:
        return f"Error sending volunteer application notification: {str(e)}"
