
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# router.register('accounts', views.AccountViewSet)

urlpatterns = [
    # path('', include(router.urls)),
    # path('register/', views.register, name='register'),
    path('volunteerRegister/', views.volunteer_register, name='volunteerRegister'),
    path('npoRegister/', views.npo_register, name='npoRegister'),
    # path('login/', views.login, name='login'),
    path('volunteerLogin/', views.volunteer_login, name='volunteerLogin'),
    path('npoLogin/', views.npo_login, name='npoLogin'),
    path('adminLogin/', views.admin_login, name='adminLogin'),
    path('findUserByUsername/', views.find_user_by_username, name='findUserByUsername'),
]