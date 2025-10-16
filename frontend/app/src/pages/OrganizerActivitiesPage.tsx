import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Select,
  
} from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
// 移除未使用的 TextArea 引用

interface Activity {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  participants_count: number;
  status: string;
  approval_status: string;
  created_at: string;
}

const OrganizerActivitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusForm] = Form.useForm();

  // 只有NGO组织者可以访问
  if (user?.role !== 'organizer') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={3}>{t('common.accessDenied')}</Title>
        <p>{t('activities.organizerOnly')}</p>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user, loadActivities]);

  useEffect(() => {
    filterActivities();
  }, [activities, statusFilter]);

  // 使用 useCallback 定义后再在 useEffect 里引用，避免“使用前声明”错误
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getActivities();
      setActivities(response);
    } catch (error) {
      console.error('Failed to load activities:', error);
      message.error(t('activities.loadActivitiesError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const filterActivities = () => {
    let filtered = activities;
    
    if (statusFilter === 'pending') {
      filtered = activities.filter(a => a.approval_status === 'pending');
    } else if (statusFilter === 'approved') {
      filtered = activities.filter(a => a.approval_status === 'approved');
    } else if (statusFilter === 'rejected') {
      filtered = activities.filter(a => a.approval_status === 'rejected');
    } else if (statusFilter === 'ongoing') {
      filtered = activities.filter(a => a.approval_status === 'approved' && a.status === 'published');
    } else if (statusFilter === 'completed') {
      filtered = activities.filter(a => a.approval_status === 'approved' && a.status === 'completed');
    }
    
    setFilteredActivities(filtered);
  };

  const handleUpdateStatus = (activity: Activity) => {
    setSelectedActivity(activity);
    setStatusModalVisible(true);
    statusForm.setFieldsValue({
      status: activity.status
    });
  };

  const handleStatusSubmit = async (values: any) => {
    if (!selectedActivity) return;

    try {
      await activityAPI.updateActivityStatus(selectedActivity.id, {
        status: values.status
      });

      message.success(t('activities.statusUpdated'));
      setStatusModalVisible(false);
      setSelectedActivity(null);
      statusForm.resetFields();
      loadActivities();
    } catch (error: any) {
      console.error('Status update error:', error);
      message.error(error.message || t('activities.statusUpdateError'));
    }
  };

  const getStatusColor = (status: string, approvalStatus: string) => {
    if (approvalStatus !== 'approved') return 'orange';
    if (status === 'full') return 'red';
    if (status === 'join_waitlist') return 'blue';
    if (status === 'cancelled') return 'red';
    return 'green';
  };

  const getStatusText = (status: string, approvalStatus: string) => {
    if (approvalStatus === 'pending') return t('activities.statuses.pendingApproval');
    if (approvalStatus === 'rejected') return t('activities.statuses.rejected');
    return t(`activities.statuses.${status}`);
  };

  const columns = [
    {
      title: t('activities.activityTitle'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('activities.location'),
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: t('activities.startDate'),
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('activities.participants'),
      key: 'participants',
      render: (text: any, record: Activity) => `${record.participants_count}/${record.max_participants}`,
    },
    {
      title: t('activities.status'),
      key: 'status',
      render: (text: any, record: Activity) => (
        <Tag color={getStatusColor(record.status, record.approval_status)}>
          {getStatusText(record.status, record.approval_status)}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (text: any, record: Activity) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => navigate(`/activities/${record.id}`)}
          >
            {t('activities.viewDetails')}
          </Button>
          {record.approval_status === 'approved' && (
            <Button 
              size="small"
              onClick={() => handleUpdateStatus(record)}
            >
              {t('activities.updateStatus')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 统计数据
  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.approval_status === 'pending').length,
    approved: activities.filter(a => a.approval_status === 'approved').length,
    rejected: activities.filter(a => a.approval_status === 'rejected').length,
    ongoing: activities.filter(a => a.approval_status === 'approved' && a.status === 'published').length,
    completed: activities.filter(a => a.approval_status === 'approved' && a.status === 'completed').length,
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>{t('activities.myActivities')}</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={4}>
          <Card>
            <Statistic title={t('activities.totalActivities')} value={stats.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title={t('activities.pendingApproval')} value={stats.pending} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title={t('activities.approved')} value={stats.approved} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title={t('activities.ongoing')} value={stats.ongoing} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title={t('activities.completed')} value={stats.completed} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title={t('activities.rejected')} value={stats.rejected} />
          </Card>
        </Col>
      </Row>

      {/* 操作按钮和筛选器 */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button type="primary" onClick={() => navigate('/create-activity')}>
            {t('activities.createActivity')}
          </Button>
          <Button onClick={loadActivities}>
            {t('common.refresh')}
          </Button>
        </Space>
        
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          placeholder={t('activities.filterByStatus')}
        >
          <Select.Option value="all">{t('activities.allActivities')}</Select.Option>
          <Select.Option value="pending">{t('activities.pendingApproval')}</Select.Option>
          <Select.Option value="approved">{t('activities.approved')}</Select.Option>
          <Select.Option value="ongoing">{t('activities.ongoing')}</Select.Option>
          <Select.Option value="completed">{t('activities.completed')}</Select.Option>
          <Select.Option value="rejected">{t('activities.rejected')}</Select.Option>
        </Select>
      </div>

      {/* 活动列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 状态更新模态框 */}
      <Modal
        title={selectedActivity ? `${t('activities.updateStatus')} - ${selectedActivity.title}` : ''}
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedActivity(null);
          statusForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={statusForm}
          onFinish={handleStatusSubmit}
          layout="vertical"
        >
          <Form.Item
            label={t('activities.status')}
            name="status"
            rules={[{ required: true, message: t('activities.statusRequired') }]}
          >
            <Select placeholder={t('activities.selectStatus')}>
              <Select.Option value="published">{t('activities.statuses.published')}</Select.Option>
              <Select.Option value="full">{t('activities.statuses.full')}</Select.Option>
              <Select.Option value="join_waitlist">{t('activities.statuses.joinWaitlist')}</Select.Option>
              <Select.Option value="cancelled">{t('activities.statuses.cancelled')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.update')}
              </Button>
              <Button onClick={() => {
                setStatusModalVisible(false);
                setSelectedActivity(null);
                statusForm.resetFields();
              }}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizerActivitiesPage;
