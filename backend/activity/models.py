"""
Activity models for the volunteer platform.
"""
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class ActivityCategory(models.Model):
    """
    Activity categories.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=7, default='#1890ff')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_categories'
        verbose_name = 'Activity Category'
        verbose_name_plural = 'Activity Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Activity(models.Model):
    """
    Volunteer activities.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('published', 'Published'),
        ('full', 'Full'),
        ('join_waitlist', 'Join Waitlist'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    full_description = models.TextField(blank=True)
    category = models.ForeignKey(ActivityCategory, on_delete=models.CASCADE, related_name='activities')

    # Location
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField(blank=True, null=True)

    # Capacity
    max_participants = models.PositiveIntegerField()
    min_participants = models.PositiveIntegerField(default=1)

    # Requirements
    required_skills = models.JSONField(default=list, blank=True)
    age_requirement = models.CharField(max_length=100, blank=True)
    physical_requirements = models.TextField(blank=True)
    equipment_needed = models.TextField(blank=True)

    # Media
    cover_image = models.ImageField(upload_to='activities/', blank=True, null=True)
    images = models.JSONField(default=list, blank=True)

    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)

    # Approval workflow
    approval_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending')
    approved_by_id = models.PositiveIntegerField(blank=True, null=True)  # Admin user ID
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)

    # Organizer
    organizer_id = models.PositiveIntegerField()  # Reference to user service
    organizer_name = models.CharField(max_length=255)
    organizer_email = models.EmailField()
    organizer_phone = models.CharField(max_length=20, blank=True)

    # Statistics
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'activities'
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def is_past(self):
        """Check if activity is in the past."""
        return self.end_date < timezone.now()

    @property
    def is_upcoming(self):
        """Check if activity is upcoming."""
        return self.start_date > timezone.now()

    @property
    def is_ongoing(self):
        """Check if activity is currently ongoing."""
        now = timezone.now()
        return self.start_date <= now <= self.end_date

    @property
    def registration_open(self):
        """Check if registration is still open."""
        if self.registration_deadline:
            return timezone.now() < self.registration_deadline
        return self.start_date > timezone.now()

    def get_participants_count(self):
        """Get current number of participants."""
        return self.participants.filter(status__in=['approved', 'registered', 'attended', 'completed']).count()

    def get_available_spots(self):
        """Get number of available spots."""
        return max(0, self.max_participants - self.get_participants_count())

    def is_full(self):
        """Check if activity is full."""
        return self.get_participants_count() >= self.max_participants


class ActivityParticipant(models.Model):
    """
    Activity participants.
    """
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='participants')
    user_id = models.PositiveIntegerField()  # Reference to user service
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    user_phone = models.CharField(max_length=20, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    # Application details
    application_message = models.TextField(blank=True)
    skills_match = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], default='beginner')

    # Approval workflow
    approved_by_id = models.PositiveIntegerField(blank=True, null=True)  # Organizer user ID
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True)
    organizer_notes = models.TextField(blank=True)

    # Volunteer hours
    hours_volunteered = models.PositiveIntegerField(default=0)

    # Feedback
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    feedback = models.TextField(blank=True)

    # Emergency contact
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'activity_participants'
        verbose_name = 'Activity Participant'
        verbose_name_plural = 'Activity Participants'
        unique_together = ['activity', 'user_id']
        ordering = ['-registered_at']

    def __str__(self):
        return f"{self.user_name} - {self.activity.title}"


class ActivityReview(models.Model):
    """
    Activity reviews and ratings.
    """
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='reviews')
    user_id = models.PositiveIntegerField()  # Reference to user service
    user_name = models.CharField(max_length=255)
    user_avatar = models.URLField(blank=True)

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    is_verified = models.BooleanField(default=False)  # Verified participant

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'activity_reviews'
        verbose_name = 'Activity Review'
        verbose_name_plural = 'Activity Reviews'
        unique_together = ['activity', 'user_id']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_name} - {self.activity.title} ({self.rating}/5)"


class ActivityTag(models.Model):
    """
    Activity tags for better categorization.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#52c41a')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_tags'
        verbose_name = 'Activity Tag'
        verbose_name_plural = 'Activity Tags'
        ordering = ['name']

    def __str__(self):
        return self.name


class ActivityTagMapping(models.Model):
    """
    Mapping between activities and tags.
    """
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='tag_mappings')
    tag = models.ForeignKey(ActivityTag, on_delete=models.CASCADE, related_name='activity_mappings')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_tag_mappings'
        verbose_name = 'Activity Tag Mapping'
        verbose_name_plural = 'Activity Tag Mappings'
        unique_together = ['activity', 'tag']

    def __str__(self):
        return f"{self.activity.title} - {self.tag.name}"


class ActivityLike(models.Model):
    """
    Activity likes/favorites.
    """
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='likes')
    user_id = models.PositiveIntegerField()  # Reference to user service
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_likes'
        verbose_name = 'Activity Like'
        verbose_name_plural = 'Activity Likes'
        unique_together = ['activity', 'user_id']

    def __str__(self):
        return f"Like: {self.activity.title} by user {self.user_id}"


class ActivityShare(models.Model):
    """
    Activity shares.
    """
    SHARE_PLATFORMS = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('other', 'Other'),
    ]

    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='shares')
    user_id = models.PositiveIntegerField()  # Reference to user service
    platform = models.CharField(max_length=20, choices=SHARE_PLATFORMS)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_shares'
        verbose_name = 'Activity Share'
        verbose_name_plural = 'Activity Shares'

    def __str__(self):
        return f"Share: {self.activity.title} on {self.platform} by user {self.user_id}"
