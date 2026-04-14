import { useState, useEffect } from 'react';
import { Plus, Edit, Ban, RefreshCw, Eye } from 'lucide-react';
import { adminApi } from '@/api/admin';

interface Admin {
  id: number;
  username: string;
  real_name: string;
  email: string;
  phone: string;
  role: string;
  status: number;
  last_login_at?: string;
  created_at: string;
}

const roleMap: Record<string, { label: string; color: string }> = {
  super_admin: { label: '超级管理员', color: 'bg-red-100 text-red-700' },
  admin: { label: '管理员', color: 'bg-orange-100 text-orange-700' },
  content_admin: { label: '内容管理员', color: 'bg-blue-100 text-blue-700' },
  ticket_admin: { label: '票务管理员', color: 'bg-green-100 text-green-700' },
};

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: '正常', color: 'bg-green-100 text-green-700' },
  0: { label: '禁用', color: 'bg-red-100 text-red-700' },
};

export default function AdminList() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    real_name: '',
    email: '',
    phone: '',
    role: 'admin',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAdminList({ page: 1, size: 100 });
      if (res.code === 200) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        setAdmins(list);
      }
    } catch (err) {
      console.error('获取管理员列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.real_name || (!formData.password && !editingId)) {
      alert('请填写完整信息');
      return;
    }

    try {
      if (editingId) {
        const updateData = { ...formData };
        delete updateData.password;
        delete updateData.username;
        const res = await adminApi.updateAdmin(editingId, updateData);
        if (res.code === 200) {
          setShowForm(false);
          setEditingId(null);
          resetForm();
          fetchAdmins();
        } else {
          alert(res.message || '更新失败');
        }
      } else {
        const res = await adminApi.register(formData);
        if (res.code === 200) {
          setShowForm(false);
          resetForm();
          fetchAdmins();
        } else {
          alert(res.message || '创建失败');
        }
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingId(admin.id);
    setFormData({
      username: admin.username,
      password: '',
      real_name: admin.real_name,
      email: admin.email || '',
      phone: admin.phone || '',
      role: admin.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要禁用这个管理员吗？')) return;

    try {
      const res = await adminApi.updateAdmin(id, { status: 0 });
      if (res.code === 200) {
        fetchAdmins();
      } else {
        alert(res.message || '删除失败');
      }
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      real_name: '',
      email: '',
      phone: '',
      role: 'admin',
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">管理员管理</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchAdmins}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            刷新
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            添加管理员
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? '编辑管理员' : '添加管理员'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingId}
                placeholder={editingId ? '不可修改' : '请输入用户名'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 {editingId && '(留空则不修改)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingId ? '留空不修改' : '请输入密码'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
              <input
                type="text"
                value={formData.real_name}
                onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                placeholder="请输入真实姓名"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="admin">管理员</option>
                <option value="content_admin">内容管理员</option>
                <option value="ticket_admin">票务管理员</option>
                <option value="super_admin">超级管理员</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              保存
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无管理员数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理员信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后登录</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium mr-3">
                        {admin.real_name?.[0] || admin.username?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{admin.real_name}</div>
                        <div className="text-sm text-gray-500">@{admin.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${roleMap[admin.role]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {roleMap[admin.role]?.label || admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusMap[admin.status]?.color}`}>
                      {statusMap[admin.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(admin.last_login_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(admin.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="编辑"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="禁用"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
