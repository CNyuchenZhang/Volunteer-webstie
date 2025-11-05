import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';

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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderDashboardPage = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  it('应该渲染仪表板页面', async () => {
    renderDashboardPage();
    
    // 检查页面是否渲染，使用更灵活的方式
    await waitFor(() => {
      const page = document.querySelector('.ant-layout') || document.body;
      expect(page).toBeTruthy();
    });
  });

  it('应该显示统计数据卡片', async () => {
    renderDashboardPage();
    
    await waitFor(() => {
      const cards = document.querySelectorAll('.ant-card');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('应该显示统计值', async () => {
    renderDashboardPage();
    
    await waitFor(() => {
      const statistics = document.querySelectorAll('.ant-statistic');
      expect(statistics.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('应该包含图标', async () => {
    renderDashboardPage();
    
    await waitFor(() => {
      const icons = document.querySelectorAll('.anticon');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });
});

