import type { ApiResponse, PaginationResult } from '@/types';

// API基础URL，根据实际后端地址修改
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 状态码定义
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
  SETTINGS_UPDATE_FAILED: 5001,
  DATA_EXPORT_FAILED: 5002,
  DATA_DELETE_FAILED: 5003,
  RATE_LIMIT_EXCEEDED: 6001,
  SYSTEM_MAINTENANCE: 6002
};

// 状态码对应的消息
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
  [StatusCode.SETTINGS_UPDATE_FAILED]: '设置更新失败',
  [StatusCode.DATA_EXPORT_FAILED]: '数据导出失败',
  [StatusCode.DATA_DELETE_FAILED]: '数据删除失败',
  [StatusCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后再试',
  [StatusCode.SYSTEM_MAINTENANCE]: '系统维护中，请稍后再试'
};

// 创建API请求头
const createHeaders = (includeAuth = true): Headers => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
  }
  
  return headers;
};

// 处理API响应
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = { code: response.status, message: response.statusText };
  }

  // 如果响应状态码不是200，抛出错误
  if (!response.ok) {
    const error = new Error(data?.message || 'API请求失败');
    (error as any).code = data?.code || response.status;
    throw error;
  }
  
  return data;
};

// API请求封装
const apiRequest = {
  get: async <T>(url: string, includeAuth = true): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: createHeaders(includeAuth),
      credentials: 'include'
    });
    
    return handleResponse<T>(response);
  },
  
  post: async <T>(url: string, data?: any, includeAuth = true): Promise<ApiResponse<T>> => {
    // 创建请求选项
    const options: RequestInit = {
      method: 'POST',
      credentials: 'include'
    };

    // 处理请求头
    if (data instanceof FormData) {
      // 对于FormData类型，不要设置Content-Type，让浏览器自动处理
      options.headers = new Headers();
      if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          options.headers.append('Authorization', `Bearer ${token}`);
        }
      }
      options.body = data;
    } else {
      // 对于其他类型，使用默认的JSON头和序列化
      options.headers = createHeaders(includeAuth);
      options.body = data ? JSON.stringify(data) : undefined;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    
    return handleResponse<T>(response);
  },
  
  put: async <T>(url: string, data?: any, includeAuth = true): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: createHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });
    
    return handleResponse<T>(response);
  },
  
  delete: async <T>(url: string, includeAuth = true): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: createHeaders(includeAuth),
      credentials: 'include'
    });
    
    return handleResponse<T>(response);
  }
};

// 检查用户是否登录
const checkAuth = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export type { ApiResponse };

export default {
  request: apiRequest,
  checkAuth,
  StatusCode,
  StatusMessage
};