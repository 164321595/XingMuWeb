import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, RefreshCw, Download, Filter } from 'lucide-react';
import { adminOrderApi } from '@/api/admin';

interface Order {
  id: number;
  order_no: string;
  user_id: number;
  performance_id: number;
  ticket_type_id: number;
  quantity: number;
  amount: number;
  status: number;
  expire_time: string;
  payment_time?: string;
  created_at: string;
  performance?: {
    title: string;
    performer: string;
    venue: string;
  };
  ticket_type?: {
    name: string;
    price: number;
  };
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待支付', color: 'bg-yellow-100 text-yellow-700' },
  1: { label: '已支付', color: 'bg-green-100 text-green-700' },
  2: { label: '已取消/已退款', color: 'bg-gray-100 text-gray-600' },
};

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  }, [filterStatus, searchKeyword]);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminOrderApi.getOrderList({
        page: pagination.page,
        size: pagination.size * 10,
      });
      if (res.code === 200) {
        let list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        const total = res.data?.total || (Array.isArray(res.data) ? res.data.length : 0);

        if (filterStatus !== null) {
          list = list.filter((order: Order) => order.status === filterStatus);
        }

        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          list = (list as Order[]).filter((order: Order) =>
            order.order_no.toLowerCase().includes(keyword) ||
            String(order.user_id).includes(keyword) ||
            String(order.performance_id).includes(keyword) ||
            String(order.quantity).includes(keyword) ||
            String(order.amount).includes(keyword) ||
            order.created_at.toLowerCase().includes(keyword) ||
            (order.expire_time && order.expire_time.toLowerCase().includes(keyword)) ||
            (order.payment_time && order.payment_time.toLowerCase().includes(keyword)) ||
            (order.performance?.title.toLowerCase().includes(keyword) ?? false) ||
            (order.ticket_type?.name.toLowerCase().includes(keyword) ?? false)
          );
        }

        const start = (pagination.page - 1) * pagination.size;
        const paginatedList = list.slice(start, start + pagination.size);

        setOrders(paginatedList);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (err) {
      console.error('获取订单列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm('确定要退款这个订单吗？')) return;
    try {
      const res = await adminOrderApi.processRefund(id);
      if (res.code === 200) {
        fetchOrders();
      } else {
        alert(res.message || '退款失败');
      }
    } catch (err: any) {
      alert(err.message || '退款失败');
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminOrderApi.exportOrders({
        status: filterStatus ?? undefined,
      });
      if (res.code === 200) {
        const csvContent = [
          ['订单号', '用户名', '演出', '票种', '数量', '金额', '状态', '创建时间'].join(','),
          ...res.data.map((order: Order) =>
            [
              order.order_no,
              order.user_id,
              order.performance?.title || '',
              order.ticket_type?.name || '',
              order.quantity,
              order.amount,
              statusMap[order.status]?.label || '',
              order.created_at,
            ].join(',')
          ),
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
      }
    } catch (err) {
      console.error('导出失败:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-5 h-5 mr-2" />
          导出订单
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号、演出名称..."
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

          <button
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            刷新
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无订单数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">演出信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">票种信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下单时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.order_no}</div>
                    <div className="text-xs text-gray-500">用户ID: {order.user_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{order.performance?.title || '-'}</div>
                    <div className="text-xs text-gray-500">{order.performance?.venue}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{order.ticket_type?.name}</div>
                    <div className="text-xs text-gray-500">
                      {order.quantity}张 × {formatCurrency(order.ticket_type?.price || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-red-600">
                      {formatCurrency(order.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusMap[order.status]?.color}`}>
                      {statusMap[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="查看详情"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.status === 1 && (
                        <button
                          onClick={() => handleRefund(order.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="退款"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                      )}
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

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">订单详情</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">订单号</div>
                  <div className="text-gray-900 font-mono text-sm">{selectedOrder.order_no}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">用户ID</div>
                  <div className="text-gray-900">{selectedOrder.user_id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">演出</div>
                  <div className="text-gray-900">{selectedOrder.performance?.title || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">票种</div>
                  <div className="text-gray-900">{selectedOrder.ticket_type?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">数量</div>
                  <div className="text-gray-900">{selectedOrder.quantity}张</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">金额</div>
                  <div className="text-red-600 font-semibold">¥{selectedOrder.amount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">状态</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusMap[selectedOrder.status]?.color}`}>
                    {statusMap[selectedOrder.status]?.label}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">下单时间</div>
                  <div className="text-gray-900">{formatDate(selectedOrder.created_at)}</div>
                </div>
                {selectedOrder.payment_time && (
                  <div>
                    <div className="text-sm text-gray-500">支付时间</div>
                    <div className="text-gray-900">{formatDate(selectedOrder.payment_time)}</div>
                  </div>
                )}
                {selectedOrder.expire_time && (
                  <div>
                    <div className="text-sm text-gray-500">过期时间</div>
                    <div className="text-gray-900">{formatDate(selectedOrder.expire_time)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
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
