import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography,
  Space,
  message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      console.log('Login form values:', values);
      
      await login(values.email, values.password);
      message.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '24px'
    }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          {t('auth.login')}
        </Title>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={t('auth.email')}
            name="email"
            rules={[{ required: true, message: t('auth.emailRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('auth.password')}
            name="password"
            rules={[{ required: true, message: t('auth.passwordRequired') }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>

        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <a href="/register">{t('auth.noAccount')}</a>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;