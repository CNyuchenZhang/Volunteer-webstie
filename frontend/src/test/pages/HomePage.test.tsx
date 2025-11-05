import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import { AuthProvider } from '../../contexts/AuthContext';
import * as api from '../../services/api';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() }
  }),
  Trans: ({ children }: any) => children,
}));

// Mock API
vi.mock('../../services/api', () => ({
  userAPI: {
    getStats: vi.fn(),
  },
  activityAPI: {
    getStats: vi.fn(),
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (api.userAPI.getStats as any).mockResolvedValue({
      total_volunteers: 100,
      total_ngos: 20,
    });
    
    (api.activityAPI.getStats as any).mockResolvedValue({
      total_activities: 50,
    });
  });

  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('应该渲染首页标题', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByText('home.welcome')).toBeInTheDocument();
    });
  });

  it('应该加载并显示统计数据', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(api.userAPI.getStats).toHaveBeenCalled();
      expect(api.activityAPI.getStats).toHaveBeenCalled();
    });
  });

  it('应该处理统计数据加载错误', async () => {
    (api.userAPI.getStats as any).mockRejectedValue(new Error('Failed to load'));
    (api.activityAPI.getStats as any).mockRejectedValue(new Error('Failed to load'));
    
    renderHomePage();
    
    await waitFor(() => {
      expect(api.userAPI.getStats).toHaveBeenCalled();
    });
  });

  it('应该显示加载状态', () => {
    renderHomePage();
    
    // Ant Design Spin component should be present
    const spinElement = document.querySelector('.ant-spin');
    expect(spinElement).toBeTruthy();
  });
});

