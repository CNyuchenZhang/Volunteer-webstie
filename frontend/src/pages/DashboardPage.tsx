import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { TeamOutlined, ProjectOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { userAPI, activityAPI } from '../services/api';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalVolunteers: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reverted to static/demo values to restore original behavior before assistant edits
    setStats({ totalActivities: 0, totalVolunteers: 0, totalHours: 0 });
    setLoading(false);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('dashboard.totalActivities')}
                value={stats.totalActivities}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('dashboard.totalVolunteers')}
                value={stats.totalVolunteers}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('dashboard.totalHours')}
                value={stats.totalHours}
                precision={1}
                prefix={<ClockCircleOutlined />}
                suffix="h"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
      {/* 其他仪表板组件可以放在这里 */}
    </div>
  );
};

export default DashboardPage;