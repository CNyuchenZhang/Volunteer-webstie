"""
Admin configuration for activities app.
"""
from django.contrib import admin
from .models import (
    ActivityCategory, Activity, ActivityParticipant, ActivityReview,
    ActivityTag, ActivityTagMapping, ActivityLike, ActivityShare
)


@admin.register(ActivityCategory)
class ActivityCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer_name', 'status', 'approval_status', 'start_date', 'created_at']
    list_filter = ['status', 'approval_status', 'category', 'created_at']
    search_fields = ['title', 'description', 'organizer_name', 'organizer_email']
    readonly_fields = ['created_at', 'updated_at', 'published_at']


@admin.register(ActivityParticipant)
class ActivityParticipantAdmin(admin.ModelAdmin):
    list_display = ['user_name', 'activity', 'status', 'registered_at']
    list_filter = ['status', 'registered_at']
    search_fields = ['user_name', 'user_email', 'activity__title']


@admin.register(ActivityReview)
class ActivityReviewAdmin(admin.ModelAdmin):
    list_display = ['user_name', 'activity', 'rating', 'created_at']
    list_filter = ['rating', 'is_verified', 'created_at']
    search_fields = ['user_name', 'activity__title', 'comment']


@admin.register(ActivityTag)
class ActivityTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(ActivityTagMapping)
class ActivityTagMappingAdmin(admin.ModelAdmin):
    list_display = ['activity', 'tag', 'created_at']
    list_filter = ['created_at']
    search_fields = ['activity__title', 'tag__name']


@admin.register(ActivityLike)
class ActivityLikeAdmin(admin.ModelAdmin):
    list_display = ['activity', 'user_id', 'created_at']
    list_filter = ['created_at']
    search_fields = ['activity__title']


@admin.register(ActivityShare)
class ActivityShareAdmin(admin.ModelAdmin):
    list_display = ['activity', 'user_id', 'platform', 'created_at']
    list_filter = ['platform', 'created_at']
    search_fields = ['activity__title']
