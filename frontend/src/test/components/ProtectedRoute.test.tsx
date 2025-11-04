import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';

const MockChild = () => <div>Protected Content</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该显示加载状态当loading为true', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    // 应该显示加载状态（Spin组件）
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('应该重定向到登录页当用户未认证', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    // 应该重定向（Navigate组件会处理）
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('应该显示内容当用户已认证且无角色要求', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, role: 'volunteer' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <MockChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('应该显示403错误当用户角色不匹配', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, role: 'volunteer' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <MockChild />
      </ProtectedRoute>
    );

    // 应该显示403错误（Result组件）
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('应该显示内容当用户角色匹配', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, role: 'admin' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <MockChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

