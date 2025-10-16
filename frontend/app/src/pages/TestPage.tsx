import React, { useState } from 'react';
import { Button, Card, Typography, Space, message } from 'antd';
import { userAPI } from '../services/api';

const { Title } = Typography;

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testRegister = async () => {
    try {
      setLoading(true);
      const response = await userAPI.register({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'MySecurePass123!',
        password_confirm: 'MySecurePass123!',
        first_name: 'Test',
        last_name: 'User',
        role: 'volunteer'
      });
      setResult(response);
      message.success('Registration successful!');
    } catch (error: any) {
      message.error('Registration failed: ' + (error.message || 'Unknown error'));
      setResult(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      const response = await userAPI.login({
        email: 'admin@volunteer-platform.com',
        password: 'admin123'
      });
      setResult(response);
      message.success('Login successful!');
    } catch (error: any) {
      message.error('Login failed: ' + (error.message || 'Unknown error'));
      setResult(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>API Test Page</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={4}>Test API Connection</Title>
          <Space>
            <Button type="primary" onClick={testRegister} loading={loading}>
              Test Register
            </Button>
            <Button onClick={testLogin} loading={loading}>
              Test Login
            </Button>
          </Space>
        </Card>

        {result && (
          <Card>
            <Title level={4}>Result:</Title>
            <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default TestPage;
