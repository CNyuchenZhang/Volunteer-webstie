import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar, Space, Tag, List, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  HeartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
} from '@ant-design/icons';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // 加载通知数据
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setLoadingNotifications(true);
        const data = await notificationAPI.getNotifications();
        const list = data?.results || data?.notifications || [];
        setNotifications(list.slice(0, 5)); // 只显示最新5条
        
        // 计算未读数量
        const unread = list.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
    // 每30秒刷新一次通知
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // 根据用户角色生成菜单项
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: t('navigation.home'),
      },
    ];

    if (user?.role === 'volunteer') {
      return [
        ...baseItems,
        {
          key: '/activities',
          icon: <HeartOutlined />,
          label: t('navigation.activities'),
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: t('notifications.title'),
        },
        {
          key: '/profile',
          icon: <UserOutlined />,
          label: t('navigation.profile'),
        },
      ];
    } else if (user?.role === 'organizer') {
      return [
        ...baseItems,
        {
          key: '/activities',
          icon: <HeartOutlined />,
          label: t('navigation.activities'),
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: t('notifications.title'),
        },
        {
          key: '/profile',
          icon: <UserOutlined />,
          label: t('navigation.profile'),
        },
      ];
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          key: '/activities',
          icon: <HeartOutlined />,
          label: t('navigation.activities'),
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: t('notifications.title'),
        },
        {
          key: '/profile',
          icon: <UserOutlined />,
          label: t('navigation.profile'),
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('navigation.profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'logout':
        // Handle logout logic
        navigate('/login');
        break;
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['/'];
    if (path.startsWith('/activities')) return ['/activities'];
    if (path.startsWith('/notifications')) return ['/notifications'];
    if (path.startsWith('/profile')) return ['/profile'];
    if (path.startsWith('/dashboard')) return ['/dashboard'];
    if (path.startsWith('/admin')) return ['/admin'];
    return [];
  };

  // 通知下拉菜单内容
  const notificationMenu = (
    <div style={{ 
      width: 320, 
      maxHeight: 400, 
      overflow: 'auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{t('notifications.title')}</span>
        <Button 
          type="link" 
          size="small"
          onClick={() => navigate('/notifications')}
        >
          {t('common.viewAll', { defaultValue: '查看全部' })}
        </Button>
      </div>
      
      <Spin spinning={loadingNotifications}>
        <List
          dataSource={notifications}
          locale={{ emptyText: t('notifications.noNotifications') }}
          renderItem={(item: any) => (
            <List.Item
              style={{ 
                padding: '12px 16px', 
                cursor: 'pointer',
                backgroundColor: item.is_read ? 'white' : '#f0f5ff'
              }}
              onClick={() => {
                navigate('/notifications');
              }}
            >
              <List.Item.Meta
                avatar={<BellOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                title={
                  <div style={{ 
                    fontSize: '14px',
                    fontWeight: item.is_read ? 'normal' : 'bold'
                  }}>
                    {item.message || item.title}
                  </div>
                }
                description={
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: collapsed ? '16px' : '20px',
          fontWeight: 'bold',
        }}>
          {collapsed ? 'VP' : t('common.welcome')}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: '#fff',
          }}
        />
      </Sider>

      <AntLayout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space size="middle">
            <LanguageSwitcher />
            
            {/* 通知图标 */}
            <Dropdown
              dropdownRender={() => notificationMenu}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                style={{ padding: '4px 8px' }}
              />
            </Dropdown>
            
            {/* 显示用户角色 */}
            {user && (
              <Tag color={
                user.role === 'admin' ? 'red' : 
                user.role === 'organizer' ? 'blue' : 
                'green'
              }>
                {user.role === 'admin' ? t('auth.admin') : 
                 user.role === 'organizer' ? t('auth.organizer') : 
                 t('auth.volunteer')}
              </Tag>
            )}

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Button type="text" style={{ padding: 0 }}>
                <Avatar
                  src={user?.avatar}
                  style={{
                    background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  icon={!user?.avatar && <UserOutlined />}
                />
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
