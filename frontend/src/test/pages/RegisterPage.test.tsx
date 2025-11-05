import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() }
  }),
  Trans: ({ children }: any) => children,
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // 清理DOM，避免多次渲染导致重复元素
  });

  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('应该渲染注册表单', () => {
    renderRegisterPage();
    
    // 使用更具体的选择器
    expect(screen.getAllByText('auth.register')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.confirmPassword')).toBeInTheDocument();
  });

  it('应该显示必填字段验证错误', async () => {
    renderRegisterPage();
    
    await waitFor(() => {
      const submitButton = screen.getAllByRole('button', { name: /auth.register/i })[0];
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // 检查验证错误，可能显示roleRequired或其他必填字段错误
      const errors = screen.queryAllByText(/auth\.(roleRequired|emailRequired|passwordRequired)/);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('应该显示登录链接', async () => {
    renderRegisterPage();
    
    await waitFor(() => {
      const loginLinks = screen.getAllByText('auth.haveAccount');
      expect(loginLinks.length).toBeGreaterThan(0);
      expect(loginLinks[0].closest('a')).toHaveAttribute('href', '/login');
    });
  });

  it('应该处理表单输入', () => {
    renderRegisterPage();
    
    const emailInput = screen.getByLabelText('auth.email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('auth.password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('应该有角色选择字段', () => {
    renderRegisterPage();
    
    // 使用getAllByText因为可能有多个auth.role（label和title）
    const roleLabels = screen.getAllByText('auth.role');
    expect(roleLabels.length).toBeGreaterThan(0);
    expect(roleLabels[0]).toBeInTheDocument();
  });
});

