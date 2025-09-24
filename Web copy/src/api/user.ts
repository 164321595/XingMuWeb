import api, { ApiResponse } from './index';
import { User } from '@/types';

export const userApi = {
  // 用户注册
  async register(userData: Partial<User>): Promise<ApiResponse<{ id: number; username: string; created_at: string }>> {
    return api.request.post<{ id: number; username: string; created_at: string }>('/auth/register', userData);
  },
  
  // 用户登录
  async login(username: string, password: string): Promise<ApiResponse<{ token: string; user: Omit<User, 'password'> }>> {
    return api.request.post<{ token: string; user: Omit<User, 'password'> }>('/auth/login', { username, password });
  },
  
  // 获取当前登录用户信息
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.request.get<User>('/users/current');
  },
  
  // 更新用户信息
  async updateUserInfo(data: Partial<User>): Promise<ApiResponse<{}>> {
    return api.request.put<{}>('/users/current', data);
  },
  
  // 退出登录
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // 修改密码
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{}>> {
    return api.request.post<{}>('/users/current/change-password', { currentPassword, newPassword });
  },
  
  // 获取用户隐私设置
  async getPrivacySettings(): Promise<ApiResponse<{
    dataCollection: boolean;
    personalizedAds: boolean;
    thirdPartySharing: boolean;
    marketingEmails: boolean;
  }>> {
    return api.request.get<{
      dataCollection: boolean;
      personalizedAds: boolean;
      thirdPartySharing: boolean;
      marketingEmails: boolean;
    }>('/users/current/privacy-settings');
  },
  
  // 更新用户隐私设置
  async updatePrivacySettings(settings: {
    dataCollection?: boolean;
    personalizedAds?: boolean;
    thirdPartySharing?: boolean;
    marketingEmails?: boolean;
  }): Promise<ApiResponse<{}>> {
    return api.request.put<{}>('/users/current/privacy-settings', settings);
  },
  
  // 导出用户数据
  async exportUserData(): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    return api.request.post<{
      downloadUrl: string;
      expiresAt: string;
    }>('/users/current/export-data');
  },
  
  // 删除用户数据
  async deleteUserData(confirmPassword: string): Promise<ApiResponse<{}>> {
    return api.request.post<{}>('/users/current/delete-data', { confirmPassword });
  },

  // 上传头像
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.request.post<{ avatar: string }>('/users/current/avatar', formData);
  }
};