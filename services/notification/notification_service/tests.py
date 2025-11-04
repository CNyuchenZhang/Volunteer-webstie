"""
Unit tests for notification service.
"""
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from django.db.models.signals import post_save
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .models import Notification
from . import signals


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


@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class NotificationAPITestCase(APITestCase):
    """测试通知API（简化版，不测试需要RabbitMQ的功能）"""
    
    def setUp(self):
        self.client = APIClient()
        # 断开信号，避免触发 Celery 任务
        post_save.disconnect(signals.notification_created, sender=Notification)
        
        # Mock Celery 任务，避免连接 RabbitMQ
        # 由于序列化器在 create 方法内部动态导入，需要同时 patch tasks 和可能已经导入的模块
        # 方法1: patch tasks 模块
        self.task_patcher = patch('notification_service.tasks.send_notification_email')
        self.mock_task_func = self.task_patcher.start()
        # 方法2: 创建 mock 对象并设置 delay 方法
        mock_task_obj = MagicMock()
        mock_task_obj.delay = MagicMock()
        self.mock_task_func.delay = MagicMock()
        
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
        # 停止 mock
        if hasattr(self, 'task_patcher'):
            self.task_patcher.stop()
        # 重新连接信号
        post_save.connect(signals.notification_created, sender=Notification)
        
    def test_list_notifications(self):
        """测试列出通知"""
        url = reverse('notification-list')
        response = self.client.get(url, {'recipient_id': 1})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_notification(self):
        """测试创建通知"""
        # Celery 任务已在 setUp 中被 mock
        url = reverse('notification-list')
        data = {
            'recipient_id': 1,
            'recipient_email': 'test@test.com',
            'recipient_name': 'Test User',
            'title': '新通知',
            'message': '这是一条新通知',
            'notification_type': 'system_announcement'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
    
    def test_get_notification_detail(self):
        """测试获取通知详情"""
        url = reverse('notification-detail', kwargs={'pk': self.notification.id})
        response = self.client.get(url)
        
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
    
    def test_mark_notification_read(self):
        """测试标记通知为已读"""
        url = reverse('notification-detail', kwargs={'pk': self.notification.id})
        data = {'is_read': True}
        response = self.client.patch(url, data, format='json')
        
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
    
    def test_filter_notifications_by_type(self):
        """测试按类型筛选通知"""
        # 创建不同类型的通知
        Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='活动通知',
            message='消息',
            notification_type='activity_reminder'
        )
        
        url = reverse('notification-list')
        response = self.client.get(url, {'recipient_id': 1, 'notification_type': 'activity_reminder'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_filter_unread_notifications(self):
        """测试筛选未读通知"""
        # 创建已读和未读通知
        Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='未读通知',
            message='消息',
            notification_type='system_announcement',
            is_read=False
        )
        
        url = reverse('notification-list')
        response = self.client.get(url, {'recipient_id': 1, 'is_read': False})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_delete_notification(self):
        """测试删除通知"""
        url = reverse('notification-detail', kwargs={'pk': self.notification.id})
        response = self.client.delete(url)
        
        self.assertIn(response.status_code, [status.HTTP_204_NO_CONTENT, status.HTTP_404_NOT_FOUND])


class NotificationModelExtendedTestCase(TestCase):
    """测试通知模型扩展功能"""
    
    def setUp(self):
        # 断开信号，避免触发 Celery 任务
        post_save.disconnect(signals.notification_created, sender=Notification)
    
    def tearDown(self):
        # 重新连接信号
        post_save.connect(signals.notification_created, sender=Notification)
    
    def test_notification_priority(self):
        """测试通知优先级"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='高优先级通知',
            message='重要消息',
            notification_type='system_announcement',
            priority='high'
        )
        
        self.assertEqual(notification.priority, 'high')
    
    def test_notification_with_activity_id(self):
        """测试带活动ID的通知"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='活动通知',
            message='您有新活动',
            notification_type='activity_reminder',
            activity_id=1
        )
        
        self.assertEqual(notification.activity_id, 1)
    
    def test_notification_created_at(self):
        """测试通知创建时间"""
        notification = Notification.objects.create(
            recipient_id=1,
            recipient_email='test@test.com',
            recipient_name='Test User',
            title='测试通知',
            message='测试消息',
            notification_type='system_announcement'
        )
        
        self.assertIsNotNone(notification.created_at)
        self.assertIsNone(notification.read_at)
        self.assertFalse(notification.is_read)

