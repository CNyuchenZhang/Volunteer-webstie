import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userAPI, activityAPI, notificationAPI } from '../../services/api';

// Mock axios - 需要在导入 api 之前 mock
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

const mockAxiosDefault = {
  create: vi.fn(() => mockAxiosInstance),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('axios', () => {
  return {
    default: mockAxiosDefault,
    __esModule: true,
  };
});

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
      mockAxiosInstance.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await userAPI.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用注册API', async () => {
      const mockResponse = { data: { user: { id: 1, username: 'testuser' } } };
      mockAxiosInstance.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await userAPI.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'volunteer',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用获取用户信息API', async () => {
      const mockResponse = { data: { id: 1, username: 'testuser' } };
      mockAxiosInstance.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await userAPI.getProfile();

      expect(mockAxiosInstance.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('activityAPI', () => {
    it('应该能够调用获取活动列表API', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      mockAxiosInstance.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await activityAPI.getActivities({});

      expect(mockAxiosInstance.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用获取活动详情API', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Activity' } };
      mockAxiosInstance.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await activityAPI.getActivity(1);

      expect(mockAxiosInstance.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用创建活动API', async () => {
      const mockResponse = { data: { id: 1, title: 'New Activity' } };
      mockAxiosInstance.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await activityAPI.createActivity({
        title: 'New Activity',
        description: 'Test description',
        category: 1,
        location: 'Test Location',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-01T03:00:00Z',
        max_participants: 10,
      });

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('notificationAPI', () => {
    it('应该能够调用获取通知列表API', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      mockAxiosDefault.get = vi.fn().mockResolvedValue(mockResponse);
      // 设置 localStorage 中的 user
      localStorageMock.getItem = vi.fn((key: string) => {
        if (key === 'user') {
          return JSON.stringify({ id: 1 });
        }
        return null;
      });

      const result = await notificationAPI.getNotifications();

      expect(mockAxiosDefault.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用标记通知为已读API', async () => {
      const mockResponse = { data: { id: 1, read: true } };
      mockAxiosDefault.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await notificationAPI.markAsRead(1);

      expect(mockAxiosDefault.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });
});
