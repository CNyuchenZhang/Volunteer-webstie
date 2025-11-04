import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Typography,
  Space,
  Statistic,
  Tag,
  Spin
} from 'antd';
import { 
  TeamOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, activityAPI } from '../services/api';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalVolunteers: 0,
    totalNGOs: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // 添加调试信息
  console.log('HomePage - user:', user);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadStats();
    
    // 清理函数：防止组件卸载后更新状态
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadStats = async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const [userStats, activityStats] = await Promise.all([
        userAPI.getStats(),
        activityAPI.getStats()
      ]);
      
      // 只有在组件仍然挂载时才更新状态
      if (isMountedRef.current) {
        setStats({
          totalActivities: activityStats.total_activities || 0,
          totalVolunteers: userStats.total_volunteers || 0,
          totalNGOs: userStats.total_ngos || 0,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // 只有在组件仍然挂载时才更新状态
      if (isMountedRef.current) {
        setStats({
          totalActivities: 0,
          totalVolunteers: 0,
          totalNGOs: 0,
        });
        setLoading(false);
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return t('auth.admin');
      case 'organizer': return t('auth.organizer');
      case 'volunteer': return t('auth.volunteer');
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
      <Spin spinning={loading}>
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
                        <span>{t('welcome.greeting', { name: `${user.first_name} ${user.last_name}` })}</span>
                        <Tag color={getRoleColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Tag>
                      </Space>
                    </div>
                  )}
                  <Paragraph>{t('welcome.description')}</Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card>
              <Statistic
                title={t('stats.totalActivities')}
                value={stats.totalActivities}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          
          <Col span={8}>
            <Card>
              <Statistic
                title={t('stats.totalVolunteers')}
                value={stats.totalVolunteers}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default HomePage;