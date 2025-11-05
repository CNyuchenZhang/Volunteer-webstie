import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
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

  afterEach(() => {
    cleanup();
  });

  it('应该渲染语言切换器', async () => {
    render(<LanguageSwitcher />);
    
    // Ant Design Button 内的文本，使用更灵活的查询
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      const button = buttons.find(btn => btn.textContent?.includes('English'));
      expect(button).toBeTruthy();
    });
  });

  it('应该显示中文当语言为zh', async () => {
    mockLanguage = 'zh';
    
    render(<LanguageSwitcher />);
    
    // 等待中文文本出现
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const button = buttons.find(btn => btn.textContent?.includes('中文'));
      expect(button).toBeTruthy();
    });
  });
});

