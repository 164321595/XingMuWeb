import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/api/user';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { z } from 'zod';
import Modal from '@/components/common/Modal';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';

// 密码修改表单验证schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, '密码至少6个字符'),
  newPassword: z.string()
    .min(6, '新密码至少6个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, '新密码需包含大小写字母和数字'),
  confirmPassword: z.string()
});

// 密码修改表单类型
type PasswordFormData = z.infer<typeof passwordSchema> & {
  confirmPassword: string;
};

// 通知设置类型
type NotificationSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
};

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    personalizedAds: true,
    thirdPartySharing: false,
    marketingEmails: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataAction, setDataAction] = useState<'export' | 'delete' | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [activeTab, setActiveTab] = useState('password');
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查是否登录
    if (!isAuthenticated) {
      toast.info('请先登录');
      navigate('/login', { state: { from: '/account/settings' } });
      return;
    }
    
    // 从本地存储加载通知设置
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setNotificationSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse notification settings', error);
      }
    }
    
    // 加载隐私设置
    const fetchPrivacySettings = async () => {
      try {
        setLoading(true);
        const res = await userApi.getPrivacySettings();
        if (res.code === 200) {
          setPrivacySettings(res.data);
        } else {
          console.error('Failed to fetch privacy settings:', res.message);
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrivacySettings();
  }, [isAuthenticated, navigate]);

  // 处理密码表单变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段错误
    if (errors[name as keyof PasswordFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // 处理通知设置变化
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // 保存通知设置
  const saveNotificationSettings = async () => {
    try {
      setSaveLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟10%的失败率
      if (Math.random() < 0.1) {
        throw new Error('设置保存失败');
      }
      
      localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
      toast.success('通知设置已更新');
    } catch (error) {
      toast.error('保存设置失败，请重试');
      console.error('Failed to save notification settings:', error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  // 处理隐私设置变更
  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // 保存隐私设置
  const savePrivacySettings = async () => {
    try {
      setSaveLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 调用用户API更新隐私设置
      const res = await userApi.updatePrivacySettings(privacySettings);
      
      if (res.code === 200) {
        toast.success('隐私设置已更新');
      } else {
        toast.error(res.message || '保存隐私设置失败');
      }
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      toast.error('保存隐私设置失败，请重试');
    } finally {
      setSaveLoading(false);
    }
  };
  
  // 处理数据导出
  const handleExportData = async () => {
    try {
      setDataLoading(true);
      setDataAction('export');
      
      const res = await userApi.exportUserData();
      if (res.code === 200) {
        toast.success('数据导出成功，请点击下载');
        // 模拟下载链接点击
        setTimeout(() => {
          toast.info('下载链接已发送至您的邮箱');
        }, 1000);
      } else {
        toast.error(res.message || '数据导出失败');
      }
    } catch (error) {
      console.error('Data export failed:', error);
      toast.error('数据导出失败，请重试');
    } finally {
      setDataLoading(false);
      setDataAction(null);
    }
  };
  
  // 处理数据删除确认
  const handleConfirmDelete = async () => {
    if (!confirmPassword) {
      toast.error('请输入密码确认');
      return;
    }
    
    try {
      setDataLoading(true);
      setDataAction('delete');
      
      const res = await userApi.deleteUserData(confirmPassword);
      if (res.code === 200) {
        toast.success('数据删除请求已提交');
        setShowDeleteConfirm(false);
        setConfirmPassword('');
        
        // 模拟2秒后跳转至登录页
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        toast.error(res.message || '数据删除失败');
      }
    } catch (error) {
      console.error('Data deletion failed:', error);
      toast.error('数据删除失败，请重试');
    } finally {
      setDataLoading(false);
      setDataAction(null);
    }
  };

  // 验证密码表单
  const validatePasswordForm = (): boolean => {
    try {
      passwordSchema.parse(passwordForm);
      
      // 检查新密码是否与确认密码一致
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setErrors({ confirmPassword: '两次输入的密码不一致' });
        return false;
      }
      
      // 检查新密码是否与当前密码相同
      if (passwordForm.currentPassword === passwordForm.newPassword) {
        setErrors({ newPassword: '新密码不能与当前密码相同' });
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof PasswordFormData, string>> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof PasswordFormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  // 提交密码修改
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // 验证当前密码
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast.error('用户信息不存在');
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // 这里应该调用API验证当前密码并更新密码
      // 简化实现：直接更新本地存储中的密码
      if (user.password !== userApi.encryptPassword(passwordForm.currentPassword)) {
        setErrors({ currentPassword: '当前密码不正确' });
        return;
      }
      
      // 更新密码
      const updatedUser = {
        ...user,
        password: userApi.encryptPassword(passwordForm.newPassword)
      };
      
      // 更新本地存储
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 更新用户数据
      await userApi.updateUserInfo({ password: updatedUser.password });
      
      toast.success('密码修改成功，请重新登录');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('修改密码失败', error);
      toast.error('修改密码失败，请重试');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="large" text="加载中..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">账户设置</h1>
            <p className="text-gray-600 dark:text-gray-300">管理您的账户安全和偏好设置</p>
          </div>
          
          {/* 选项卡 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-lock mr-2"></i>密码修改
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-bell mr-2"></i>通知设置
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'privacy'
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-shield mr-2"></i>隐私设置
              </button>
            </div>
            
            {/* 密码修改表单 */}
            {activeTab === 'password' && (
              <div className="p-6">
                <form onSubmit={handlePasswordSubmit}>
                  {/* 当前密码 */}
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      当前密码
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-key text-gray-400"></i>
                      </div>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.currentPassword
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                        } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                        disabled={saveLoading}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                    )}
                  </div>
                  
                  {/* 新密码 */}
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      新密码
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-lock-open text-gray-400"></i>
                      </div>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.newPassword
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                        } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                        disabled={saveLoading}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      密码至少6位，需包含大小写字母和数字
                    </p>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                    )}
                  </div>
                  
                  {/* 确认新密码 */}
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      确认新密码
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-lock-open text-gray-400"></i>
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                        } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                        disabled={saveLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
                      </>
                    ) : (
                      '确认修改'
                    )}
                  </button>
                </form>
              </div>
            )}
            
            {/* 通知设置 */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">邮件通知</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">接收账户相关的邮件通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">短信通知</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">接收订单和支付相关的短信通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="smsNotifications"
                        checked={notificationSettings.smsNotifications}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">推送通知</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">接收演出和活动的推送通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={notificationSettings.pushNotifications}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={saveNotificationSettings}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    保存设置
                  </button>
                </div>
              </div>
            )}
            
            {/* 隐私设置 */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">账户安全</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      您的账户信息已加密存储，我们重视您的隐私安全
                    </p>
                    <button
                      onClick={() => {
                        navigate('/account/settings', { state: { activeTab: 'password' } });
                        setActiveTab('password');
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <i className="fa-solid fa-lock mr-1"></i>修改密码
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">隐私设置</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">数据收集</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">允许收集您的使用数据以改进服务</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="dataCollection"
                            checked={privacySettings.dataCollection}
                            onChange={handlePrivacyChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">个性化广告</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">根据您的兴趣展示个性化广告</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="personalizedAds"
                            checked={privacySettings.personalizedAds}
                            onChange={handlePrivacyChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">第三方共享</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">与第三方共享您的匿名数据</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="thirdPartySharing"
                            checked={privacySettings.thirdPartySharing}
                            onChange={handlePrivacyChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={savePrivacySettings}
                      disabled={saveLoading}
                      className="mt-4 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      {saveLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin mr-2"></i>保存中...
                        </>
                      ) : (
                        '保存隐私设置'
                      )}
                    </button>
                  </div>
                  
                   <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">数据管理</h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                       您可以导出或删除您的个人数据
                     </p>
                     <div className="flex space-x-3">
                       <button
                         onClick={handleExportData}
                         disabled={dataLoading}
                         className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                         {dataLoading && dataAction === 'export' ? (
                           <><i className="fa-solid fa-spinner fa-spin mr-1"></i>导出中...</>
                         ) : (
                           <><i className="fa-solid fa-download mr-1"></i>导出数据</>
                         )}
                       </button>
                       <button
                         onClick={() => setShowDeleteConfirm(true)}
                         disabled={dataLoading}
                         className="px-3 py-1 text-xs border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                       >
                         {dataLoading && dataAction === 'delete' ? (
                           <><i className="fa-solid fa-spinner fa-spin mr-1"></i>处理中...</>
                         ) : (
                           <><i className="fa-solid fa-trash mr-1"></i>删除数据</>
                         )}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
           </div>
           
           {/* 删除数据确认模态框 */}
           <Modal
             isOpen={showDeleteConfirm}
             onClose={() => setShowDeleteConfirm(false)}
             title="确认删除数据"
             footer={
               <>
                 <button
                   onClick={() => setShowDeleteConfirm(false)}
                   className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                   disabled={dataLoading}
                 >
                   取消
                 </button>
                 
                 <button
                   onClick={handleConfirmDelete}
                   className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                   disabled={dataLoading}
                 >
                   {dataLoading ? (
                     <>
                       <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
                     </>
                     ) : (
                     '确认删除'
                   )}
                 </button>
               </>
             }
           >
             <div className="text-center py-4">
               <div className="text-red-500 text-4xl mb-4">
                 <i className="fa-solid fa-exclamation-triangle"></i>
               </div>
               <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">确定要删除您的所有个人数据吗？</h4>
               <p className="text-gray-500 dark:text-gray-400 mb-4">
                 此操作不可恢复，删除后您的所有个人信息、订单历史和偏好设置将被永久清除。
               </p>
               <div className="mt-6">
                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   请输入密码确认
                 </label>
                 <input
                   type="password"
                   id="confirmPassword"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                   placeholder="输入密码"
                   disabled={dataLoading}
                 />
               </div>
             </div>
           </Modal>
           
           {/* 返回按钮 */}
           <div className="text-center">
             <button
               onClick={() => navigate('/user/profile')}
               className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium"
             >
               <i className="fa-solid fa-arrow-left mr-1"></i>返回个人中心
             </button>
           </div>
         </div>
       </main>
       
       <Footer />
     </div>
   );
 }