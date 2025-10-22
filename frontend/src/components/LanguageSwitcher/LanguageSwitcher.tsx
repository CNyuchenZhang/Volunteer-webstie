import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languageItems = [
    {
      key: 'en',
      label: 'English',
      onClick: () => i18n.changeLanguage('en'),
    },
    {
      key: 'zh',
      label: '中文',
      onClick: () => i18n.changeLanguage('zh'),
    },
  ];

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'zh' ? '中文' : 'English';
  };

  return (
    <Dropdown
      menu={{ items: languageItems }}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {getCurrentLanguageLabel()}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
