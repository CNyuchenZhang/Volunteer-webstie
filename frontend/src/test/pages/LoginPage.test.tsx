import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('应该渲染登录表单', async () => {
    renderLoginPage();
    
    await waitFor(() => {
      expect(screen.getAllByText('auth.login')[0]).toBeInTheDocument();
    });
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
  });

  it('应该显示必填字段验证错误', async () => {
    renderLoginPage();
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /auth.login/i });
      expect(buttons.length).toBeGreaterThan(0);
      fireEvent.click(buttons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('auth.emailRequired')).toBeInTheDocument();
      expect(screen.getByText('auth.passwordRequired')).toBeInTheDocument();
    });
  });

  it('应该显示注册链接', async () => {
    renderLoginPage();
    
    await waitFor(() => {
      const registerLinks = screen.getAllByText('auth.noAccount');
      expect(registerLinks.length).toBeGreaterThan(0);
      expect(registerLinks[0].closest('a')).toHaveAttribute('href', '/register');
    });
  });

  it('应该处理表单输入', async () => {
    renderLoginPage();
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText('auth.email') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('auth.password') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('test@test.com');
      expect(passwordInput.value).toBe('password123');
    });
  });
});

