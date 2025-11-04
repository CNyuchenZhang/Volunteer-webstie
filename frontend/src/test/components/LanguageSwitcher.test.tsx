import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';

// Mock react-i18next
const mockChangeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: mockChangeLanguage,
      language: 'en',
    },
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染语言切换器', () => {
    render(<LanguageSwitcher />);
    
    // 应该显示当前语言（English）
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('应该显示中文当语言为zh', () => {
    vi.mock('react-i18next', () => ({
      useTranslation: () => ({
        i18n: {
          changeLanguage: mockChangeLanguage,
          language: 'zh',
        },
      }),
    }));

    const { rerender } = render(<LanguageSwitcher />);
    
    // 重新渲染以应用新的mock
    rerender(<LanguageSwitcher />);
    
    // 应该显示中文
    expect(screen.getByText('中文')).toBeInTheDocument();
  });
});

