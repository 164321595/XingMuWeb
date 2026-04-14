import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { adminPerformanceApi, adminCategoryApi } from '@/api/admin';

interface Performance {
  id: number;
  title: string;
  performer: string;
  venue: string;
  start_time: string;
  end_time: string;
  status: number;
  category_id: number;
  cover_image: string;
  description?: string;
}

interface Category {
  id: number;
  name: string;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未开售', color: 'bg-gray-100 text-gray-600' },
  1: { label: '预售中', color: 'bg-blue-100 text-blue-600' },
  2: { label: '在售中', color: 'bg-green-100 text-green-600' },
  3: { label: '已售罄', color: 'bg-red-100 text-red-600' },
  4: { label: '已结束', color: 'bg-gray-100 text-gray-400' },
};

const getDynamicStatus = (performance: Performance): { status: number; label: string; color: string } => {
  const now = new Date();
  const startTime = new Date(performance.start_time);
  const endTime = new Date(performance.end_time);

  if (now < startTime) {
    const daysBeforeStart = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysBeforeStart <= 7) {
      return { status: 1, label: '预售中', color: 'bg-blue-100 text-blue-600' };
    }
    return { status: 0, label: '未开售', color: 'bg-gray-100 text-gray-600' };
  }

  if (now >= startTime && now <= endTime) {
    return { status: 2, label: '在售中', color: 'bg-green-100 text-green-600' };
  }

  if (now > endTime) {
    return { status: 4, label: '已结束', color: 'bg-gray-100 text-gray-400' };
  }

  return { status: 0, label: '未知', color: 'bg-gray-100 text-gray-600' };
};

export default function PerformanceList() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchPerformances();
  }, [filterStatus, filterCategory, searchKeyword]);

  useEffect(() => {
    fetchPerformances();
  }, [pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await adminCategoryApi.getCategoryList();
      if (res.code === 200) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        setCategories(list);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const fetchPerformances = async () => {
    setLoading(true);
    try {
      const res = await adminPerformanceApi.getPerformanceList({
        page: 1,
        size: 1000,
      });
      if (res.code === 200) {
        let list = Array.isArray(res.data) ? res.data : (res.data?.list || []);

        if (filterCategory !== null) {
          list = (list as Performance[]).filter((perf: Performance) => perf.category_id === filterCategory);
        }

        if (filterStatus !== null) {
          list = list.filter((perf: Performance) => {
            const dynamic = getDynamicStatus(perf);
            return dynamic.status === filterStatus;
          });
        }

        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          list = (list as Performance[]).filter((perf: Performance) =>
            perf.title.toLowerCase().includes(keyword) ||
            perf.performer.toLowerCase().includes(keyword) ||
            perf.venue.toLowerCase().includes(keyword) ||
            (perf.description && perf.description.toLowerCase().includes(keyword)) ||
            perf.start_time.toLowerCase().includes(keyword) ||
            perf.end_time.toLowerCase().includes(keyword) ||
            String(perf.category_id).includes(keyword)
          );
        }

        const start = (pagination.page - 1) * pagination.size;
        const paginatedList = list.slice(start, start + pagination.size);

        setPerformances(paginatedList);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (err) {
      console.error('获取演出列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个演出吗？')) return;
    try {
      const res = await adminPerformanceApi.deletePerformance(id);
      if (res.code === 200) {
        fetchPerformances();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">演出管理</h1>
        <Link
          to="/admin/performances/create"
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加演出
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索演出名称、表演者..."
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

          <select
            value={filterCategory ?? ''}
            onChange={(e) => {
              setFilterCategory(e.target.value ? Number(e.target.value) : null);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
        ) : performances.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无演出数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">演出信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performances.map((perf) => (
                <tr key={perf.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={perf.cover_image || 'https://picsum.photos/80/80'}
                        alt={perf.title}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{perf.title}</div>
                        <div className="text-sm text-gray-500">{perf.performer}</div>
                        <div className="text-sm text-gray-400">{perf.venue}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {categories.find((c) => c.id === perf.category_id)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    <div>{formatDate(perf.start_time)}</div>
                    <div className="text-gray-400">至</div>
                    <div>{formatDate(perf.end_time)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const dynamicStatus = getDynamicStatus(perf);
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
                        onClick={() => setSelectedPerformance(perf)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="查看"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/admin/performances/${perf.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="编辑"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(perf.id)}
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

      {selectedPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">演出详情</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <img
                  src={selectedPerformance.cover_image || 'https://picsum.photos/200/200'}
                  alt={selectedPerformance.title}
                  className="w-32 h-32 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">{selectedPerformance.title}</h4>
                  <p className="text-gray-500 mt-1">{selectedPerformance.performer}</p>
                  {(() => {
                    const dynamicStatus = getDynamicStatus(selectedPerformance);
                    return (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${dynamicStatus.color}`}>
                        {dynamicStatus.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">演出场馆</div>
                  <div className="text-gray-900">{selectedPerformance.venue}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">分类</div>
                  <div className="text-gray-900">{categories.find((c) => c.id === selectedPerformance.category_id)?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">开始时间</div>
                  <div className="text-gray-900">{formatDate(selectedPerformance.start_time)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">结束时间</div>
                  <div className="text-gray-900">{formatDate(selectedPerformance.end_time)}</div>
                </div>
              </div>
              {selectedPerformance.description && (
                <div>
                  <div className="text-sm text-gray-500">演出描述</div>
                  <div className="text-gray-900 mt-1">{selectedPerformance.description}</div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Link
                to={`/admin/performances/${selectedPerformance.id}/edit`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mr-2"
              >
                编辑
              </Link>
              <button
                onClick={() => setSelectedPerformance(null)}
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
