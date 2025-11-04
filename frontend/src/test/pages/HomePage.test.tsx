import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

// Mock API
vi.mock('../../services/api', () => ({
  activityAPI: {
    getActivities: vi.fn().mockResolvedValue({ results: [], count: 0 }),
    getActivityCategories: vi.fn().mockResolvedValue({ results: [] }),
    getStats: vi.fn().mockResolvedValue({ total_activities: 0, total_participants: 0 }),
  },
  userAPI: {
    getStats: vi.fn().mockResolvedValue({ total_users: 0, total_hours: 0 }),
  },
  notificationAPI: {
    getNotifications: vi.fn().mockResolvedValue({ results: [] }),
  },
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, role: 'volunteer' },
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
  });

  it('应该渲染首页', () => {
    renderWithRouter(<HomePage />);
    
    // 应该能渲染页面（不抛出错误）
    expect(screen).toBeDefined();
  });
});

