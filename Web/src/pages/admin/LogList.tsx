import { useState, useEffect } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { adminApi } from '@/api/admin';

interface Log {
  id: number;
  admin_id: number;
  action: string;
  target_type: string;
  target_id: number;
  detail: string;
  ip: string;
  created_at: string;
}

const actionMap: Record<string, { label: string; color: string }> = {
  login: { label: '登录', color: 'bg-blue-100 text-blue-700' },
  logout: { label: '退出', color: 'bg-gray-100 text-gray-700' },
  order_create: { label: '创建订单', color: 'bg-green-100 text-green-700' },
  order_paid: { label: '订单支付', color: 'bg-green-100 text-green-700' },
  order_cancelled: { label: '订单取消', color: 'bg-orange-100 text-orange-700' },
  order_refund: { label: '订单退款', color: 'bg-red-100 text-red-700' },
  create_performance: { label: '创建演出', color: 'bg-purple-100 text-purple-700' },
  update_performance: { label: '更新演出', color: 'bg-purple-100 text-purple-700' },
  delete_performance: { label: '删除演出', color: 'bg-red-100 text-red-700' },
  create_ticket_type: { label: '创建票种', color: 'bg-cyan-100 text-cyan-700' },
  update_ticket_type: { label: '更新票种', color: 'bg-cyan-100 text-cyan-700' },
  delete_ticket_type: { label: '删除票种', color: 'bg-red-100 text-red-700' },
  update_user_status: { label: '更新用户状态', color: 'bg-yellow-100 text-yellow-700' },
  delete_user: { label: '删除用户', color: 'bg-red-100 text-red-700' },
  update_admin: { label: '更新管理员', color: 'bg-indigo-100 text-indigo-700' },
  update_system_config: { label: '更新系统配置', color: 'bg-pink-100 text-pink-700' },
};

export default function LogList() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0 });

  useEffect(() => {
    fetchLogs();
  }, [filterAction, searchKeyword]);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAdminLogs({
        page: pagination.page,
        size: pagination.size * 10,
      });
      if (res.code === 200) {
        let list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        const total = res.data?.total || (Array.isArray(res.data) ? res.data.length : 0);

        if (filterAction) {
          list = list.filter((log: Log) => log.action === filterAction);
        }

        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          list = (list as Log[]).filter((log: Log) =>
            log.action.toLowerCase().includes(keyword) ||
            log.detail.toLowerCase().includes(keyword) ||
            String(log.target_id).includes(keyword) ||
            String(log.admin_id).includes(keyword) ||
            (log.target_type && log.target_type.toLowerCase().includes(keyword)) ||
            (log.ip && log.ip.toLowerCase().includes(keyword)) ||
            log.created_at.toLowerCase().includes(keyword)
          );
        }

        const start = (pagination.page - 1) * pagination.size;
        const paginatedList = list.slice(start, start + pagination.size);

        setLogs(paginatedList);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (err) {
      console.error('获取日志列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const parseDetail = (detail: string) => {
    try {
      const parsed = JSON.parse(detail);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return detail;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">操作日志</h1>
        <button
          onClick={fetchLogs}
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
                placeholder="搜索操作详情..."
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
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          >
            <option value="">全部操作</option>
            {Object.entries(actionMap).map(([value, { label }]) => (
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
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无日志数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作对象</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作详情</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP地址</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${actionMap[log.action]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {actionMap[log.action]?.label || log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.target_type || '-'}
                      {log.target_id && ` #${log.target_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate" title={parseDetail(log.detail)}>
                      {parseDetail(log.detail)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.ip || '-'}</td>
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
    </div>
  );
}
