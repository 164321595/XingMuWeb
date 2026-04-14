import api from './index';

const request = api.request;

export const adminApi = {
  login: (data: { username: string; password: string }) =>
    request.post('/admin/auth/login', data),

  register: (data: {
    username: string;
    password: string;
    real_name: string;
    email?: string;
    phone?: string;
    role?: string;
  }) => request.post('/admin/auth/register', data),

  getAdminInfo: () => request.get('/admin/admins/info'),

  getAdminList: (params?: {
    keyword?: string;
    role?: string;
    status?: number;
    page?: number;
    size?: number;
  }) => request.get('/admin/admins', { params }),

  updateAdmin: (id: number, data: any) =>
    request.put(`/admin/admins/${id}`, data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    request.post('/admin/admins/change-password', data),

  getDashboardStats: () => request.get('/admin/dashboard/stats'),

  getCategoryDistribution: (type: string) => request.get('/admin/dashboard/category-distribution', { type }),

  getAdminLogs: (params?: {
    admin_id?: number;
    action?: string;
    keyword?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    size?: number;
  }) => request.get('/admin/logs', { params }),
};

export const adminUserApi = {
  getUserList: (params?: {
    keyword?: string;
    status?: number;
    page?: number;
    size?: number;
  }) => request.get('/admin/users', { params }),

  getUserDetail: (id: number) => request.get(`/admin/users/${id}`),

  updateUserStatus: (id: number, status: number) =>
    request.put(`/admin/users/${id}/status`, { status }),

  deleteUser: (id: number) => request.delete(`/admin/users/${id}`),
};

export const adminOrderApi = {
  getOrderList: (params?: {
    status?: number;
    keyword?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    size?: number;
  }) => request.get('/admin/orders', { params }),

  getOrderDetail: (id: number) => request.get(`/admin/orders/${id}`),

  processRefund: (id: number, reason?: string) =>
    request.post(`/admin/orders/${id}/refund`, { reason }),

  exportOrders: (params?: {
    status?: number;
    start_date?: string;
    end_date?: string;
  }) => request.get('/admin/orders/export', { params }),
};

export const adminPerformanceApi = {
  getPerformanceList: (params?: {
    category_id?: number;
    status?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }) => request.get('/admin/performances', { params }),

  getPerformanceDetail: (id: number) =>
    request.get(`/admin/performances/${id}`),

  createPerformance: (data: any) =>
    request.post('/admin/performances', data),

  updatePerformance: (id: number, data: any) =>
    request.put(`/admin/performances/${id}`, data),

  deletePerformance: (id: number) =>
    request.delete(`/admin/performances/${id}`),
};

export const adminTicketTypeApi = {
  getTicketTypeList: (params?: { performance_id?: number; page?: number; size?: number }) =>
    request.get('/admin/ticket-types', { params }),

  createTicketType: (data: any) =>
    request.post('/admin/ticket-types', data),

  updateTicketType: (id: number, data: any) =>
    request.put(`/admin/ticket-types/${id}`, data),

  deleteTicketType: (id: number) =>
    request.delete(`/admin/ticket-types/${id}`),
};

export const adminCategoryApi = {
  getCategoryList: () => request.get('/admin/categories'),

  createCategory: (data: { name: string; parent_id?: number; sort?: number }) =>
    request.post('/admin/categories', data),

  updateCategory: (id: number, data: { name?: string; sort?: number }) =>
    request.put(`/admin/categories/${id}`, data),

  deleteCategory: (id: number) =>
    request.delete(`/admin/categories/${id}`),
};

export const adminSystemApi = {
  getConfig: () => request.get('/admin/system/config'),

  updateConfig: (key: string, value: string) =>
    request.put('/admin/system/config', { key, value }),
};
