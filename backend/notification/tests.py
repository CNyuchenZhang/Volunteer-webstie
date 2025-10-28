"""
Unit tests for notification service.
"""
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from django.db.models.signals import post_save
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Notification
from . import signals
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token


# 禁用 Celery 异步任务，使用同步执行
@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class NotificationModelTestCase(TestCase):
    """测试通知模型"""

    def setUp(self):
        # 断开信号，避免触发 Celery 任务
        post_save.disconnect(signals.notification_created, sender=Notification)

    def tearDown(self):
        # 重新连接信号
        post_save.connect(signals.notification_created, sender=Notification)

    def test_create_notification(self):
        """测试创建通知"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='测试通知',
            message='这是一条测试通知',
            notification_type='system_announcement'
        )

        self.assertEqual(notification.title, '测试通知')
        self.assertEqual(notification.notification_type, 'system_announcement')
        self.assertFalse(notification.is_read)
        self.assertEqual(notification.recipient_id, 1)

    def test_notification_str_method(self):
        """测试通知字符串表示"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='测试通知',
            message='测试消息',
            notification_type='system_announcement'
        )

        self.assertIn('测试通知', str(notification))
        self.assertIn('Test User', str(notification))

    def test_mark_as_read(self):
        """测试标记通知为已读"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='测试通知',
            message='测试消息',
            notification_type='system_announcement'
        )

        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)

        notification.mark_as_read()

        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)

    def test_mark_as_sent(self):
        """测试标记通知为已发送"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='测试通知',
            message='测试消息',
            notification_type='system_announcement'
        )

        self.assertFalse(notification.is_sent)
        self.assertIsNone(notification.sent_at)

        notification.mark_as_sent()

        self.assertTrue(notification.is_sent)
        self.assertIsNotNone(notification.sent_at)


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class NotificationAPITestCase(APITestCase):
    """测试通知API（简化版，不测试需要RabbitMQ的功能）"""

    def setUp(self):
        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(
            id=1,  # 与recipient_id=1匹配
            username='test_user',
            email='test@test.com',
            password='testpass123'
        )
        # 2. 生成Token并添加认证
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')  # 关键：添加认证头
        # 断开信号，避免触发 Celery 任务
        post_save.disconnect(signals.notification_created, sender=Notification)

        # 创建测试通知
        self.notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='测试通知',
            message='这是一条测试通知',
            notification_type='system_announcement'
        )

    def tearDown(self):
        # 重新连接信号
        post_save.connect(signals.notification_created, sender=Notification)

    def test_list_notifications(self):
        url = reverse('notification-list')
        # 认证用户访问时，无需传递 recipient_id（接口会自动过滤当前用户的通知）
        response = self.client.get(url)  # 移除 {'recipient_id': 1} 参数
        self.assertEqual(response.status_code, status.HTTP_200_OK)


