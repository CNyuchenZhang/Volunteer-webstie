import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Input, 
  Button, 
  Typography,
  Space
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SearchPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>{t('search.title')}</Title>
      
      <Card>
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            placeholder={t('search.placeholder')} 
            size="large"
          />
          <Button type="primary" size="large" icon={<SearchOutlined />}>
            {t('search.search')}
          </Button>
        </Space.Compact>
      </Card>
    </div>
  );
};

export default SearchPage;