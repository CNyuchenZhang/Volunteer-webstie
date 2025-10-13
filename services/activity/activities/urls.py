"""
URL configuration for activities app.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.ActivityCategoryViewSet.as_view(), name='category-list'),
    path('activities/', views.ActivityViewSet.as_view(), name='activity-list'),
    path('activities/<int:pk>/', views.ActivityDetailView.as_view(), name='activity-detail'),
    path('activities/<int:pk>/approve/', views.ActivityApprovalView.as_view(), name='activity-approval'),
    path('participants/', views.ActivityParticipantViewSet.as_view(), name='participant-list'),
    path('participants/<int:pk>/approve/', views.ActivityParticipantApprovalView.as_view(), name='participant-approval'),
    path('reviews/', views.ActivityReviewViewSet.as_view(), name='review-list'),
    path('tags/', views.ActivityTagViewSet.as_view(), name='tag-list'),
    path('activities/like/', views.ActivityLikeView.as_view(), name='activity-like'),
    path('activities/share/', views.ActivityShareView.as_view(), name='activity-share'),
]
