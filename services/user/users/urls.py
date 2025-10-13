"""
URL configuration for users app.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='user-logout'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UserUpdateView.as_view(), name='user-update'),
    path('profile/details/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('profile/password/', views.PasswordChangeView.as_view(), name='password-change'),
    
    # User data
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('achievements/', views.UserAchievementsView.as_view(), name='user-achievements'),
    path('activities/', views.UserActivitiesView.as_view(), name='user-activities'),
    path('notifications/', views.UserNotificationsView.as_view(), name='user-notifications'),
    
    # Notification actions
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Search
    path('search/', views.search_users, name='search-users'),
]
