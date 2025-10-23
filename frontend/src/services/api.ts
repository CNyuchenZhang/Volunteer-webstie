import axios from 'axios';

// API基础配置 - 使用相对路径，通过nginx网关路由
const API_BASE_URL = '/api/v1/users';
const ACTIVITY_API_BASE_URL = '/api/v1/activities';
const NOTIFICATION_API_BASE_URL = '/api/v1/notifications';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 统一错误处理
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    } else if (error.response?.data?.detail) {
      error.message = error.response.data.detail;
    } else if (error.message) {
      // 保持原有错误信息
    } else {
      error.message = '网络请求失败，请检查网络连接';
    }
    
    return Promise.reject(error);
  }
);

// 用户相关API
export const userAPI = {
  // 用户注册
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'volunteer' | 'organizer';
  }) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // 用户登录
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  // 用户登出
  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  // 获取用户信息
  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  // 更新用户信息
  updateProfile: async (userData: any) => {
    const response = await api.put('/profile/update/', userData);
    return response.data;
  },

  // 上传头像
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/profile/upload-avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 删除头像
  removeAvatar: async () => {
    const response = await api.delete('/profile/remove-avatar/');
    return response.data;
  },

  // 获取用户统计信息
  getStats: async () => {
    const response = await api.get('/global-stats/');
    return response.data;
  },
};

// 活动API配置
const activityApi = axios.create({
  baseURL: ACTIVITY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 活动API请求拦截器
activityApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('Activity API interceptor - Token:', token);
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('Activity API interceptor - Added Authorization header');
    } else {
      console.log('Activity API interceptor - No token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 活动API响应拦截器
activityApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 统一错误处理
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    } else if (error.response?.data?.detail) {
      error.message = error.response.data.detail;
    } else if (error.message) {
      // 保持原有错误信息
    } else {
      error.message = '活动服务请求失败，请稍后重试';
    }
    
    return Promise.reject(error);
  }
);

// 活动相关API
export const activityAPI = {
  // 获取活动列表
  getActivities: async (params?: any) => {
    const response = await activityApi.get('/activities/', { params });
    return response.data;
  },

  // 获取活动分类列表
  getCategories: async () => {
    const response = await activityApi.get('/categories/');
    return response.data;
  },

  // 获取活动详情
  getActivity: async (id: number) => {
    const response = await activityApi.get(`/activities/${id}/`);
    return response.data;
  },

  // 创建活动
  createActivity: async (activityData: any) => {
    const config = activityData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await activityApi.post('/activities/', activityData, config);
    return response.data;
  },

  // 申请参加活动
  joinActivity: async (activityId: number, applicationData?: any) => {
    const response = await activityApi.post('/participants/', {
      activity: activityId,
      ...applicationData
    });
    return response.data;
  },

  // 检查是否已申请活动
  checkApplicationStatus: async (activityId: number) => {
    const response = await activityApi.get(`/participants/?activity=${activityId}`);
    return response.data;
  },

  // 获取待审批活动 (管理员)
  getPendingActivities: async () => {
    const response = await activityApi.get('/activities/?approval_status=pending');
    return response.data;
  },

  // 审批活动 (管理员)
  approveActivity: async (activityId: number, approvalData: any) => {
    const response = await activityApi.patch(`/activities/${activityId}/approve/`, approvalData);
    return response.data;
  },

  // 获取活动参与者 (组织者)
  getActivityParticipants: async (activityId: number) => {
    const response = await activityApi.get(`/participants/?activity=${activityId}`);
    return response.data;
  },

  // 获取所有参与者 (组织者)
  getAllParticipants: async () => {
    const response = await activityApi.get('/participants/');
    return response.data;
  },

  // 审批参与者 (组织者)
  approveParticipant: async (participantId: number, approvalData: any) => {
    const response = await activityApi.patch(`/participants/${participantId}/`, approvalData);
    return response.data;
  },

  // 更新活动状态 (组织者)
  updateActivityStatus: async (activityId: number, statusData: any) => {
    const response = await activityApi.patch(`/activities/${activityId}/`, statusData);
    return response.data;
  },

  // 获取活动统计信息
  getStats: async () => {
    const response = await activityApi.get('/stats/');
    return response.data;
  },
};

// 通知相关API（来自 notification-service）
export const notificationAPI = {
  // 获取通知列表
  getNotifications: async () => {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const params: Record<string, any> = {};
    if (user?.id) {
      params.recipient_id = user.id;
    }
    const response = await axios.get(`${NOTIFICATION_API_BASE_URL}/notifications/`, { params });
    return response.data;
  },

  // 标记通知为已读
  markAsRead: async (notificationId: number) => {
    const response = await axios.post(`${NOTIFICATION_API_BASE_URL}/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  },
};

export default api;
