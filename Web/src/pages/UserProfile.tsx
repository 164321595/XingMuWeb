import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/api/user';
import { User } from '@/types';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { z } from 'zod';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';
import ImageCropper from '@/components/common/ImageCropper';
import { DEFAULT_AVATAR, getImagePath } from '@/utils/imageAssets';

// 表单验证schema
const profileSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional(),
  email: z.string().email('请输入有效的邮箱地址').optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({ username: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  
  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const res = await userApi.getCurrentUser();
      
      if (res.code === 200) {
        setUser(res.data);
        setFormData({
          username: res.data.username,
          phone: res.data.phone || undefined,
          email: res.data.email || undefined
        });
        
        // 从localStorage获取保存的头像
        const savedAvatar = localStorage.getItem(`avatar_${res.data.id}`);
        setAvatarUrl(savedAvatar || res.data.avatar || DEFAULT_AVATAR);
      } else {
        toast.error(res.message || '获取用户信息失败');
        logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
      toast.error('获取用户信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // 检查是否登录
    if (!isAuthenticated) return;
    
    fetchUserInfo();
  }, [isAuthenticated, logout, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误信息
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    try {
      profileSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof ProfileFormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }
    
    try {
      setSaveLoading(true);
      const res = await userApi.updateUserInfo(formData);
      
      if (res.code === 200) {
        toast.success('个人信息更新成功');
        fetchUserInfo(); // 重新获取用户信息
      } else {
        toast.error(res.message || '更新个人信息失败，请重试');
      }
    } catch (error) {
      console.error('更新个人信息失败', error);
      toast.error('更新个人信息过程中出现错误，请重试');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  
  // 处理头像点击事件，触发文件选择
  const handleAvatarClick = () => {
    document.getElementById('avatar-upload')?.click();
  };
  
  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型和大小
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }
    
    // 打开裁剪窗口
    setSelectedImage(file);
    setIsCropperOpen(true);
    
    // 重置文件输入
    if (e.target) {
      e.target.value = '';
    }
  };

  // 处理裁剪完成
  const handleCropComplete = async (croppedImage: File) => {
    try {
      setUploading(true);
      
      // 调用API上传头像到后端
      const response = await userApi.uploadAvatar(croppedImage);
      if (response.code === 200) {
        const newAvatarUrl = response.data.avatar;
        setAvatarUrl(newAvatarUrl);
        
        // 保存到localStorage
        if (user) {
          localStorage.setItem(`avatar_${user.id}`, newAvatarUrl);
          
          // 更新用户信息中的头像
          const updatedUser = { ...user, avatar: newAvatarUrl };
          setUser(updatedUser);
          
          // 更新localStorage中的用户信息
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userObj.avatar = newAvatarUrl;
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        }
        
        toast.success('头像更新成功');
        // 头像更新成功后刷新页面，确保导航栏头像及时更新
        window.location.reload();
      } else {
        toast.error(response.message || '上传头像失败');
      }
    } catch (error) {
      console.error('上传头像失败', error);
      toast.error('上传头像失败，请重试');
    } finally {
      setUploading(false);
      setIsCropperOpen(false);
    }
  };
  
  if (!isAuthenticated) {
    return null; // 未登录时不渲染页面，会被重定向到登录页
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="large" text="加载个人信息中..." />
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">个人中心</h1>
            <p className="text-gray-600 dark:text-gray-300">管理您的个人信息</p>
          </div>
          
          {/* 用户头像 */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                <img 
                  src={getImagePath(avatarUrl)}
                  alt={user?.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 图片加载失败时使用默认头像
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <button 
                onClick={handleAvatarClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 shadow-md hover:bg-red-700 transition-colors"
              >
                {uploading ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-camera"></i>
                )}
              </button>
            </div>
          </div>
          
          {/* 隐藏的文件上传输入 */}
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">个人信息</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* 用户名 */}
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    用户名
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.username 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      disabled={saveLoading}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                  )}
                </div>
                
                {/* 手机号 */}
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-phone text-gray-400"></i>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      placeholder="请输入手机号"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      disabled={saveLoading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>
                
                {/* 邮箱 */}
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-envelope text-gray-400"></i>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="请输入邮箱"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      disabled={saveLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                
                {/* 保存按钮 */}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>保存中...
                    </>
                  ) : (
                    '保存修改'
                  )}
                </button>
              </form>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">账户管理</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/account/settings')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <i className="fa-solid fa-cog text-gray-500 dark:text-gray-400 mr-3"></i>
                    <span>账户设置</span>
                  </div>
                  <i className="fa-solid fa-angle-right text-gray-400"></i>
                </button>
                
                <button
                  onClick={() => navigate('/account/settings?tab=password')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <i className="fa-solid fa-lock text-gray-500 dark:text-gray-400 mr-3"></i>
                    <span>修改密码</span>
                  </div>
                  <i className="fa-solid fa-angle-right text-gray-400"></i>
                </button>
              </div>
            </div>
           </div>
          </div>
          
          {/* 退出登录按钮 */}
          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-sign-out-alt mr-1"></i>退出登录
            </button>
          </div>

          {/* 退出登录确认模态框 */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">确认退出登录</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">确定要退出登录吗？</p>
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={cancelLogout}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={confirmLogout}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      确认
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 图片裁剪组件 */}
          <ImageCropper
            isOpen={isCropperOpen}
            onClose={() => setIsCropperOpen(false)}
            imageFile={selectedImage}
            onCrop={handleCropComplete}
            aspectRatio={1}
            size="large"
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}