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
  Select,
  Input,
  message,
  Row,
  Col,
  Descriptions,
  Badge
} from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../services/api';
import { useParams } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;

interface Participant {
  id: number;
  activity_title: string;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  status: string;
  application_message: string;
  skills_match: string;
  experience_level: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  registered_at: string;
  organizer_notes: string;
}

const ParticipantManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activityId } = useParams<{ activityId: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [approvalForm] = Form.useForm();

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
    if (activityId) {
      loadParticipants();
    }
  }, [activityId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getActivityParticipants(parseInt(activityId!));
      setParticipants(response.results || response);
    } catch (error) {
      console.error('Failed to load participants:', error);
      message.error(t('participants.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (participant: Participant) => {
    setSelectedParticipant(participant);
    setApprovalModalVisible(true);
    approvalForm.setFieldsValue({
      status: 'approved'
    });
  };

  const handleReject = (participant: Participant) => {
    setSelectedParticipant(participant);
    setApprovalModalVisible(true);
    approvalForm.setFieldsValue({
      status: 'rejected'
    });
  };

  const handleApprovalSubmit = async (values: any) => {
    if (!selectedParticipant) return;

    try {
      await activityAPI.approveParticipant(selectedParticipant.id, {
        status: values.status,
        organizer_notes: values.organizer_notes
      });

      message.success(
        values.status === 'approved' 
          ? `${selectedParticipant.user_name} ${t('participants.approved')}`
          : `${selectedParticipant.user_name} ${t('participants.rejected')}`
      );

      setApprovalModalVisible(false);
      setSelectedParticipant(null);
      approvalForm.resetFields();
      loadParticipants();
    } catch (error: any) {
      console.error('Approval error:', error);
      message.error(error.message || t('participants.approvalError'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'registered': return 'blue';
      case 'attended': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'no_show': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    return t(`participants.status.${status}`);
  };

  const columns = [
    {
      title: t('participants.name'),
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text: string, record: Participant) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.user_email}
          </div>
        </div>
      ),
    },
    {
      title: t('participants.phone'),
      dataIndex: 'user_phone',
      key: 'user_phone',
    },
    {
      title: t('participants.experienceLevel'),
      dataIndex: 'experience_level',
      key: 'experience_level',
      render: (level: string) => (
        <Tag color={level === 'expert' ? 'red' : level === 'advanced' ? 'orange' : level === 'intermediate' ? 'blue' : 'green'}>
          {t(`participants.experience.${level}`)}
        </Tag>
      ),
    },
    {
      title: t('participants.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: t('participants.registeredAt'),
      dataIndex: 'registered_at',
      key: 'registered_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (text: any, record: Participant) => (
        <Space>
          {record.status === 'applied' && (
            <>
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleApprove(record)}
              >
                {t('participants.approve')}
              </Button>
              <Button 
                danger 
                size="small"
                onClick={() => handleReject(record)}
              >
                {t('participants.reject')}
              </Button>
            </>
          )}
          <Button 
            size="small"
            onClick={() => {
              setSelectedParticipant(record);
              setApprovalModalVisible(true);
            }}
          >
            {t('participants.viewDetails')}
          </Button>
        </Space>
      ),
    },
  ];

  // 统计数据
  const stats = {
    total: participants.length,
    applied: participants.filter(p => p.status === 'applied').length,
    approved: participants.filter(p => p.status === 'approved').length,
    rejected: participants.filter(p => p.status === 'rejected').length,
    registered: participants.filter(p => p.status === 'registered').length,
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>
        {t('participants.management')} - {participants[0]?.activity_title || t('participants.activity')}
      </Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Badge count={stats.total} showZero color="blue">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
                <div>{t('participants.total')}</div>
              </div>
            </Badge>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Badge count={stats.applied} showZero color="orange">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.applied}</div>
                <div>{t('participants.pending')}</div>
              </div>
            </Badge>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Badge count={stats.approved} showZero color="green">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.approved}</div>
                <div>{t('participants.approved')}</div>
              </div>
            </Badge>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Badge count={stats.rejected} showZero color="red">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.rejected}</div>
                <div>{t('participants.rejected')}</div>
              </div>
            </Badge>
          </Card>
        </Col>
      </Row>

      {/* 参与者列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={participants}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 审批模态框 */}
      <Modal
        title={selectedParticipant ? `${t('participants.approve')} / ${t('participants.reject')} ${selectedParticipant.user_name}` : ''}
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedParticipant(null);
          approvalForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {selectedParticipant && (
          <div>
            <Descriptions column={1} size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label={t('participants.name')}>
                {selectedParticipant.user_name}
              </Descriptions.Item>
              <Descriptions.Item label={t('participants.email')}>
                {selectedParticipant.user_email}
              </Descriptions.Item>
              <Descriptions.Item label={t('participants.phone')}>
                {selectedParticipant.user_phone}
              </Descriptions.Item>
              <Descriptions.Item label={t('participants.experienceLevel')}>
                {t(`participants.experience.${selectedParticipant.experience_level}`)}
              </Descriptions.Item>
              <Descriptions.Item label={t('participants.applicationMessage')}>
                {selectedParticipant.application_message}
              </Descriptions.Item>
              <Descriptions.Item label={t('participants.skillsMatch')}>
                {selectedParticipant.skills_match}
              </Descriptions.Item>
              <Descriptions.Item label={t('participants.emergencyContact')}>
                {selectedParticipant.emergency_contact_name} - {selectedParticipant.emergency_contact_phone}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={approvalForm}
              onFinish={handleApprovalSubmit}
              layout="vertical"
            >
              <Form.Item
                label={t('participants.status')}
                name="status"
                rules={[{ required: true, message: t('participants.statusRequired') }]}
              >
                <Select placeholder={t('participants.selectStatus')}>
                  <Select.Option value="approved">{t('participants.approve')}</Select.Option>
                  <Select.Option value="rejected">{t('participants.reject')}</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={t('participants.organizerNotes')}
                name="organizer_notes"
              >
                <TextArea 
                  rows={3} 
                  placeholder={t('participants.organizerNotesPlaceholder')}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {t('common.submit')}
                  </Button>
                  <Button onClick={() => {
                    setApprovalModalVisible(false);
                    setSelectedParticipant(null);
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

export default ParticipantManagementPage;
