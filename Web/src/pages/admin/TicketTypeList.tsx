import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw, Eye } from 'lucide-react';
import { adminTicketTypeApi, adminPerformanceApi } from '@/api/admin';

interface TicketType {
  id: number;
  performance_id: number;
  name: string;
  price: number;
  stock: number;
  sale_start_time: string;
  sale_end_time: string;
  status: number;
}

interface Performance {
  id: number;
  title: string;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未开售', color: 'bg-gray-100 text-gray-600' },
  1: { label: '在售中', color: 'bg-green-100 text-green-600' },
  2: { label: '已售罄', color: 'bg-red-100 text-red-600' },
  3: { label: '已结束', color: 'bg-gray-100 text-gray-400' },
};

const getDynamicStatus = (ticket: TicketType): { status: number; label: string; color: string } => {
  const now = new Date();
  const saleStart = ticket.sale_start_time ? new Date(ticket.sale_start_time) : null;
  const saleEnd = ticket.sale_end_time ? new Date(ticket.sale_end_time) : null;

  if (!saleStart || !saleEnd) {
    return { status: 0, label: '未设置', color: 'bg-gray-100 text-gray-600' };
  }

  if (now < saleStart) {
    return { status: 0, label: '未开售', color: 'bg-gray-100 text-gray-600' };
  }

  if (now >= saleStart && now <= saleEnd) {
    if (ticket.stock <= 0) {
      return { status: 2, label: '已售罄', color: 'bg-red-100 text-red-600' };
    }
    return { status: 1, label: '在售中', color: 'bg-green-100 text-green-600' };
  }

  if (now > saleEnd) {
    return { status: 3, label: '已结束', color: 'bg-gray-100 text-gray-400' };
  }

  return { status: 0, label: '未知', color: 'bg-gray-100 text-gray-600' };
};

export default function TicketTypeList() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerformance, setSelectedPerformance] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    performance_id: 0,
    name: '',
    price: 0,
    stock: 0,
    sale_start_time: '',
    sale_end_time: '',
    status: 0,
  });

  useEffect(() => {
    fetchPerformances();
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (selectedPerformance) {
      fetchTicketTypes();
    } else {
      fetchAllTicketTypes();
    }
  }, [selectedPerformance, filterStatus, searchKeyword]);

  useEffect(() => {
    if (selectedPerformance) {
      fetchTicketTypes();
    } else {
      fetchAllTicketTypes();
    }
  }, [pagination.page]);

  const fetchPerformances = async () => {
    try {
      const res = await adminPerformanceApi.getPerformanceList({ page: 1, size: 100 });
      if (res.code === 200) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        setPerformances(list);
      }
    } catch (err) {
      console.error('获取演出列表失败:', err);
    }
  };

  const applyFilters = (list: TicketType[]) => {
    let filtered = [...list];

    if (filterStatus !== null) {
      filtered = filtered.filter((ticket) => {
        const dynamic = getDynamicStatus(ticket);
        return dynamic.status === filterStatus;
      });
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((ticket) => {
        const perf = performances.find((p) => p.id === ticket.performance_id);
        return (
          ticket.name.toLowerCase().includes(keyword) ||
          String(ticket.id).includes(keyword) ||
          String(ticket.performance_id).includes(keyword) ||
          String(ticket.price).includes(keyword) ||
          String(ticket.stock).includes(keyword) ||
          ticket.sale_start_time.toLowerCase().includes(keyword) ||
          ticket.sale_end_time.toLowerCase().includes(keyword) ||
          (perf?.title.toLowerCase().includes(keyword) ?? false)
        );
      });
    }

    return filtered;
  };

  const fetchTicketTypes = async () => {
    setLoading(true);
    try {
      const res = await adminTicketTypeApi.getTicketTypeList({
        page: 1,
        size: 1000,
      });
      if (res.code === 200) {
        let list = Array.isArray(res.data) ? res.data : (res.data?.list || []);

        if (selectedPerformance !== null) {
          list = list.filter((ticket: TicketType) => ticket.performance_id === selectedPerformance);
        }

        list = applyFilters(list);
        const start = (pagination.page - 1) * pagination.size;
        const paginatedList = list.slice(start, start + pagination.size);
        setTicketTypes(paginatedList);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (err) {
      console.error('获取票种列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTicketTypes = async () => {
    setLoading(true);
    try {
      const res = await adminTicketTypeApi.getTicketTypeList({
        page: 1,
        size: 1000,
      });
      if (res.code === 200) {
        let list = Array.isArray(res.data) ? res.data : (res.data?.list || []);

        if (selectedPerformance !== null) {
          list = list.filter((ticket: TicketType) => ticket.performance_id === selectedPerformance);
        }

        list = applyFilters(list);
        const start = (pagination.page - 1) * pagination.size;
        const paginatedList = list.slice(start, start + pagination.size);
        setTicketTypes(paginatedList);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (err) {
      console.error('获取票种列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.performance_id || !formData.name || !formData.price || !formData.stock) {
      alert('请填写完整信息');
      return;
    }

    try {
      const res = editingId
        ? await adminTicketTypeApi.updateTicketType(editingId, formData)
        : await adminTicketTypeApi.createTicketType(formData);

      if (res.code === 200) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        selectedPerformance ? fetchTicketTypes() : fetchAllTicketTypes();
      } else {
        alert(res.message || '操作失败');
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleEdit = (ticket: TicketType) => {
    setEditingId(ticket.id);
    setFormData({
      performance_id: ticket.performance_id,
      name: ticket.name,
      price: ticket.price,
      stock: ticket.stock,
      sale_start_time: ticket.sale_start_time.slice(0, 16),
      sale_end_time: ticket.sale_end_time.slice(0, 16),
      status: ticket.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个票种吗？')) return;

    try {
      const res = await adminTicketTypeApi.deleteTicketType(id);
      if (res.code === 200) {
        selectedPerformance ? fetchTicketTypes() : fetchAllTicketTypes();
      } else {
        alert(res.message || '删除失败');
      }
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      performance_id: selectedPerformance || 0,
      name: '',
      price: 0,
      stock: 0,
      sale_start_time: '',
      sale_end_time: '',
      status: 0,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">票种管理</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加票种
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索票种名称、演出、价格..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="min-w-[150px]">
            <select
              value={selectedPerformance ?? ''}
              onChange={(e) => {
                setSelectedPerformance(e.target.value ? Number(e.target.value) : null);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="">全部演出</option>
              {performances.map((perf) => (
                <option key={perf.id} value={perf.id}>
                  {perf.title}
                </option>
              ))}
            </select>
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
            <option value="0">未开售</option>
            <option value="1">在售中</option>
            <option value="2">已售罄</option>
            <option value="3">已结束</option>
          </select>

          <button
            onClick={() => selectedPerformance ? fetchTicketTypes() : fetchAllTicketTypes()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            刷新
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? '编辑票种' : '添加票种'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!selectedPerformance && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">演出</label>
                <select
                  value={formData.performance_id}
                  onChange={(e) => setFormData({ ...formData, performance_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">请选择演出</option>
                  {performances.map((perf) => (
                    <option key={perf.id} value={perf.id}>
                      {perf.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">票种名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如: VIP区、A区"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">价格</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">开始销售时间</label>
              <input
                type="datetime-local"
                value={formData.sale_start_time}
                onChange={(e) => setFormData({ ...formData, sale_start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">结束销售时间</label>
              <input
                type="datetime-local"
                value={formData.sale_end_time}
                onChange={(e) => setFormData({ ...formData, sale_end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value={0}>未开售</option>
                <option value={1}>在售中</option>
              </select>
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
        ) : ticketTypes.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无票种数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">票种名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">演出</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">库存</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">销售时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ticketTypes.map((ticket) => {
                const performance = performances.find((p) => p.id === ticket.performance_id);
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{ticket.name}</td>
                    <td className="px-6 py-4 text-gray-600">{performance?.title || '-'}</td>
                    <td className="px-6 py-4 text-red-600 font-semibold">{formatCurrency(ticket.price)}</td>
                    <td className="px-6 py-4 text-gray-600">{ticket.stock}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{formatDate(ticket.sale_start_time)}</div>
                      <div className="text-gray-400">至</div>
                      <div>{formatDate(ticket.sale_end_time)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const dynamicStatus = getDynamicStatus(ticket);
                        return (
                          <span className={`px-2 py-1 text-xs rounded-full ${dynamicStatus.color}`}>
                            {dynamicStatus.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTicketType(ticket)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="查看"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedTicketType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">票种详情</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">票种名称</div>
                  <div className="text-gray-900 font-medium">{selectedTicketType.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">演出</div>
                  <div className="text-gray-900">{performances.find((p) => p.id === selectedTicketType.performance_id)?.title || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">价格</div>
                  <div className="text-red-600 font-semibold">{formatCurrency(selectedTicketType.price)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">库存</div>
                  <div className="text-gray-900">{selectedTicketType.stock}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">开始销售</div>
                  <div className="text-gray-900">{formatDate(selectedTicketType.sale_start_time)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">结束销售</div>
                  <div className="text-gray-900">{formatDate(selectedTicketType.sale_end_time)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">状态</div>
                  {(() => {
                    const dynamicStatus = getDynamicStatus(selectedTicketType);
                    return (
                      <span className={`px-2 py-1 text-xs rounded-full ${dynamicStatus.color}`}>
                        {dynamicStatus.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTicketType(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

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
