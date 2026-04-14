import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, GripVertical } from 'lucide-react';
import { adminCategoryApi } from '@/api/admin';

interface Category {
  id: number;
  name: string;
  parent_id: number;
  sort: number;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', sort: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', sort: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminCategoryApi.getCategoryList();
      if (res.code === 200) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        setCategories(list);
      }
    } catch (err) {
      console.error('获取分类列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.name.trim()) {
      alert('请输入分类名称');
      return;
    }

    try {
      const res = await adminCategoryApi.createCategory(newCategory);
      if (res.code === 200) {
        setShowAddForm(false);
        setNewCategory({ name: '', sort: 0 });
        fetchCategories();
      } else {
        alert(res.message || '添加失败');
      }
    } catch (err: any) {
      alert(err.message || '添加失败');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, sort: category.sort });
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.name.trim()) {
      alert('请输入分类名称');
      return;
    }

    try {
      const res = await adminCategoryApi.updateCategory(id, editForm);
      if (res.code === 200) {
        setEditingId(null);
        fetchCategories();
      } else {
        alert(res.message || '更新失败');
      }
    } catch (err: any) {
      alert(err.message || '更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const res = await adminCategoryApi.deleteCategory(id);
      if (res.code === 200) {
        fetchCategories();
      } else {
        alert(res.message || '删除失败');
      }
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">分类管理</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchCategories}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            刷新
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            添加分类
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">添加新分类</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="请输入分类名称"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={newCategory.sort}
                onChange={(e) => setNewCategory({ ...newCategory, sort: Number(e.target.value) })}
                placeholder="排序"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategory({ name: '', sort: 0 });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无分类数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">排序</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-400">
                      <GripVertical className="w-5 h-5 cursor-move" />
                      <span className="ml-2">{category.sort}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{category.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{category.id}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(category.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="编辑"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="删除"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
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
