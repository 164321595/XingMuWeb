import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { adminSystemApi } from '@/api/admin';

interface Config {
  id: number;
  key: string;
  value: string;
  description: string;
}

export default function SystemSettings() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await adminSystemApi.getConfig();
      if (res.code === 200) {
        setConfigs(res.data);
        const edited: Record<string, string> = {};
        res.data.forEach((config: Config) => {
          edited[config.key] = config.value;
        });
        setEditedConfigs(edited);
      }
    } catch (err) {
      console.error('获取系统配置失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      const res = await adminSystemApi.updateConfig(key, editedConfigs[key]);
      if (res.code === 200) {
        alert('保存成功');
      } else {
        alert(res.message || '保存失败');
      }
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const key of Object.keys(editedConfigs)) {
        await adminSystemApi.updateConfig(key, editedConfigs[key]);
      }
      alert('全部保存成功');
      fetchConfigs();
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">系统配置</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchConfigs}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            刷新
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? '保存中...' : '保存全部'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">暂无配置数据</div>
        ) : (
          <div className="space-y-6">
            {configs.map((config) => (
              <div key={config.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-2">
                  <label className="text-sm font-medium text-gray-700">{config.description}</label>
                  <div className="text-xs text-gray-400 mt-1">配置键: {config.key}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={editedConfigs[config.key] || ''}
                    onChange={(e) =>
                      setEditedConfigs({ ...editedConfigs, [config.key]: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={() => handleSave(config.key)}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
