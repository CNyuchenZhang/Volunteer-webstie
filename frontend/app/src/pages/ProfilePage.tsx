import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Typography,
  Avatar,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  message
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const { Title, Paragraph } = Typography;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onEdit = () => {
    form.setFieldsValue({
      first_name: user?.first_name,
      last_name: user?.last_name,
      phone: user?.phone,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      await userAPI.updateProfile(values);
      message.success(t('common.success'));
      setOpen(false);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={100} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: '16px' }}>
                {t('profile.name')}
              </Title>
              <Tag color="blue">{t('profile.volunteer')}</Tag>
            </div>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title={t('profile.information')}>
            <Paragraph>
              <strong>{t('profile.email')}:</strong> {user?.email}
            </Paragraph>
            <Paragraph>
              <strong>{t('profile.phone')}:</strong> +86 138 0000 0000
            </Paragraph>
            <Paragraph>
              <strong>{t('profile.bio')}:</strong> {t('profile.bioText')}
            </Paragraph>
            
            <Button type="primary" onClick={onEdit}>
              {t('profile.edit')}
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal open={open} onCancel={() => setOpen(false)} onOk={onSubmit} title={t('profile.editProfile')}>
        <Form layout="vertical" form={form}>
          <Form.Item label={t('auth.firstName')} name="first_name">
            <Input />
          </Form.Item>
          <Form.Item label={t('auth.lastName')} name="last_name">
            <Input />
          </Form.Item>
          <Form.Item label={t('auth.phone')} name="phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;