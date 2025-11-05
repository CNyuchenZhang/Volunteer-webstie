import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    
    expect(screen.getByText('auth.register')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.confirmPassword')).toBeInTheDocument();
  });

  it('应该显示必填字段验证错误', async () => {
    renderRegisterPage();
    
    const submitButton = screen.getByRole('button', { name: /auth.register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('auth.emailRequired')).toBeInTheDocument();
    });
  });

  it('应该显示登录链接', () => {
    renderRegisterPage();
    
    const loginLink = screen.getByText('auth.hasAccount');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
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
    
    const roleLabel = screen.getByText('auth.role');
    expect(roleLabel).toBeInTheDocument();
  });
});

