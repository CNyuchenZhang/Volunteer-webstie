import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CreateActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // 获取category列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await activityAPI.getCategories();
        console.log('Categories response:', response);
        // 处理分页响应，提取results数组
        if (response && response.results) {
          setCategories(response.results);
        } else if (Array.isArray(response)) {
          setCategories(response);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        // 临时使用硬编码的分类
        setCategories([
          { id: 1, name: 'Environment' },
          { id: 2, name: 'Education' },
          { id: 3, name: 'Social' },
          { id: 4, name: 'Animal Welfare' }
        ]);
      }
    };
    loadCategories();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      console.log('Create activity form values:', values);
      
      // 处理日期范围
      const [startDate, endDate] = values.dateRange;
      
      // 将category字符串转换为ID
      const categoryObj = categories.find(cat => cat.name === values.category);
      if (!categoryObj) {
        throw new Error('Invalid category selected');
      }
      
      const activityData = {
        title: values.title,
        description: values.description,
        full_description: values.full_description,
        category: categoryObj.id,
        location: values.location,
        address: values.address,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        registration_deadline: values.registration_deadline?.toISOString(),
        max_participants: values.max_participants,
        min_participants: values.min_participants || 1,
        required_skills: values.required_skills || [],
        age_requirement: values.age_requirement,
        physical_requirements: values.physical_requirements,
        equipment_needed: values.equipment_needed,
        cover_image: values.cover_image,
        images: values.images || []
      };
      
      console.log('Sending activity data:', activityData);
      await activityAPI.createActivity(activityData);
      message.success(t('activities.activityCreatedSuccess'));
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Activity creation error:', error);
      message.error(error.message || t('activities.activityCreationError'));
    } finally {
      setLoading(false);
    }
  };

  // 只有NGO组织者可以创建活动
  if (user?.role !== 'organizer') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={3}>{t('common.accessDenied')}</Title>
        <p>{t('activities.organizerOnly')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>{t('activities.createActivity')}</Title>
      
      <Card>
        <Form
          name="createActivity"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            min_participants: 1,
            max_participants: 10
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('activities.activityTitle')}
                name="title"
                rules={[{ required: true, message: t('activities.titleRequired') }]}
              >
                <Input placeholder={t('activities.activityTitlePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('activities.category')}
                name="category"
                rules={[{ required: true, message: t('activities.categoryRequired') }]}
              >
                <Select placeholder={t('activities.selectCategory')}>
                  {Array.isArray(categories) && categories.map(category => (
                    <Select.Option key={category.id} value={category.name}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t('activities.description')}
            name="description"
            rules={[{ required: true, message: t('activities.descriptionRequired') }]}
          >
            <TextArea rows={3} placeholder={t('activities.descriptionPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('activities.fullDescription')}
            name="full_description"
          >
            <TextArea rows={5} placeholder={t('activities.fullDescriptionPlaceholder')} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('activities.location')}
                name="location"
                rules={[{ required: true, message: t('activities.locationRequired') }]}
              >
                <Input placeholder={t('activities.locationPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('activities.address')}
                name="address"
              >
                <Input placeholder={t('activities.addressPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('activities.dateRange')}
                name="dateRange"
                rules={[{ required: true, message: t('activities.dateRangeRequired') }]}
              >
                <RangePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder={[t('activities.startDate'), t('activities.endDate')]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('activities.registrationDeadline')}
                name="registration_deadline"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder={t('activities.registrationDeadlinePlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t('activities.minParticipants')}
                name="min_participants"
                rules={[{ required: true, message: t('activities.minParticipantsRequired') }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('activities.maxParticipants')}
                name="max_participants"
                rules={[{ required: true, message: t('activities.maxParticipantsRequired') }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('activities.ageRequirement')}
                name="age_requirement"
              >
                <Input placeholder={t('activities.ageRequirementPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t('activities.requiredSkills')}
            name="required_skills"
          >
            <Select
              mode="tags"
              placeholder={t('activities.requiredSkillsPlaceholder')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('activities.physicalRequirements')}
            name="physical_requirements"
          >
            <TextArea rows={2} placeholder={t('activities.physicalRequirementsPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('activities.equipmentNeeded')}
            name="equipment_needed"
          >
            <TextArea rows={2} placeholder={t('activities.equipmentNeededPlaceholder')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('activities.createActivity')}
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateActivityPage;