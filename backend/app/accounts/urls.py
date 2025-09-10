
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('accounts', views.AccountViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # path('register/', views.register, name='register'),
    # path('login/', views.login, name='login'),
]