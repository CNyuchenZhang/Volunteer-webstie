import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Space, Button, Tag, Row, Col, message, Spin, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../services/api';

const { Title } = Typography;

interface Activity {
  id: number;
  title: string;
  description: string;
  category_name: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  participants_count: number;
  status: string;
  approval_status: string;
  organizer_name: string;
  organizer_id?: number;
}

const ActivitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // 加载活动数据
  const loadActivities = async () => {
    try {
      setLoading(true);
      let response;
      
      // 根据用户角色加载不同的活动
      if (user?.role === 'volunteer') {
        response = await activityAPI.getActivities({ approval_status: 'approved' });
      } else {
        response = await activityAPI.getActivities();
      }
      
      console.log('API Response:', response);
      
      // 统一处理响应数据结构
      let activitiesData = [];
      if (response && response.results) {
        activitiesData = response.results;
      } else if (Array.isArray(response)) {
        activitiesData = response;
      } else {
        console.error('Unexpected response format:', response);
        activitiesData = [];
      }
      
      setActivities(activitiesData);
    } catch (error: any) {
      console.error('Failed to load activities:', error);
      message.error(error.message || t('activities.loadActivitiesError'));
    } finally {
      setLoading(false);
    }
  };

  // 筛选活动
  const filterActivities = () => {
    if (!activities || activities.length === 0) {
      setFilteredActivities([]);
      return;
    }

    let filtered = activities;

    if (user?.role === 'organizer') {
      switch (activeTab) {
        case 'my':
          filtered = activities.filter(activity => activity.organizer_id === user.id);
          break;
        case 'pending':
          filtered = activities.filter(activity => 
            activity.organizer_id === user.id && activity.approval_status === 'pending'
          );
          break;
        case 'ongoing':
          filtered = activities.filter(activity => 
            activity.organizer_id === user.id && 
            activity.approval_status === 'approved' && 
            activity.status === 'published'
          );
          break;
        case 'completed':
          filtered = activities.filter(activity => 
            activity.organizer_id === user.id && 
            activity.approval_status === 'approved' && 
            activity.status === 'completed'
          );
          break;
        case 'all':
        default:
          filtered = activities;
          break;
      }
    } else if (user?.role === 'volunteer') {
      filtered = activities.filter(activity => activity.approval_status === 'approved');
    }

    setFilteredActivities(filtered);
  };

  // 当用户信息加载完成时，加载活动
  useEffect(() => {
    console.log('ActivitiesPage - User:', user);
    console.log('ActivitiesPage - User role:', user?.role);
    
    if (user) {
      loadActivities();
    }
  }, [user]);

  // 当活动数据或标签页变化时，重新筛选
  useEffect(() => {
    filterActivities();
  }, [activities, activeTab, user]);

  const handleJoinActivity = async (activityId: number) => {
    if (!user) {
      message.error(t('auth.loginRequired'));
      navigate('/login');
      return;
    }

    if (user.role !== 'volunteer') {
      message.error(t('activities.volunteerOnly'));
      return;
    }

    try {
      await activityAPI.joinActivity(activityId);
      message.success(t('activities.joinSuccess'));
      loadActivities();
    } catch (error: any) {
      console.error('Join activity error:', error);
      message.error(error.message || t('activities.joinError'));
    }
  };

  const getStatusColor = (status: string, approvalStatus: string) => {
    if (approvalStatus === 'pending') return 'orange';
    if (approvalStatus === 'rejected') return 'red';
    if (status === 'full') return 'red';
    if (status === 'join_waitlist') return 'blue';
    if (status === 'cancelled') return 'red';
    return 'green';
  };

  // 移除未使用函数，避免 TS6133

  const canJoinActivity = (activity: Activity) => {
    return (
      user?.role === 'volunteer' &&
      activity.approval_status === 'approved' &&
      !['full', 'cancelled'].includes(activity.status)
    );
  };

  // 为NGO组织者创建标签页
  const getTabItems = () => {
    if (user?.role === 'organizer') {
      return [
        {
          key: 'all',
          label: t('activities.allActivities'),
        },
        {
          key: 'my',
          label: t('activities.myActivities'),
        },
        {
          key: 'pending',
          label: t('activities.pendingApproval'),
        },
        {
          key: 'ongoing',
          label: t('activities.ongoing'),
        },
        {
          key: 'completed',
          label: t('activities.completed'),
        },
      ];
    }
    return [];
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          {user?.role === 'volunteer' ? t('activities.availableActivities') : 
           user?.role === 'organizer' ? t('activities.allActivities') : 
           t('activities.title')}
        </Title>
        {user?.role === 'organizer' && (
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/create-activity')}
            icon={<PlusOutlined />}
          >
            {t('activities.createActivity')}
          </Button>
        )}
      </div>

      {/* 为NGO组织者显示标签页 */}
      {user?.role === 'organizer' && (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={getTabItems()}
          style={{ marginBottom: '24px' }}
        />
      )}
      
      <Row gutter={[16, 16]}>
        {filteredActivities.map(activity => (
          <Col xs={24} sm={12} lg={8} key={activity.id}>
            <Card
              title={activity.title}
              extra={<Tag color="blue">{activity.category_name}</Tag>}
              actions={[
                <Button 
                  type="primary" 
                  onClick={() => navigate(`/activities/${activity.id}`)}
                >
                  {t('activities.viewDetails')}
                </Button>,
                canJoinActivity(activity) && (
                  <Button 
                    type="default"
                    onClick={() => handleJoinActivity(activity.id)}
                  >
                    {t('activities.join')}
                  </Button>
                )
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <p>{activity.description}</p>
                <p><strong>{t('activities.location')}:</strong> {activity.location}</p>
                <p><strong>{t('activities.startDate')}:</strong> {new Date(activity.start_date).toLocaleDateString()}</p>
                <p><strong>{t('activities.participants')}:</strong> {activity.participants_count}/{activity.max_participants}</p>
                <p><strong>{t('activities.organizer')}:</strong> {activity.organizer_name}</p>
                <Tag color={getStatusColor(activity.status, activity.approval_status)}>
                  {activity.approval_status === 'pending'
                    ? t('activities.statuses.pendingApproval')
                    : activity.approval_status === 'rejected'
                      ? t('activities.statuses.rejected')
                      : t(`activities.statuses.${activity.status}`)}
                </Tag>
                {/* 管理员快速审批按钮 */}
                {user?.role === 'admin' && (
                  <Space>
                    <Button size="small" type="primary" onClick={async () => {
                      try {
                        await activityAPI.approveActivity(activity.id, { approval_status: 'approved' });
                        message.success(t('activities.statusUpdated'));
                        loadActivities();
                      } catch (e: any) {
                        message.error(e?.message || 'Failed to approve');
                      }
                    }}>
                      {t('activities.approve')}
                    </Button>
                    <Button size="small" danger onClick={async () => {
                      try {
                        await activityAPI.approveActivity(activity.id, { approval_status: 'rejected' });
                        message.success(t('activities.statusUpdated'));
                        loadActivities();
                      } catch (e: any) {
                        message.error(e?.message || 'Failed to reject');
                      }
                    }}>
                      {t('activities.reject')}
                    </Button>
                  </Space>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ActivitiesPage;