"""
Unit tests for users app.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import User, UserProfile


class UserRegistrationTestCase(APITestCase):
    """测试用户注册功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('user-register')
        
    def test_register_volunteer_success(self):
        """测试志愿者注册成功"""
        data = {
            'username': 'testvolunteer',
            'email': 'volunteer@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'Volunteer',
            'role': 'volunteer'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'volunteer@test.com')
        self.assertEqual(response.data['user']['role'], 'volunteer')
        
    def test_register_organizer_success(self):
        """测试组织者注册成功"""
        data = {
            'username': 'testorganizer',
            'email': 'organizer@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'Organizer',
            'role': 'organizer'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'organizer')
        
    def test_register_duplicate_email(self):
        """测试重复邮箱注册失败"""
        # 先创建一个用户
        User.objects.create_user(
            username='existing',
            email='existing@test.com',
            password='testpass123',
            first_name='Existing',
            last_name='User',
            role='volunteer'
        )
        
        # 尝试用相同邮箱注册
        data = {
            'username': 'newuser',
            'email': 'existing@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'volunteer'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        
    def test_register_password_mismatch(self):
        """测试密码不匹配"""
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'testpass123',
            'password_confirm': 'differentpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'volunteer'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_register_missing_required_fields(self):
        """测试缺少必填字段"""
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            # 缺少密码
            'role': 'volunteer'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_register_admin_role_blocked(self):
        """测试不能通过注册接口创建管理员"""
        data = {
            'username': 'testadmin',
            'email': 'admin@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'Admin',
            'role': 'admin'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTestCase(APITestCase):
    """测试用户登录功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('user-login')
        
        # 创建测试用户
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        # 确保密码正确设置
        self.user.set_password('testpass123')
        self.user.save()
        
    def test_login_success(self):
        """测试登录成功"""
        data = {
            'email': 'test@test.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'test@test.com')
        
    def test_login_invalid_credentials(self):
        """测试错误的登录凭证"""
        data = {
            'email': 'test@test.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_login_nonexistent_user(self):
        """测试不存在的用户"""
        data = {
            'email': 'nonexistent@test.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileTestCase(APITestCase):
    """测试用户资料功能"""
    
    def setUp(self):
        self.client = APIClient()
        
        # 创建测试用户
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        # 确保密码正确设置
        self.user.set_password('testpass123')
        self.user.save()
        
        # 创建token
        self.token = Token.objects.create(user=self.user)
        
        # 设置认证
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
    def test_get_profile(self):
        """测试获取用户资料"""
        url = reverse('user-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@test.com')
        
    def test_update_profile(self):
        """测试更新用户资料"""
        url = reverse('user-update')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'bio': 'This is my bio'
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证更新
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        self.assertEqual(self.user.bio, 'This is my bio')
        
    def test_profile_requires_authentication(self):
        """测试未认证用户无法访问资料"""
        self.client.credentials()  # 移除认证
        url = reverse('user-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserModelTestCase(TestCase):
    """测试用户模型"""
    
    def test_create_user(self):
        """测试创建用户"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@test.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.role, 'volunteer')
        
    def test_user_full_name(self):
        """测试用户全名"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        
        self.assertEqual(user.full_name, 'Test User')
        
    def test_user_str_method(self):
        """测试用户字符串表示"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        
        self.assertEqual(str(user), 'Test User (test@test.com)')
    
    def test_get_volunteer_level(self):
        """测试志愿者等级计算"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        
        # 测试不同等级
        user.total_volunteer_hours = 5
        self.assertEqual(user.get_volunteer_level(), 'New')
        
        user.total_volunteer_hours = 15
        self.assertEqual(user.get_volunteer_level(), 'Beginner')
        
        user.total_volunteer_hours = 75
        self.assertEqual(user.get_volunteer_level(), 'Intermediate')
        
        user.total_volunteer_hours = 250
        self.assertEqual(user.get_volunteer_level(), 'Advanced')
        
        user.total_volunteer_hours = 600
        self.assertEqual(user.get_volunteer_level(), 'Expert')
    
    def test_update_impact_score(self):
        """测试影响力分数计算"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        
        user.total_volunteer_hours = 50
        user.skills = ['Python', 'Django']
        user.languages = ['English', 'Chinese']
        user.interests = ['Environment', 'Education']
        user.update_impact_score()
        
        # 验证分数计算
        self.assertGreater(user.impact_score, 0)
        self.assertLessEqual(user.impact_score, 1000)


class UserLogoutTestCase(APITestCase):
    """测试用户登出功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_logout_success(self):
        """测试登出成功"""
        url = reverse('user-logout')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 验证token被删除
        self.assertFalse(Token.objects.filter(user=self.user).exists())


class PasswordChangeTestCase(APITestCase):
    """测试密码修改功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='oldpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.user.set_password('oldpass123')
        self.user.save()
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_change_password_success(self):
        """测试密码修改成功"""
        url = reverse('password-change')
        data = {
            'old_password': 'oldpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 验证新密码有效
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))
    
    def test_change_password_wrong_old_password(self):
        """测试旧密码错误"""
        url = reverse('password-change')
        data = {
            'old_password': 'wrongpass',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_change_password_mismatch(self):
        """测试新密码确认不匹配"""
        url = reverse('password-change')
        data = {
            'old_password': 'oldpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'differentpass'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserAvatarTestCase(APITestCase):
    """测试头像上传和删除功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_upload_avatar_no_file(self):
        """测试上传头像但没有文件"""
        url = reverse('upload-avatar')
        response = self.client.post(url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_remove_avatar_success(self):
        """测试删除头像成功"""
        url = reverse('remove-avatar')
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)


class UserStatsTestCase(APITestCase):
    """测试用户统计功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_get_user_stats(self):
        """测试获取用户统计"""
        url = reverse('user-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_hours', response.data)
        self.assertIn('activities_joined', response.data)
        self.assertIn('achievements_earned', response.data)
        self.assertIn('impact_score', response.data)
        self.assertIn('volunteer_level', response.data)
    
    def test_user_stats_requires_authentication(self):
        """测试统计需要认证"""
        self.client.credentials()
        url = reverse('user-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserAchievementsTestCase(APITestCase):
    """测试用户成就功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_list_achievements(self):
        """测试列出用户成就"""
        from .models import UserAchievement
        
        # 创建测试成就
        UserAchievement.objects.create(
            user=self.user,
            achievement_type='first_activity',
            title='First Activity',
            description='Completed first activity'
        )
        
        url = reverse('user-achievements')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserActivitiesTestCase(APITestCase):
    """测试用户活动列表功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_list_user_activities(self):
        """测试列出用户活动"""
        from .models import UserActivity
        
        # 创建测试活动记录
        UserActivity.objects.create(
            user=self.user,
            activity_id=1,
            status='registered'
        )
        
        url = reverse('user-activities')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserNotificationsTestCase(APITestCase):
    """测试用户通知功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_list_notifications(self):
        """测试列出用户通知"""
        from .models import UserNotification
        
        # 创建测试通知
        UserNotification.objects.create(
            user=self.user,
            notification_type='system',
            title='Test Notification',
            message='Test message'
        )
        
        url = reverse('user-notifications')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('unread_count', response.data)
        self.assertIn('notifications', response.data)
    
    def test_mark_notification_read(self):
        """测试标记通知为已读"""
        from .models import UserNotification
        
        notification = UserNotification.objects.create(
            user=self.user,
            notification_type='system',
            title='Test Notification',
            message='Test message'
        )
        
        url = reverse('mark-notification-read', kwargs={'notification_id': notification.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
    
    def test_mark_all_notifications_read(self):
        """测试标记所有通知为已读"""
        from .models import UserNotification
        
        # 创建多个未读通知
        UserNotification.objects.create(
            user=self.user,
            notification_type='system',
            title='Notification 1',
            message='Message 1'
        )
        UserNotification.objects.create(
            user=self.user,
            notification_type='system',
            title='Notification 2',
            message='Message 2'
        )
        
        url = reverse('mark-all-notifications-read')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 验证所有通知已读
        unread_count = UserNotification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)
    
    def test_mark_notification_read_not_found(self):
        """测试标记不存在的通知"""
        url = reverse('mark-notification-read', kwargs={'notification_id': 99999})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class GlobalStatsTestCase(APITestCase):
    """测试全局统计功能"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_get_global_stats(self):
        """测试获取全局统计（公开访问）"""
        # 创建一些测试用户
        User.objects.create_user(
            username='volunteer1',
            email='vol1@test.com',
            password='testpass123',
            role='volunteer'
        )
        User.objects.create_user(
            username='organizer1',
            email='org1@test.com',
            password='testpass123',
            role='organizer'
        )
        
        url = reverse('global-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_volunteers', response.data)
        self.assertIn('total_ngos', response.data)


class SearchUsersTestCase(APITestCase):
    """测试搜索用户功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_search_users(self):
        """测试搜索用户"""
        # 创建测试用户
        User.objects.create_user(
            username='john',
            email='john@test.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
            role='volunteer'
        )
        
        url = reverse('search-users')
        response = self.client.get(url, {'q': 'john'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class HealthCheckTestCase(APITestCase):
    """测试健康检查功能"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_health_check(self):
        """测试健康检查"""
        url = reverse('health')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CreateNotificationTestCase(APITestCase):
    """测试创建通知功能（跨服务调用）"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
    
    def test_create_notification_success(self):
        """测试成功创建通知"""
        url = reverse('create-notification')
        data = {
            'user_id': self.user.id,
            'title': '测试通知',
            'message': '这是一条测试通知',
            'notification_type': 'system'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('title', response.data)
    
    def test_create_notification_with_activity_id(self):
        """测试创建带活动ID的通知"""
        url = reverse('create-notification')
        data = {
            'user_id': self.user.id,
            'title': '活动通知',
            'message': '您有新活动',
            'notification_type': 'activity',
            'activity_id': 1
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_notification_missing_required_fields(self):
        """测试缺少必填字段"""
        url = reverse('create-notification')
        data = {
            'user_id': self.user.id,
            # 缺少 title 和 message
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_notification_user_not_found(self):
        """测试用户不存在"""
        url = reverse('create-notification')
        data = {
            'user_id': 99999,
            'title': '测试通知',
            'message': '这是一条测试通知'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SearchUsersExtendedTestCase(APITestCase):
    """测试搜索用户功能（扩展场景）"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer',
            location='Beijing'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        # 创建更多测试用户
        User.objects.create_user(
            username='john',
            email='john@test.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
            role='volunteer',
            location='Shanghai'
        )
        User.objects.create_user(
            username='organizer1',
            email='org1@test.com',
            password='testpass123',
            first_name='Organizer',
            last_name='One',
            role='organizer',
            location='Beijing'
        )
    
    def test_search_users_by_role(self):
        """测试按角色搜索"""
        url = reverse('search-users')
        response = self.client.get(url, {'role': 'organizer'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if response.data:
            for user in response.data:
                self.assertNotEqual(user.get('id'), self.user.id)  # 排除当前用户
    
    def test_search_users_by_location(self):
        """测试按位置搜索"""
        url = reverse('search-users')
        response = self.client.get(url, {'location': 'Beijing'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_search_users_combined_filters(self):
        """测试组合过滤条件"""
        url = reverse('search-users')
        response = self.client.get(url, {'q': 'John', 'role': 'volunteer'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_search_users_excludes_current_user(self):
        """测试搜索排除当前用户"""
        url = reverse('search-users')
        response = self.client.get(url, {'q': 'test'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if response.data:
            user_ids = [u.get('id') for u in response.data]
            self.assertNotIn(self.user.id, user_ids)


class UserProfileUpdateTestCase(APITestCase):
    """测试用户详细资料更新"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_get_user_profile(self):
        """测试获取用户详细资料"""
        url = reverse('user-profile-update')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_user_profile(self):
        """测试更新用户详细资料"""
        url = reverse('user-profile-update')
        data = {
            'bio': 'Updated bio',
            'location': 'Updated location'
        }
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserUpdateTestCase(APITestCase):
    """测试用户更新功能"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_update_user_basic_info(self):
        """测试更新用户基本信息"""
        url = reverse('user-update')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')


class UserProfileViewTestCase(APITestCase):
    """测试用户资料视图"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='volunteer'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_get_profile(self):
        """测试获取用户资料"""
        url = reverse('user-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('email', response.data)
    
    def test_update_profile(self):
        """测试更新用户资料"""
        url = reverse('user-profile')
        data = {
            'phone': '1234567890',
            'bio': 'Test bio'
        }
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

