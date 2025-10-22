"""
URL configuration for activities app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ActivityViewSet,
    ActivityParticipantViewSet,
    AdminActivityApprovalViewSet,
    ActivityCategoryViewSet,
    ActivityStatsView,
    health,
)

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'participants', ActivityParticipantViewSet, basename='participant')
router.register(r'admin/activities', AdminActivityApprovalViewSet, basename='admin-activity')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', ActivityStatsView.as_view(), name='activity-stats'),
    path('categories/', ActivityCategoryViewSet.as_view(), name='activity-categories'),
    path('health/', health, name='health'),
]
