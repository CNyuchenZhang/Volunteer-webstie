import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Descriptions
} from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

interface Activity {
  id: number;
  title: string;
  description: string;
  organizer_name: string;
  organizer_email: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  approval_status: string;
  created_at: string;
}

const AdminActivityApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [approvalForm] = Form.useForm();

  // 只有管理员可以访问
  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={3}>{t('common.accessDenied')}</Title>
        <p>{t('admin.adminOnly')}</p>
      </div>
    );
  }

  useEffect(() => {
    loadPendingActivities();
  }, []);

  const loadPendingActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getPendingActivities();
      setActivities(response);
    } catch (error) {
      console.error('Failed to load pending activities:', error);
      message.error(t('admin.loadActivitiesError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (activity: Activity) => {
    setSelectedActivity(activity);
    setApprovalModalVisible(true);
  };

  const handleReject = (activity: Activity) => {
    setSelectedActivity(activity);
    setApprovalModalVisible(true);
  };

  const handleApprovalSubmit = async (values: any) => {
    if (!selectedActivity) return;

    try {
      const { approval_status, rejection_reason, admin_notes } = values;
      
      await activityAPI.approveActivity(selectedActivity.id, {
        approval_status,
        rejection_reason,
        admin_notes
      });

      message.success(
        approval_status === 'approved' 
          ? `Activity ${selectedActivity.id} ${t('activities.approved')}`
          : `Activity ${selectedActivity.id} ${t('activities.rejected')}`
      );

      setApprovalModalVisible(false);
      setSelectedActivity(null);
      approvalForm.resetFields();
      loadPendingActivities();
    } catch (error: any) {
      console.error('Approval error:', error);
      message.error(error.message || t('admin.approvalError'));
    }
  };

  const columns = [
    {
      title: t('activities.activityTitle'),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Activity) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {t('admin.organizer')}: {record.organizer_name}
          </div>
        </div>
      ),
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
      title: t('activities.maxParticipants'),
      dataIndex: 'max_participants',
      key: 'max_participants',
    },
    {
      title: t('activities.status'),
      dataIndex: 'approval_status',
      key: 'approval_status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'orange' : status === 'approved' ? 'green' : 'red'}>
          {t(`activities.statuses.${status}`)}
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
            onClick={() => handleApprove(record)}
          >
            {t('activities.approve')}
          </Button>
          <Button 
            danger 
            size="small"
            onClick={() => handleReject(record)}
          >
            {t('activities.reject')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>{t('admin.pendingActivities')}</Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={selectedActivity ? `${t('activities.approve')} / ${t('activities.reject')} ${selectedActivity.title}` : ''}
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedActivity(null);
          approvalForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedActivity && (
          <div>
            <Descriptions column={1} size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label={t('activities.activityTitle')}>
                {selectedActivity.title}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.organizer')}>
                {selectedActivity.organizer_name} ({selectedActivity.organizer_email})
              </Descriptions.Item>
              <Descriptions.Item label={t('activities.location')}>
                {selectedActivity.location}
              </Descriptions.Item>
              <Descriptions.Item label={t('activities.startDate')}>
                {new Date(selectedActivity.start_date).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label={t('activities.endDate')}>
                {new Date(selectedActivity.end_date).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={approvalForm}
              onFinish={handleApprovalSubmit}
              layout="vertical"
            >
              <Form.Item
                label={t('activities.status')}
                name="approval_status"
                rules={[{ required: true, message: t('activities.statusRequired') }]}
              >
                <Select placeholder={t('activities.selectStatus')}>
                  <Select.Option value="approved">{t('activities.approve')}</Select.Option>
                  <Select.Option value="rejected">{t('activities.reject')}</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={t('activities.reason')}
                name="rejection_reason"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue('approval_status') === 'rejected' && !value) {
                        return Promise.reject(new Error(t('activities.rejectionReasonRequired')));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TextArea 
                  rows={3} 
                  placeholder={t('activities.rejectionReasonPlaceholder')}
                />
              </Form.Item>

              <Form.Item
                label={t('admin.adminNotes')}
                name="admin_notes"
              >
                <TextArea 
                  rows={2} 
                  placeholder={t('admin.adminNotesPlaceholder')}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {t('common.submit')}
                  </Button>
                  <Button onClick={() => {
                    setApprovalModalVisible(false);
                    setSelectedActivity(null);
                    approvalForm.resetFields();
                  }}>
                    {t('common.cancel')}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminActivityApprovalPage;