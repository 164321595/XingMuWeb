import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Ban, Trash2, RefreshCw } from 'lucide-react';
import { adminUserApi } from '@/api/admin';

interface User {
  id: number;
  username: string;
  phone: string;
  email: string;
  avatar: string;
  status: number;
  created_at: string;
}

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: '正常', color: 'bg-green-100 text-green-700' },
  0: { label: '禁用', color: 'bg-red-100 text-red-700' },
};

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  }, [filterStatus, searchKeyword]);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.getUserList({
        page: pagination.page,
        size: pagination.size * 10,
      });
      if (res.code === 200) {
        let list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        const total = res.data?.total || (Array.isArray(res.data) ? res.data.length : 0);

        if (filterStatus !== null) {
          list = list.filter((user: User) => user.status === filterStatus);
        }

        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          list = (list as User[]).filter((user: User) =>
            user.username.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword) ||
            user.phone.includes(keyword) ||
            String(user.id).includes(keyword) ||
            user.created_at.toLowerCase().includes(keyword)
          );
        }

        const start = (pagination.page - 1) * pagination.size;
        const paginatedList = list.slice(start, start + pagination.size);

        setUsers(paginatedList);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (err) {
      console.error('获取用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? '启用' : '禁用';

    if (!confirm(`确定要${action}这个用户吗？`)) return;

    try {
      const res = await adminUserApi.updateUserStatus(id, newStatus);
      if (res.code === 200) {
        fetchUsers();
      } else {
        alert(res.message || '操作失败');
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复！')) return;

    try {
      const res = await adminUserApi.deleteUser(id);
      if (res.code === 200) {
        fetchUsers();
      } else {
        alert(res.message || '删除失败');
      }
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
        <button
          onClick={fetchUsers}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          刷新
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名、手机号、邮箱..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <select
            value={filterStatus ?? ''}
            onChange={(e) => {
              setFilterStatus(e.target.value ? Number(e.target.value) : null);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          >
            <option value="">全部状态</option>
            {Object.entries(statusMap).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无用户数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={user.avatar || '/uploads/avatars/default.png'}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/40/40';
                        }}
                      />
                      <div className="font-medium text-gray-900">{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusMap[user.status]?.color}`}>
                      {statusMap[user.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="查看详情"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`p-2 rounded-lg transition ${
                          user.status === 1
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={user.status === 1 ? '禁用' : '启用'}
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="删除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.total > pagination.size && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="text-gray-600">
            第 {pagination.page} / {Math.ceil(pagination.total / pagination.size)} 页
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">用户详情</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src={selectedUser.avatar || '/uploads/avatars/default.png'}
                  alt={selectedUser.username}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-medium text-gray-900">{selectedUser.username}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusMap[selectedUser.status]?.color}`}>
                    {statusMap[selectedUser.status]?.label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">手机号</div>
                  <div className="text-gray-900">{selectedUser.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">邮箱</div>
                  <div className="text-gray-900">{selectedUser.email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">用户ID</div>
                  <div className="text-gray-900">{selectedUser.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">注册时间</div>
                  <div className="text-gray-900">{formatDate(selectedUser.created_at)}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
