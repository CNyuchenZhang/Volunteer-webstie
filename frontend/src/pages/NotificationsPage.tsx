import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  List, 
  Typography,
  message
} from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

// 正则表达式，用于匹配 {{variable}} 格式的模板变量
const templateRegex = /\{\{([^}]+)\}\}/g;

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const formatNotification = (item: any) => {
    // Use the message field directly (reverted assistant changes)
    return item.message;
  };

  const header = useMemo(() => {
    if (!user) return t('notifications.title');
    if (user.role === 'admin') return t('notifications.title') + ' - Admin';
    if (user.role === 'organizer') return t('notifications.title') + ' - NGO';
    return t('notifications.title');
  }, [user, t]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await notificationAPI.getNotifications();
        // 兼容两种返回格式
        const list = data?.results || data?.notifications || [];
        setNotifications(list);
      } catch (e: any) {
        console.error('Failed to load notifications:', e);
        message.error(e.message || t('notifications.loadError'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BellOutlined /> {t('notifications.title')}
      </Title>
      
      <Card loading={loading}>
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={formatNotification(item)}
                description={`${t(`notifications.types.${item.notification_type}`, { defaultValue: item.notification_type })} · ${new Date(item.created_at).toLocaleString()}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;