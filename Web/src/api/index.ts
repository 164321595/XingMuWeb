import type { ApiResponse } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const StatusCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  USER_EXIST: 1001,
  USER_PASSWORD_ERROR: 1002,
  USER_INFO_ERROR: 1003,
  USER_AVATAR_ERROR: 1004,
  USER_PASSWORD_CHANGE_ERROR: 1005,
  USER_DATA_EXPORT_ERROR: 1006,
  USER_DATA_DELETE_ERROR: 1007,
  PRIVACY_SETTINGS_ERROR: 1008,
  PERFORMANCE_NOT_EXIST: 2001,
  PERFORMANCE_NOT_ON_SALE: 2002,
  TICKET_NOT_EXIST: 3001,
  TICKET_STOCK_INSUFFICIENT: 3002,
  TICKET_SECKILL_FAILED: 3003,
  TICKET_LIMIT_EXCEEDED: 3004,
  ORDER_NOT_EXIST: 4001,
  ORDER_EXPIRED: 4002,
  ORDER_STATUS_ERROR: 4003,
  ORDER_DUPLICATE: 4004,
  PAYMENT_ERROR: 4005,
  RATE_LIMIT_EXCEEDED: 6001,
  SYSTEM_MAINTENANCE: 6002
};

export const StatusMessage = {
  [StatusCode.SUCCESS]: 'success',
  [StatusCode.BAD_REQUEST]: '请求参数错误',
  [StatusCode.UNAUTHORIZED]: '未认证(未登录或token过期)',
  [StatusCode.FORBIDDEN]: '权限不足',
  [StatusCode.NOT_FOUND]: '资源不存在',
  [StatusCode.INTERNAL_ERROR]: '服务器内部错误',
  [StatusCode.USER_EXIST]: '用户已存在',
  [StatusCode.USER_PASSWORD_ERROR]: '用户名或密码错误',
  [StatusCode.USER_INFO_ERROR]: '用户信息格式错误',
  [StatusCode.USER_AVATAR_ERROR]: '头像上传失败',
  [StatusCode.USER_PASSWORD_CHANGE_ERROR]: '密码修改失败',
  [StatusCode.USER_DATA_EXPORT_ERROR]: '数据导出失败',
  [StatusCode.USER_DATA_DELETE_ERROR]: '数据删除失败',
  [StatusCode.PRIVACY_SETTINGS_ERROR]: '隐私设置错误',
  [StatusCode.PERFORMANCE_NOT_EXIST]: '演出不存在',
  [StatusCode.PERFORMANCE_NOT_ON_SALE]: '演出未开售',
  [StatusCode.TICKET_NOT_EXIST]: '票种不存在',
  [StatusCode.TICKET_STOCK_INSUFFICIENT]: '库存不足',
  [StatusCode.TICKET_SECKILL_FAILED]: '抢票失败，请重试',
  [StatusCode.TICKET_LIMIT_EXCEEDED]: '每人限购5张票',
  [StatusCode.ORDER_NOT_EXIST]: '订单不存在',
  [StatusCode.ORDER_EXPIRED]: '订单已过期',
  [StatusCode.ORDER_STATUS_ERROR]: '订单状态错误',
  [StatusCode.ORDER_DUPLICATE]: '不能重复创建订单',
  [StatusCode.PAYMENT_ERROR]: '支付失败',
  [StatusCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后再试',
  [StatusCode.SYSTEM_MAINTENANCE]: '系统维护中，请稍后再试'
};

const createHeaders = (includeAuth = true): Headers => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  if (includeAuth) {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
};

const handleResponse = async <T>(response: Response, url?: string): Promise<ApiResponse<T>> => {
  if (response.status === 401) {
    const isLoginRequest = url?.includes('/auth/login') || url?.includes('/login');
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.startsWith('/admin');
    const isLoginPage = currentPath === '/admin/login';

    if (!isLoginRequest) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
    }

    if (isAdminPage && !isLoginPage && !isLoginRequest) {
      window.location.href = '/admin/login';
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = { code: 401, message: isLoginRequest ? '用户名或密码错误' : '登录已过期，请重新登录' };
    }

    return {
      code: 401,
      message: data?.message || (isLoginRequest ? '用户名或密码错误' : '登录已过期，请重新登录')
    } as ApiResponse<T>;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = { code: response.status, message: response.statusText };
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'API请求失败');
    (error as any).code = data?.code || response.status;
    throw error;
  }

  return data;
};

const apiRequest = {
  get: async <T>(url: string, params?: any, includeAuth = true): Promise<ApiResponse<T>> => {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: createHeaders(includeAuth),
      credentials: 'include'
    });

    return handleResponse<T>(response, fullUrl);
  },

  post: async <T>(url: string, data?: any, includeAuth = true): Promise<ApiResponse<T>> => {
    const options: RequestInit = {
      method: 'POST',
      credentials: 'include'
    };

    if (data instanceof FormData) {
      options.headers = new Headers();
      if (includeAuth) {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        if (token) {
          options.headers.append('Authorization', `Bearer ${token}`);
        }
      }
      options.body = data;
    } else {
      options.headers = createHeaders(includeAuth);
      options.body = data ? JSON.stringify(data) : undefined;
    }

    const requestUrl = `${API_BASE_URL}${url}`;
    const response = await fetch(requestUrl, options);

    return handleResponse<T>(response, requestUrl);
  },

  put: async <T>(url: string, data?: any, includeAuth = true): Promise<ApiResponse<T>> => {
    const requestUrl = `${API_BASE_URL}${url}`;
    const response = await fetch(requestUrl, {
      method: 'PUT',
      headers: createHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    return handleResponse<T>(response, requestUrl);
  },

  delete: async <T>(url: string, includeAuth = true): Promise<ApiResponse<T>> => {
    const requestUrl = `${API_BASE_URL}${url}`;
    const response = await fetch(requestUrl, {
      method: 'DELETE',
      headers: createHeaders(includeAuth),
      credentials: 'include'
    });

    return handleResponse<T>(response, requestUrl);
  }
};

const checkAuth = (): boolean => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  return !!token;
};

export type { ApiResponse };

export default {
  request: apiRequest,
  checkAuth,
  StatusCode,
  StatusMessage
};
