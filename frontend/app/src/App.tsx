import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import TestPage from './pages/TestPage';
import CreateActivityPage from './pages/CreateActivityPage';
import AdminActivityApprovalPage from './pages/AdminActivityApprovalPage';
import OrganizerActivitiesPage from './pages/OrganizerActivitiesPage';
import ParticipantManagementPage from './pages/ParticipantManagementPage';
import { AuthProvider } from './contexts/AuthContext';

// Styles
import './App.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { i18n } = useTranslation();
  
  const antdLocale = i18n.language === 'zh' ? zhCN : enUS;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={antdLocale}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="activities" element={
                    <ProtectedRoute>
                      <ActivitiesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="activities/:id" element={
                    <ProtectedRoute>
                      <ActivityDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="search" element={
                    <ProtectedRoute>
                      <SearchPage />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                  <Route path="test" element={
                    <ProtectedRoute>
                      <TestPage />
                    </ProtectedRoute>
                  } />
                  <Route path="create-activity" element={
                    <ProtectedRoute requiredRole="organizer">
                      <CreateActivityPage />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/activity-approval" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminActivityApprovalPage />
                    </ProtectedRoute>
                  } />
                  <Route path="my-activities" element={
                    <ProtectedRoute requiredRole="organizer">
                      <OrganizerActivitiesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="activities/:activityId/participants" element={
                    <ProtectedRoute requiredRole="organizer">
                      <ParticipantManagementPage />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
