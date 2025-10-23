import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Button, 
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Descriptions,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Divider,
  Image
} from 'antd';
import { 
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface Activity {
  organizer_id: number;
  id: number;
  title: string;
  description: string;
  full_description: string;
  category_name: string;
  location: string;
  address: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  participants_count: number;
  status: string;
  approval_status: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  required_skills: string[];
  age_requirement: string;
  physical_requirements: string;
  equipment_needed: string;
  created_at: string;
  images?: string[];
}

const ActivityDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinForm] = Form.useForm();
  const [applicationStatus, setApplicationStatus] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadActivity();
    }
  }, [id]);

  useEffect(() => {
    if (activity && user) {
      checkApplicationStatus();
    }
  }, [activity, user]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getActivity(parseInt(id!));
      setActivity(response);
    } catch (error: any) {
      console.error('Failed to load activity:', error);
      message.error(error.message || t('activities.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || user.role !== 'volunteer' || !id) return;
    
    try {
      const response = await activityAPI.checkApplicationStatus(parseInt(id));
      const userApplication = response.results?.find((app: any) => app.user_id === user.id);
      setApplicationStatus(userApplication || null);
    } catch (error) {
      // 忽略错误
    }
  };

  const handleJoinActivity = () => {
    if (!user) {
      message.error(t('auth.loginRequired'));
      navigate('/login');
      return;
    }

    if (user.role !== 'volunteer') {
      message.error(t('activities.volunteerOnly'));
      return;
    }

    setJoinModalVisible(true);
  };

  const handleJoinSubmit = async (values: any) => {
    if (!activity) return;

    try {
      await activityAPI.joinActivity(activity.id, values);
      message.success(t('activities.joinSuccessPending'));
      setJoinModalVisible(false);
      joinForm.resetFields();
      loadActivity(); // 重新加载活动信息以更新状态
    } catch (error: any) {
      console.error('Join activity error:', error);
      if (error.response && error.response.status === 409) {
        message.error(t('activities.alreadyAppliedError'));
      } else {
        message.error(error.message || t('activities.joinError'));
      }
    }
  };

  const getJoinButtonStatus = () => {
    if (!user || !activity) {
      return { visible: false };
    }

    // 志愿者逻辑：显示申请状态或join按钮
    if (user.role === 'volunteer') {
      // 如果已经申请过，显示申请状态
      if (applicationStatus) {
        return { 
          visible: true, 
          disabled: true, 
          text: t(`activities.statuses.${applicationStatus.status}`),
          status: applicationStatus.status
        };
      }

      const canApply = activity.approval_status === 'approved' &&
                       !['full', 'cancelled'].includes(activity.status) &&
                       activity.participants_count < activity.max_participants;

      if (!canApply) {
        return { visible: false };
      }

      return { visible: true, disabled: false, text: t('activities.join') };
    }

    // NGO和admin逻辑：不显示join按钮
    return { visible: false };
  };

  const canManageParticipants = () => {
    return user?.role === 'organizer' && activity?.organizer_id === user.id;
  };

  const getStatusColor = (status: string, approvalStatus: string) => {
    if (approvalStatus !== 'approved') return 'orange';
    if (status === 'full') return 'red';
    if (status === 'cancelled') return 'red';
    return 'green';
  };

  const getStatusText = (status: string, approvalStatus: string) => {
    if (approvalStatus === 'pending') return t('activities.statuses.pendingApproval');
    if (approvalStatus === 'rejected') return t('activities.statuses.rejected');
    return t(`activities.statuses.${status}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>{t('activities.notFound')}</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: '24px' }}>
              <Title level={2}>{activity.title}</Title>
              <Space>
                <Tag color="blue">{activity.category_name}</Tag>
                <Tag color={getStatusColor(activity.status, activity.approval_status)}>
                  {getStatusText(activity.status, activity.approval_status)}
                </Tag>
              </Space>
            </div>

            <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
              {activity.description}
            </Paragraph>

            {activity.images && activity.images.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={4}>{t('activities.activityImages')}</Title>
                <Image.PreviewGroup>
                  <Space wrap>
                    {activity.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`${activity.title} - ${index + 1}`}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            {activity.full_description && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={4}>{t('activities.fullDescription')}</Title>
                <Paragraph>{activity.full_description}</Paragraph>
              </div>
            )}

            <Descriptions column={1} bordered>
              <Descriptions.Item label={<><CalendarOutlined /> {t('activities.startDate')}</>}>
                {new Date(activity.start_date).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label={<><ClockCircleOutlined /> {t('activities.endDate')}</>}>
                {new Date(activity.end_date).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> {t('activities.location')}</>}>
                {activity.location}
                {activity.address && <div style={{ color: '#666', fontSize: '12px' }}>{activity.address}</div>}
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> {t('activities.participants')}</>}>
                {activity.participants_count}/{activity.max_participants}
              </Descriptions.Item>
              {activity.required_skills && activity.required_skills.length > 0 && (
                <Descriptions.Item label={t('activities.requiredSkills')}>
                  {activity.required_skills.map((skill, index) => (
                    <Tag key={index} color="purple">{skill}</Tag>
                  ))}
                </Descriptions.Item>
              )}
              {activity.age_requirement && (
                <Descriptions.Item label={t('activities.ageRequirement')}>
                  {activity.age_requirement}
                </Descriptions.Item>
              )}
              {activity.physical_requirements && (
                <Descriptions.Item label={t('activities.physicalRequirements')}>
                  {activity.physical_requirements}
                </Descriptions.Item>
              )}
              {activity.equipment_needed && (
                <Descriptions.Item label={t('activities.equipmentNeeded')}>
                  {activity.equipment_needed}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t('activities.organizer')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <UserOutlined />
                <span>{activity.organizer_name}</span>
              </Space>
              <Space>
                <MailOutlined />
                <span>{activity.organizer_email}</span>
              </Space>
              {activity.organizer_phone && (
                <Space>
                  <PhoneOutlined />
                  <span>{activity.organizer_phone}</span>
                </Space>
              )}
            </Space>
          </Card>

          <Card style={{ marginTop: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {getJoinButtonStatus().visible && (
                (() => {
                  const buttonStatus = getJoinButtonStatus();
                  if (buttonStatus.status === 'applied') {
                    return <Tag color="orange" style={{ fontSize: '16px', padding: '8px 16px', textAlign: 'center', display: 'block' }}>
                      {t('activities.waitingApproval')}
                    </Tag>;
                  } else if (buttonStatus.status === 'approved') {
                    return <Tag color="green" style={{ fontSize: '16px', padding: '8px 16px', textAlign: 'center', display: 'block' }}>
                      {t('activities.approved')}
                    </Tag>;
                  } else if (buttonStatus.status === 'rejected') {
                    return <Tag color="red" style={{ fontSize: '16px', padding: '8px 16px', textAlign: 'center', display: 'block' }}>
                      {t('activities.rejected')}
                    </Tag>;
                  } else {
                    return (
                      <Button 
                        type="primary" 
                        size="large" 
                        block
                        onClick={handleJoinActivity}
                        disabled={buttonStatus.disabled}
                      >
                        {buttonStatus.text}
                      </Button>
                    );
                  }
                })()
              )}
              
              {canManageParticipants() && (
                <Button 
                  type="default" 
                  size="large" 
                  block
                  onClick={() => navigate(`/activities/${activity.id}/participants`)}
                >
                  {t('participants.manage')}
                </Button>
              )}

              <Button 
                type="default" 
                size="large" 
                block
                onClick={() => navigate('/activities')}
              >
                {t('common.back')}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 申请参加活动模态框 */}
      <Modal
        title={t('activities.joinActivity')}
        open={joinModalVisible}
        onCancel={() => {
          setJoinModalVisible(false);
          joinForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={joinForm}
          onFinish={handleJoinSubmit}
          layout="vertical"
        >
          <Form.Item
            label={t('participants.applicationMessage')}
            name="application_message"
            rules={[{ required: true, message: t('participants.applicationMessageRequired') }]}
          >
            <TextArea 
              rows={4} 
              placeholder={t('participants.applicationMessagePlaceholder')}
            />
          </Form.Item>

          <Form.Item
            label={t('participants.skillsMatch')}
            name="skills_match"
          >
            <TextArea 
              rows={3} 
              placeholder={t('participants.skillsMatchPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            label={t('participants.experienceLevel')}
            name="experience_level"
            rules={[{ required: true, message: t('participants.experienceLevelRequired') }]}
          >
            <Select placeholder={t('participants.selectExperienceLevel')}>
              <Select.Option value="beginner">{t('participants.experience.beginner')}</Select.Option>
              <Select.Option value="intermediate">{t('participants.experience.intermediate')}</Select.Option>
              <Select.Option value="advanced">{t('participants.experience.advanced')}</Select.Option>
              <Select.Option value="expert">{t('participants.experience.expert')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={t('participants.emergencyContactName')}
            name="emergency_contact_name"
            rules={[{ required: true, message: t('participants.emergencyContactNameRequired') }]}
          >
            <Input placeholder={t('participants.emergencyContactNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('participants.emergencyContactPhone')}
            name="emergency_contact_phone"
            rules={[{ required: true, message: t('participants.emergencyContactPhoneRequired') }]}
          >
            <Input placeholder={t('participants.emergencyContactPhonePlaceholder')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('activities.submitApplication')}
              </Button>
              <Button onClick={() => {
                setJoinModalVisible(false);
                joinForm.resetFields();
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

export default ActivityDetailPage;