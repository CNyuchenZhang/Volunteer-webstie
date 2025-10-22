import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography,
  Space,
  Select,
  Radio,
  message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      console.log('Register form values:', values);
      
      // 确保数据格式正确
      const registerData = {
        username: values.username || values.email, // 如果没有username字段，使用email
        email: values.email,
        password: values.password,
        password_confirm: values.password_confirm,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone || '',
        role: values.role
      };
      
      console.log('Sending register data:', registerData);
      await register(registerData);
      message.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // 处理后端返回的错误信息
      let errorMessage = t('auth.registerError');
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Parsing error data:', errorData);
        
        // 字段名称映射（用于更友好的显示）
        const fieldNameMap: { [key: string]: string } = {
          'email': t('auth.email'),
          'username': t('auth.username'),
          'password': t('auth.password'),
          'password_confirm': t('auth.confirmPassword'),
          'first_name': t('auth.firstName'),
          'last_name': t('auth.lastName'),
          'phone': t('auth.phone'),
          'role': t('auth.role'),
        };
        
        // 如果是字段级别的错误（例如：{ email: ['User with this email already exists.'] }）
        if (typeof errorData === 'object' && !errorData.error && !errorData.detail && !errorData.message) {
          const errors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            const fieldName = fieldNameMap[field] || field;
            if (Array.isArray(messages)) {
              // 显示字段名 + 错误信息
              messages.forEach(msg => {
                errors.push(`${fieldName}: ${msg}`);
              });
            } else {
              errors.push(`${fieldName}: ${String(messages)}`);
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          }
        }
        // 如果有明确的 error 或 detail 字段
        else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Final error message:', errorMessage);
      
      // 使用 modal 显示错误，支持多行显示
      message.error({
        content: errorMessage,
        duration: 5,
        style: { whiteSpace: 'pre-line' } // 支持换行显示
      });
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
          {t('auth.register')}
        </Title>
        
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={t('auth.role')}
            name="role"
            rules={[{ required: true, message: t('auth.roleRequired') }]}
          >
            <Radio.Group>
              <Radio value="volunteer">{t('auth.volunteer')}</Radio>
              <Radio value="organizer">{t('auth.organizer')}</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={t('auth.username')}
            name="username"
            rules={[{ required: true, message: t('auth.usernameRequired') }]}
          >
            <Input placeholder={t('auth.usernamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('auth.firstName')}
            name="first_name"
            rules={[{ required: true, message: t('auth.firstNameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('auth.lastName')}
            name="last_name"
            rules={[{ required: true, message: t('auth.lastNameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('auth.email')}
            name="email"
            rules={[
              { required: true, message: t('auth.emailRequired') },
              { type: 'email', message: t('auth.emailInvalid') }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('auth.phone')}
            name="phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('auth.password')}
            name="password"
            rules={[
              { required: true, message: t('auth.passwordRequired') },
              { min: 8, message: t('auth.passwordMinLength') },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  // 检查是否包含数字
                  const hasNumber = /\d/.test(value);
                  // 检查是否包含字母
                  const hasLetter = /[a-zA-Z]/.test(value);
                  
                  if (!hasNumber || !hasLetter) {
                    return Promise.reject(new Error(t('auth.passwordFormat')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password placeholder={t('auth.passwordPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('auth.confirmPassword')}
            name="password_confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('auth.register')}
            </Button>
          </Form.Item>
        </Form>

        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <a href="/login">{t('auth.haveAccount')}</a>
        </Space>
      </Card>
    </div>
  );
};

export default RegisterPage;