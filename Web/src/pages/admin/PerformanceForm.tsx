import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { adminPerformanceApi, adminCategoryApi } from '@/api/admin';

interface PerformanceFormData {
  title: string;
  category_id: number;
  cover_image: string;
  description: string;
  performer: string;
  venue: string;
  start_time: string;
  end_time: string;
  status: number;
}

export default function PerformanceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PerformanceFormData>({
    title: '',
    category_id: 1,
    cover_image: '',
    description: '',
    performer: '',
    venue: '',
    start_time: '',
    end_time: '',
    status: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchPerformance(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await adminCategoryApi.getCategoryList();
      if (res.code === 200) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const fetchPerformance = async (performanceId: string) => {
    try {
      const res = await adminPerformanceApi.getPerformanceDetail(Number(performanceId));
      if (res.code === 200) {
        const perf = res.data.performance;
        setFormData({
          title: perf.title,
          category_id: perf.category_id,
          cover_image: perf.cover_image,
          description: perf.description || '',
          performer: perf.performer,
          venue: perf.venue,
          start_time: perf.start_time.slice(0, 16),
          end_time: perf.end_time.slice(0, 16),
          status: perf.status,
        });
      }
    } catch (err) {
      console.error('获取演出详情失败:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        start_time: formData.start_time + ':00',
        end_time: formData.end_time + ':00',
      };

      let res;
      if (isEdit && id) {
        res = await adminPerformanceApi.updatePerformance(Number(id), data);
      } else {
        res = await adminPerformanceApi.createPerformance(data);
      }

      if (res.code === 200) {
        navigate('/admin/performances');
      } else {
        alert(res.message || '操作失败');
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/admin/performances')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? '编辑演出' : '添加演出'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演出标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="请输入演出标题"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演出分类 *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表演者/团体 *
              </label>
              <input
                type="text"
                value={formData.performer}
                onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="请输入表演者或演出团体"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演出场馆 *
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="请输入演出场馆"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演出状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value={0}>未开售</option>
                <option value={1}>预售中</option>
                <option value={2}>在售中</option>
                <option value={3}>已售罄</option>
                <option value={4}>已结束</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片URL
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="请输入封面图片URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              演出描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="请输入演出描述"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/performances')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
