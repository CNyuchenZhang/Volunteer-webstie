import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios - 完全在 factory 内部创建，通过全局对象访问
vi.mock('axios', () => {
  // 在 factory 函数内部创建所有 mock
  const instanceMethods = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  const defaultMethods = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  const mockAxiosInstance = {
    ...instanceMethods,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  const mockAxiosDefault = {
    create: vi.fn(() => mockAxiosInstance),
    ...defaultMethods,
  };

  // 将 mock 存储到全局对象（window）以便测试访问
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__mockAxiosStore = {
      instanceMethods,
      defaultMethods,
      instance: mockAxiosInstance,
      default: mockAxiosDefault,
    };
  }

  return {
    default: mockAxiosDefault,
    __esModule: true,
  };
});

// 导入 API（在 mock 之后）
import { userAPI, activityAPI, notificationAPI } from '../../services/api';
import axios from 'axios';

// 获取 mock 存储
const getMockStore = () => (globalThis as any).__mockAxiosStore;

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
      const mockStore = getMockStore();
      const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
      mockStore.instanceMethods.post.mockResolvedValue(mockResponse);

      const result = await userAPI.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(mockStore.instanceMethods.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用注册API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { user: { id: 1, username: 'testuser' } } };
      mockStore.instanceMethods.post.mockResolvedValue(mockResponse);

      const result = await userAPI.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'volunteer',
      });

      expect(mockStore.instanceMethods.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用获取用户信息API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { id: 1, username: 'testuser' } };
      mockStore.instanceMethods.get.mockResolvedValue(mockResponse);

      const result = await userAPI.getProfile();

      expect(mockStore.instanceMethods.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('activityAPI', () => {
    it('应该能够调用获取活动列表API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { results: [], count: 0 } };
      mockStore.instanceMethods.get.mockResolvedValue(mockResponse);

      const result = await activityAPI.getActivities({});

      expect(mockStore.instanceMethods.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用获取活动详情API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { id: 1, title: 'Test Activity' } };
      mockStore.instanceMethods.get.mockResolvedValue(mockResponse);

      const result = await activityAPI.getActivity(1);

      expect(mockStore.instanceMethods.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用创建活动API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { id: 1, title: 'New Activity' } };
      mockStore.instanceMethods.post.mockResolvedValue(mockResponse);

      const result = await activityAPI.createActivity({
        title: 'New Activity',
        description: 'Test description',
        category: 1,
        location: 'Test Location',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-01T03:00:00Z',
        max_participants: 10,
      });

      expect(mockStore.instanceMethods.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('notificationAPI', () => {
    it('应该能够调用获取通知列表API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { results: [], count: 0 } };
      mockStore.defaultMethods.get.mockResolvedValue(mockResponse);
      // 设置 localStorage 中的 user
      localStorageMock.getItem = vi.fn((key: string) => {
        if (key === 'user') {
          return JSON.stringify({ id: 1 });
        }
        return null;
      });

      const result = await notificationAPI.getNotifications();

      expect(mockStore.defaultMethods.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('应该能够调用标记通知为已读API', async () => {
      const mockStore = getMockStore();
      const mockResponse = { data: { id: 1, read: true } };
      mockStore.defaultMethods.post.mockResolvedValue(mockResponse);

      const result = await notificationAPI.markAsRead(1);

      expect(mockStore.defaultMethods.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });
});
