import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar, Badge, Space, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  HeartOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  MessageOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  
} from '@ant-design/icons';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
          key: '/profile',
          icon: <UserOutlined />,
          label: t('navigation.profile'),
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: t('navigation.notifications'),
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
          key: '/profile',
          icon: <UserOutlined />,
          label: t('navigation.profile'),
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: t('navigation.notifications'),
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
          key: '/profile',
          icon: <UserOutlined />,
          label: t('navigation.profile'),
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: t('navigation.notifications'),
        },
        {
          key: '/analytics',
          icon: <BarChartOutlined />,
          label: t('navigation.analytics'),
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
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
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
      case 'settings':
        navigate('/settings');
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
    if (path.startsWith('/profile')) return ['/profile'];
    if (path.startsWith('/dashboard')) return ['/dashboard'];
    if (path.startsWith('/notifications')) return ['/notifications'];
    if (path.startsWith('/messages')) return ['/messages'];
    if (path.startsWith('/analytics')) return ['/analytics'];
    if (path.startsWith('/admin')) return ['/admin'];
    return [];
  };

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
            
            <Badge count={0} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => navigate('/notifications')}
                title={t('navigation.notifications')}
              />
            </Badge>

            <Badge count={0} size="small">
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => navigate('/messages')}
                title={t('navigation.messages')}
              />
            </Badge>

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Button type="text" style={{ padding: 0 }}>
                <Avatar
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  icon={<UserOutlined />}
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
