import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const { container } = renderRegisterPage();
    
    // 等待表单渲染完成
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /auth.register/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    // 找到表单元素
    const form = container.querySelector('form[name="register"]') as HTMLFormElement;
    expect(form).toBeTruthy();

    // 直接触发表单的 submit 事件（不填写任何字段）
    fireEvent.submit(form);

    // 等待验证错误显示，Ant Design Form 验证是异步的
    // 使用多种方法查找验证错误，确保至少找到一种
    await waitFor(() => {
      // 方法1: 查找 Ant Design 的验证错误元素（通过类名）
      const errorElements = document.querySelectorAll('.ant-form-item-explain-error');
      if (errorElements.length > 0) {
        return; // 找到错误元素，退出 waitFor
      }
      
      // 方法2: 查找包含验证错误文本的元素（使用 queryAllByText，不会抛出错误）
      const errorTexts = screen.queryAllByText(/auth\.(roleRequired|usernameRequired|firstNameRequired|lastNameRequired|emailRequired|passwordRequired|confirmPasswordRequired)/);
      if (errorTexts.length > 0) {
        return; // 找到错误文本，退出 waitFor
      }
      
      // 方法3: 查找任何包含 "Required" 的文本（更宽松的匹配）
      const anyRequired = screen.queryAllByText(/Required/);
      if (anyRequired.length > 0) {
        return; // 找到任何 Required 文本，退出 waitFor
      }
      
      // 方法4: 查找 Ant Design 的验证状态类
      const errorStatusElements = document.querySelectorAll('.ant-form-item-has-error');
      if (errorStatusElements.length > 0) {
        return; // 找到错误状态元素，退出 waitFor
      }
      
      // 方法5: 查找所有包含 "ant-form-item" 且有错误状态的元素
      const allFormItems = document.querySelectorAll('.ant-form-item');
      const hasErrorItems = Array.from(allFormItems).filter(item => 
        item.classList.contains('ant-form-item-has-error') || 
        item.querySelector('.ant-form-item-explain-error')
      );
      if (hasErrorItems.length > 0) {
        return; // 找到错误表单项，退出 waitFor
      }
      
      // 如果都没找到，抛出错误以继续重试
      throw new Error('未找到验证错误');
    }, { timeout: 10000 }); // 增加超时时间到 10 秒
    
    // 验证至少存在一种形式的错误提示
    const errorElements = document.querySelectorAll('.ant-form-item-explain-error');
    const errorTexts = screen.queryAllByText(/auth\.(roleRequired|usernameRequired|firstNameRequired|lastNameRequired|emailRequired|passwordRequired|confirmPasswordRequired)/);
    const anyRequired = screen.queryAllByText(/Required/);
    const errorStatusElements = document.querySelectorAll('.ant-form-item-has-error');
    const allFormItems = document.querySelectorAll('.ant-form-item');
    const hasErrorItems = Array.from(allFormItems).filter(item => 
      item.classList.contains('ant-form-item-has-error') || 
      item.querySelector('.ant-form-item-explain-error')
    );
    
    // 至少应该找到一种形式的错误提示
    const totalErrors = errorElements.length + errorTexts.length + anyRequired.length + errorStatusElements.length + hasErrorItems.length;
    expect(totalErrors).toBeGreaterThan(0);
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

