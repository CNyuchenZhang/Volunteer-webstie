import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Typography,
  Statistic,
  Button
} from 'antd';
import { 
  UserOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const AdminPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined /> {t('admin.title')}
      </Title>
      
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('admin.totalUsers')}
              value={1234}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Statistic
              title={t('admin.totalActivities')}
              value={567}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Button type="primary" block>
              {t('admin.manageUsers')}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPage;