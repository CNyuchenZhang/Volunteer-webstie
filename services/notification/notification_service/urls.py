"""
URL configuration for notification_service project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet)
router.register(r'templates', views.NotificationTemplateViewSet)
router.register(r'preferences', views.NotificationPreferenceViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    # 健康检查端点：用于 K8s liveness/readiness 探针
    path('health', lambda request: HttpResponse("healthy\n", content_type="text/plain")),
]
