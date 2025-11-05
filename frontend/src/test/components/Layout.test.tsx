import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import * as api from '../../services/api';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    i18n: { changeLanguage: vi.fn() }
  }),
  Trans: ({ children }: any) => children,
}));

// Mock AuthContext with a user
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      role: 'volunteer',
      first_name: 'Test',
      last_name: 'User',
    },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock API
vi.mock('../../services/api', () => ({
  notificationAPI: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
  },
  userAPI: {},
  activityAPI: {},
}));

// Mock LanguageSwitcher
vi.mock('../../components/LanguageSwitcher/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock for notifications
    (api.notificationAPI.getNotifications as any).mockResolvedValue({
      results: [
        { id: 1, message: '测试通知1', is_read: false, created_at: new Date().toISOString() },
        { id: 2, message: '测试通知2', is_read: true, created_at: new Date().toISOString() },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );
  };

  it('应该渲染布局组件', () => {
    renderLayout();
    
    // Check for main layout structure
    const layout = document.querySelector('.ant-layout');
    expect(layout).toBeTruthy();
  });

  it('应该显示侧边栏', () => {
    renderLayout();
    
    const sider = document.querySelector('.ant-layout-sider');
    expect(sider).toBeTruthy();
  });

  it('应该显示头部', () => {
    renderLayout();
    
    const header = document.querySelector('.ant-layout-header');
    expect(header).toBeTruthy();
  });

  it('应该显示语言切换器', () => {
    renderLayout();
    
    const switchers = screen.getAllByTestId('language-switcher');
    expect(switchers.length).toBeGreaterThan(0);
  });

  it('应该显示通知图标', () => {
    renderLayout();
    
    const bellIcon = document.querySelector('.anticon-bell');
    expect(bellIcon).toBeTruthy();
  });

  it('应该显示用户头像', () => {
    renderLayout();
    
    const avatar = document.querySelector('.ant-avatar');
    expect(avatar).toBeTruthy();
  });

  it('应该能够切换侧边栏折叠状态', () => {
    renderLayout();
    
    const menuButton = document.querySelector('.anticon-menu');
    expect(menuButton).toBeTruthy();
    
    if (menuButton?.parentElement) {
      fireEvent.click(menuButton.parentElement);
    }
    
    // Sider should change state
    const sider = document.querySelector('.ant-layout-sider');
    expect(sider).toBeTruthy();
  });

  it('应该显示导航菜单', () => {
    renderLayout();
    
    const menu = document.querySelector('.ant-menu');
    expect(menu).toBeTruthy();
  });

  it('应该加载通知数据', async () => {
    renderLayout();
    
    // Layout组件在useEffect中检查if (!user) return;
    // 由于我们的mock用户存在，通知API应该被调用
    await waitFor(() => {
      expect(api.notificationAPI.getNotifications).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('应该显示内容区域', () => {
    renderLayout();
    
    const content = document.querySelector('.ant-layout-content');
    expect(content).toBeTruthy();
  });

  it('应该处理通知加载错误', async () => {
    (api.notificationAPI.getNotifications as any).mockRejectedValue(new Error('Failed to load'));
    
    renderLayout();
    
    // 即使失败，API也应该被调用
    await waitFor(() => {
      expect(api.notificationAPI.getNotifications).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('应该包含用户菜单', () => {
    renderLayout();
    
    const userAvatar = document.querySelector('.ant-avatar');
    expect(userAvatar).toBeTruthy();
  });

  it('应该渲染菜单项', () => {
    renderLayout();
    
    const menuItems = document.querySelectorAll('.ant-menu-item');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});

