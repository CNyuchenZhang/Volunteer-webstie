import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Space, Button, Tag, Row, Col, message, Spin, Tabs, Image } from 'antd';
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
  organizer_id: number;
  images?: string[];
}

const ActivitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, any>>({});

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

  // 检查申请状态
  const checkApplicationStatuses = async () => {
    if (user?.role !== 'volunteer') return;
    
    const statuses: Record<number, any> = {};
    for (const activity of activities) {
      try {
        const response = await activityAPI.checkApplicationStatus(activity.id);
        const userApplication = response.results?.find((app: any) => app.user_id === user.id);
        if (userApplication) {
          statuses[activity.id] = userApplication;
        }
      } catch (error) {
        // 忽略错误，继续处理其他活动
      }
    }
    setApplicationStatuses(statuses);
  };

  useEffect(() => {
    if (activities.length > 0) {
      checkApplicationStatuses();
    }
  }, [activities, user]);

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
      if (error.response && error.response.status === 409) {
        message.error('您已经申请过此活动，请等待审批结果');
        // 重新检查申请状态
        checkApplicationStatuses();
      } else {
        message.error(error.message || t('activities.joinError'));
      }
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

  const getStatusText = (status: string, approvalStatus: string) => {
    if (approvalStatus === 'pending') return t('activities.pendingApproval');
    if (approvalStatus === 'rejected') return t('activities.rejected');
    return t(`activities.status.${status}`);
  };

  const canJoinActivity = (activity: Activity) => {
    return (
      user?.role === 'volunteer' &&
      activity.approval_status === 'approved' &&
      !['full', 'cancelled'].includes(activity.status) &&
      !applicationStatuses[activity.id] // 未申请过
    );
  };

  const getApplicationStatus = (activity: Activity) => {
    const application = applicationStatuses[activity.id];
    if (!application) return null;
    return application.status;
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
                // 志愿者按钮逻辑
                user?.role === 'volunteer' && (
                  (() => {
                    const applicationStatus = getApplicationStatus(activity);
                    if (applicationStatus === 'applied') {
                      return <Tag color="orange">{t('activities.waitingApproval')}</Tag>;
                    } else if (applicationStatus === 'approved') {
                      return <Tag color="green">{t('activities.approved')}</Tag>;
                    } else if (applicationStatus === 'rejected') {
                      return <Tag color="red">{t('activities.rejected')}</Tag>;
                    } else if (canJoinActivity(activity)) {
                      return (
                        <Button 
                          type="default"
                          onClick={() => handleJoinActivity(activity.id)}
                        >
                          {t('activities.join')}
                        </Button>
                      );
                    }
                    return null;
                  })()
                )
              ]}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* 左侧内容 */}
                <Space direction="vertical" style={{ flex: 1 }}>
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

                {/* 右侧图片 */}
                {activity.images && activity.images.length > 0 && (
                  <div style={{ flexShrink: 0 }}>
                    <Image
                      src={activity.images[0]}
                      alt={activity.title}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                      preview={false}
                    />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ActivitiesPage;