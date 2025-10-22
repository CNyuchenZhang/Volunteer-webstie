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
        
        self.assertEqual(str(user), 'test@test.com')

