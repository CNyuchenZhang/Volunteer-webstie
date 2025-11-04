import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

// Mock API
const mockUserAPI = {
  getStats: vi.fn().mockResolvedValue({ 
    total_volunteers: 0, 
    total_ngos: 0 
  }),
};

const mockActivityAPI = {
  getActivities: vi.fn().mockResolvedValue({ results: [], count: 0 }),
  getActivityCategories: vi.fn().mockResolvedValue({ results: [] }),
  getStats: vi.fn().mockResolvedValue({ 
    total_activities: 0, 
    total_participants: 0 
  }),
};

vi.mock('../../services/api', () => ({
  activityAPI: mockActivityAPI,
  userAPI: mockUserAPI,
  notificationAPI: {
    getNotifications: vi.fn().mockResolvedValue({ results: [] }),
  },
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { 
      id: 1, 
      role: 'volunteer',
      first_name: 'Test',
      last_name: 'User'
    },
    loading: false,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 mock 返回值
    mockUserAPI.getStats.mockResolvedValue({ 
      total_volunteers: 0, 
      total_ngos: 0 
    });
    mockActivityAPI.getStats.mockResolvedValue({ 
      total_activities: 0, 
      total_participants: 0 
    });
  });

  afterEach(() => {
    // 清理所有渲染的组件
    cleanup();
    vi.clearAllMocks();
  });

  it('应该渲染首页', async () => {
    const { unmount } = await act(async () => {
      return renderWithRouter(<HomePage />);
    });
    
    // 等待异步操作完成
    await waitFor(() => {
      expect(mockUserAPI.getStats).toHaveBeenCalled();
      expect(mockActivityAPI.getStats).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // 验证 API 被调用
    expect(mockUserAPI.getStats).toHaveBeenCalled();
    expect(mockActivityAPI.getStats).toHaveBeenCalled();
    
    // 清理组件
    await act(async () => {
      unmount();
    });
  });
});

