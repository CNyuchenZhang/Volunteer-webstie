"""
Admin configuration for users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserAchievement, UserActivity, UserNotification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom user admin.
    """
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone', 'bio', 'avatar', 'location', 'date_of_birth')}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('Volunteer Info', {'fields': ('total_volunteer_hours', 'impact_score', 'interests', 'skills', 'languages')}),
        ('Notifications', {'fields': ('email_notifications', 'sms_notifications', 'push_notifications')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'date_joined', 'last_login')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    User profile admin.
    """
    list_display = ('user', 'occupation', 'company', 'profile_visibility', 'created_at')
    list_filter = ('profile_visibility', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'occupation', 'company')
    ordering = ('-created_at',)


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    """
    User achievement admin.
    """
    list_display = ('user', 'achievement_type', 'title', 'earned_at')
    list_filter = ('achievement_type', 'earned_at')
    search_fields = ('user__email', 'title', 'description')
    ordering = ('-earned_at',)


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """
    User activity admin.
    """
    list_display = ('user', 'activity_id', 'status', 'hours_volunteered', 'registered_at')
    list_filter = ('status', 'registered_at')
    search_fields = ('user__email', 'activity_id')
    ordering = ('-registered_at',)


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    """
    User notification admin.
    """
    list_display = ('user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    ordering = ('-created_at',)
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} notifications marked as read.')
    mark_as_read.short_description = 'Mark selected notifications as read'
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f'{queryset.count()} notifications marked as unread.')
    mark_as_unread.short_description = 'Mark selected notifications as unread'
