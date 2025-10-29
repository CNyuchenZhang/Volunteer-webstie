"""
User models for the volunteer platform.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    """
    ROLE_CHOICES = [
        ('volunteer', 'Volunteer'),
        ('organizer', 'Organizer'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='volunteer')
    location = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Volunteer specific fields
    total_volunteer_hours = models.PositiveIntegerField(default=0)
    impact_score = models.PositiveIntegerField(default=0)

    # Preferences
    interests = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)

    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_volunteer_level(self):
        """Get volunteer level based on total hours."""
        if self.total_volunteer_hours >= 500:
            return 'Expert'
        elif self.total_volunteer_hours >= 200:
            return 'Advanced'
        elif self.total_volunteer_hours >= 50:
            return 'Intermediate'
        elif self.total_volunteer_hours >= 10:
            return 'Beginner'
        else:
            return 'New'

    def update_impact_score(self):
        """Calculate and update impact score based on various factors."""
        score = 0

        # Base score from volunteer hours
        score += min(self.total_volunteer_hours * 2, 200)

        # Bonus for skills
        score += len(self.skills) * 5

        # Bonus for languages
        score += len(self.languages) * 3

        # Bonus for interests
        score += len(self.interests) * 2

        # Bonus for verification
        if self.is_verified:
            score += 50

        self.impact_score = min(score, 1000)  # Cap at 1000
        self.save(update_fields=['impact_score'])


class UserProfile(models.Model):
    """
    Extended user profile information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Personal information
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=100, blank=True)

    # Professional information
    occupation = models.CharField(max_length=255, blank=True)
    company = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)

    # Social media
    linkedin_url = models.URLField(blank=True)
    twitter_handle = models.CharField(max_length=100, blank=True)

    # Volunteer preferences
    preferred_activity_types = models.JSONField(default=list, blank=True)
    preferred_time_slots = models.JSONField(default=list, blank=True)
    max_distance_willing_to_travel = models.PositiveIntegerField(default=50)  # in km

    # Privacy settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('volunteers', 'Volunteers Only'),
            ('private', 'Private'),
        ],
        default='public'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile for {self.user.full_name}"


class UserAchievement(models.Model):
    """
    User achievements and badges.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=100, blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_achievements'
        verbose_name = 'User Achievement'
        verbose_name_plural = 'User Achievements'
        unique_together = ['user', 'achievement_type']

    def __str__(self):
        return f"{self.user.full_name} - {self.title}"


class UserActivity(models.Model):
    """
    Track user participation in activities.
    """
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_id = models.PositiveIntegerField()  # Reference to activity service
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    hours_volunteered = models.PositiveIntegerField(default=0)
    rating = models.PositiveIntegerField(blank=True, null=True)  # User's rating of the activity
    feedback = models.TextField(blank=True)

    class Meta:
        db_table = 'user_activities'
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        unique_together = ['user', 'activity_id']

    def __str__(self):
        return f"{self.user.full_name} - Activity {self.activity_id}"


class UserNotification(models.Model):
    """
    User notifications.
    """
    NOTIFICATION_TYPES = [
        ('activity_reminder', 'Activity Reminder'),
        ('new_activity', 'New Activity'),
        ('achievement', 'Achievement'),
        ('message', 'Message'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)

    # Optional reference to related objects
    activity_id = models.PositiveIntegerField(blank=True, null=True)
    achievement_id = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        db_table = 'user_notifications'
        verbose_name = 'User Notification'
        verbose_name_plural = 'User Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.title}"

    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
