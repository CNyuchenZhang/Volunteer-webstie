import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography,
  Space,
  Statistic,
  Tag,
  Divider
} from 'antd';
import { 
  HeartOutlined, 
  TeamOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // 添加调试信息
  console.log('HomePage - user:', user);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'organizer': return 'NGO Organizer';
      case 'volunteer': return 'Volunteer';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'organizer': return 'blue';
      case 'volunteer': return 'green';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={1}>{t('welcome.title')}</Title>
                {user && (
                  <div style={{ marginBottom: '16px' }}>
                    <Space align="center">
                      <UserOutlined />
                      <span>Welcome, {user.first_name} {user.last_name}!</span>
                      <Tag color={getRoleColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Tag>
                    </Space>
                  </div>
                )}
                <Paragraph>{t('welcome.description')}</Paragraph>
              </div>
              
              <Divider />
              
              <Space wrap>
                <Button type="primary" size="large">
                  {t('welcome.getStarted')}
                </Button>
                <Button size="large">
                  {t('welcome.learnMore')}
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Statistic
              title={t('stats.totalActivities')}
              value={1128}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Statistic
              title={t('stats.totalVolunteers')}
              value={4567}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <Statistic
              title={t('stats.totalHours')}
              value={12345}
              suffix="h"
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;