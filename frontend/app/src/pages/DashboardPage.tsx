import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Typography,
  Statistic,
  List
} from 'antd';
import { 
  CalendarOutlined,
  TeamOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const recentActivities = [
    { title: t('dashboard.activity1'), date: '2024-01-15' },
    { title: t('dashboard.activity2'), date: '2024-01-10' },
    { title: t('dashboard.activity3'), date: '2024-01-05' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>{t('dashboard.title')}</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalActivities')}
              value={12}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalHours')}
              value={48}
              suffix="h"
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.teamMembers')}
              value={5}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title={t('dashboard.recentActivities')}>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.date}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;