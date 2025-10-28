"""
Unit tests for activities app.
"""
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import timedelta
from .models import Activity, ActivityCategory


class ActivityCategoryTestCase(TestCase):
    """测试活动分类模型"""

    def test_create_category(self):
        """测试创建分类"""
        category = ActivityCategory.objects.create(
            name='环境保护',
            description='环境保护相关活动',
            icon='environment'
        )

        self.assertEqual(category.name, '环境保护')
        self.assertTrue(category.is_active)
        self.assertEqual(str(category), '环境保护')


class ActivityModelTestCase(TestCase):
    """测试活动模型"""

    def setUp(self):
        self.category = ActivityCategory.objects.create(
            name='社区服务',
            description='社区服务活动'
        )

    def test_create_activity(self):
        """测试创建活动"""
        start_date = timezone.now() + timedelta(days=7)
        end_date = start_date + timedelta(hours=3)

        activity = Activity.objects.create(
            title='社区清洁活动',
            description='清洁社区公园',
            organizer_id=1,
            organizer_name='Test Organizer',
            organizer_email='organizer@test.com',
            category=self.category,
            location='社区公园',
            start_date=start_date,
            end_date=end_date,
            max_participants=20,
            approval_status='pending'
        )

        self.assertEqual(activity.title, '社区清洁活动')
        self.assertEqual(activity.category, self.category)
        self.assertEqual(activity.get_participants_count(), 0)
        self.assertFalse(activity.is_full())

    def test_activity_participants_count(self):
        """测试活动参与者计数"""
        activity = Activity.objects.create(
            title='测试活动',
            description='测试',
            organizer_id=1,
            organizer_name='Test Organizer',
            organizer_email='organizer@test.com',
            category=self.category,
            location='测试地点',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=2),
            max_participants=2
        )

        self.assertEqual(activity.get_participants_count(), 0)
        self.assertEqual(activity.get_available_spots(), 2)
        self.assertFalse(activity.is_full())

    def test_activity_str_method(self):
        """测试活动字符串表示"""
        activity = Activity.objects.create(
            title='测试活动',
            description='测试',
            organizer_id=1,
            organizer_name='Test Organizer',
            organizer_email='organizer@test.com',
            category=self.category,
            location='测试地点',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=2),
            max_participants=10
        )

        self.assertEqual(str(activity), '测试活动')


class ActivityAPITestCase(APITestCase):
    """测试活动API"""

    def setUp(self):
        self.client = APIClient()

        # 创建分类
        self.category = ActivityCategory.objects.create(
            name='教育',
            description='教育相关活动'
        )

        # 创建已批准的活动
        self.approved_activity = Activity.objects.create(
            title='已批准活动',
            description='这是一个已批准的活动',
            organizer_id=1,
            organizer_name='Test Organizer',
            organizer_email='organizer@test.com',
            category=self.category,
            location='测试地点',
            start_date=timezone.now() + timedelta(days=7),
            end_date=timezone.now() + timedelta(days=7, hours=3),
            max_participants=20,
            approval_status='approved'
        )

        # 创建待审批的活动
        self.pending_activity = Activity.objects.create(
            title='待审批活动',
            description='这是一个待审批的活动',
            organizer_id=1,
            organizer_name='Test Organizer',
            organizer_email='organizer@test.com',
            category=self.category,
            location='测试地点',
            start_date=timezone.now() + timedelta(days=7),
            end_date=timezone.now() + timedelta(days=7, hours=3),
            max_participants=15,
            approval_status='pending'
        )

    def test_list_approved_activities(self):
        """测试列出已批准的活动（未认证用户）"""
        url = reverse('activity-list')
        response = self.client.get(url, {'approval_status': 'approved'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 应该只返回已批准的活动
        results = response.data.get('results', response.data)
        if isinstance(results, list):
            self.assertGreaterEqual(len(results), 1)

    def test_get_activity_detail(self):
        """测试获取活动详情"""
        url = reverse('activity-detail', kwargs={'pk': self.approved_activity.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], '已批准活动')

    def test_filter_activities_by_category(self):
        """测试按分类筛选活动"""
        url = reverse('activity-list')
        response = self.client.get(url, {'category': self.category.id, 'approval_status': 'approved'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ActivityStatsTestCase(APITestCase):
    """测试活动统计API"""

    def setUp(self):
        self.client = APIClient()

        # 创建一些测试数据
        category = ActivityCategory.objects.create(
            name='测试分类',
            description='测试'
        )

        for i in range(3):
            Activity.objects.create(
                title=f'活动 {i}',
                description='测试活动',
                organizer_id=1,
                organizer_name='Test Organizer',
                organizer_email='organizer@test.com',
                category=category,
                location='测试地点',
                start_date=timezone.now() + timedelta(days=1),
                end_date=timezone.now() + timedelta(days=1, hours=2),
                max_participants=10,
                approval_status='approved'
            )

    def test_get_activity_stats(self):
        """测试获取活动统计"""
        url = reverse('activity-stats')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_activities', response.data)

