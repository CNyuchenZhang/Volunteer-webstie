import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin, Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'volunteer' | 'organizer' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // 显示加载状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果指定了角色要求，检查用户角色
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Result
        status="403"
        title={t('common.accessDenied')}
        subTitle={`${t('common.loginRequired')} - ${t('auth.role')}: ${requiredRole}`}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            {t('common.back')}
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
