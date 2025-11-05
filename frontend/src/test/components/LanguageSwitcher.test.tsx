import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';

// Mock react-i18next
const mockChangeLanguage = vi.fn();
let mockLanguage = 'en';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: mockChangeLanguage,
      get language() {
        return mockLanguage;
      },
    },
    t: (key: string) => key,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguage = 'en';
  });

  it('应该渲染语言切换器', async () => {
    render(<LanguageSwitcher />);
    
    // Ant Design Button 内的文本，使用更灵活的查询
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // 检查按钮文本是否包含 "English"（使用 getByText 或其他方式）
      const text = button.textContent || '';
      expect(text).toMatch(/English/i);
    });
  });

  it('应该显示中文当语言为zh', async () => {
    mockLanguage = 'zh';
    
    render(<LanguageSwitcher />);
    
    // 等待中文文本出现
    await waitFor(() => {
      const button = screen.getByRole('button');
      const text = button.textContent || '';
      expect(text).toMatch(/中文/);
    });
  });
});

