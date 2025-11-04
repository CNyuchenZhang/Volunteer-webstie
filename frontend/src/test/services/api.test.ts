import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { userAPI, activityAPI, notificationAPI } from '../../services/api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
(globalThis as any).localStorage = localStorageMock;

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('userAPI', () => {
    it('应该能够调用登录API', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
      mockedAxios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await userAPI.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用注册API', async () => {
      const mockResponse = { data: { user: { id: 1, username: 'testuser' } } };
      mockedAxios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await userAPI.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'volunteer',
      });

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用获取用户信息API', async () => {
      const mockResponse = { data: { id: 1, username: 'testuser' } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await userAPI.getProfile();

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('activityAPI', () => {
    it('应该能够调用获取活动列表API', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await activityAPI.getActivities({});

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用获取活动详情API', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Activity' } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await activityAPI.getActivity(1);

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用创建活动API', async () => {
      const mockResponse = { data: { id: 1, title: 'New Activity' } };
      mockedAxios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await activityAPI.createActivity({
        title: 'New Activity',
        description: 'Test description',
        category: 1,
        location: 'Test Location',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-01T03:00:00Z',
        max_participants: 10,
      });

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('notificationAPI', () => {
    it('应该能够调用获取通知列表API', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await notificationAPI.getNotifications({});

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用标记通知为已读API', async () => {
      const mockResponse = { data: { id: 1, is_read: true } };
      mockedAxios.patch = vi.fn().mockResolvedValue(mockResponse);

      const result = await notificationAPI.markAsRead(1);

      expect(mockedAxios.patch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });
});
