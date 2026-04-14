import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  Theater,
  Users,
  TrendingUp,
  ArrowUpRight,
  Ticket,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardData {
  stats: {
    today_orders: number;
    today_revenue: number;
    pending_orders: number;
    active_performances: number;
    total_users: number;
    week_orders: number;
    week_revenue: number;
  };
  sales_data: Array<{
    date: string;
    orders: number;
    revenue: number;
    tickets: number;
  }>;
}

const COLORS = {
  orders: '#ef4444',
  revenue: '#22c55e',
  tickets: '#3b82f6',
  users: '#f59e0b',
  performances: '#8b5cf6',
  categories: '#ec4899',
};

const PIE_COLORS = [
  '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#d946ef', '#0ea5e9',
  '#fb7185', '#a3e635', '#c084fc', '#fbbf24', '#34d399', '#f472b6',
  '#38bdf8', '#4ade80', '#e879f9', '#facc15', '#2dd4bf', '#818cf8',
];

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  prefix?: string;
}

const chartMetrics = [
  { key: 'orders', label: '订单数', color: COLORS.orders },
  { key: 'revenue', label: '收入', color: COLORS.revenue },
  { key: 'tickets', label: '票数', color: COLORS.tickets },
];

const pieChartTypes = [
  { key: 'category', label: '演出类型' },
  { key: 'ticket', label: '票种分布' },
];

function formatCurrency(value: number | undefined | null): string {
  if (value == null || isNaN(value) || value === 0) return '¥0';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatDateShort(value: string): string {
  if (!value) return '';
  if (value.includes('T')) {
    const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[2]}-${match[3]}`;
    }
  }
  return value.slice(5);
}

function StatCardComponent({ title, value, icon: Icon, color, prefix }: StatCard) {
  const displayValue = prefix === '¥' ? formatCurrency(value) : formatNumber(value);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1" style={{ wordBreak: 'break-all' }}>
        {displayValue}
      </div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('orders');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedPieChart, setSelectedPieChart] = useState('category');
  const [error, setError] = useState<string | null>(null);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchPieChartData(selectedPieChart);
  }, [selectedPieChart]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.code === 200 && res.data) {
        setData(res.data);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      console.error('获取仪表盘数据失败:', err);
      setError('网络错误，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  const fetchPieChartData = async (type: string) => {
    try {
      const res = await adminApi.getCategoryDistribution(type);
      if (res.code === 200 && res.data) {
        setPieData(res.data);
      }
    } catch (err) {
      console.error('获取分布数据失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-red-500 text-lg mb-4">{error || '数据加载失败'}</div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          重试
        </button>
      </div>
    );
  }

  const currentMetric = chartMetrics.find((m) => m.key === selectedMetric) || chartMetrics[0];

  const getChartData = () => {
    if (!data?.sales_data || data.sales_data.length === 0) {
      return [];
    }
    return data.sales_data.map((item) => ({
      date: item.date,
      value: item[selectedMetric as keyof typeof item] as number || 0,
      orders: item.orders || 0,
      revenue: item.revenue || 0,
      tickets: item.tickets || 0,
    }));
  };

  const getTotalValue = () => {
    if (!data?.sales_data || data.sales_data.length === 0) return '0';
    const total = data.sales_data.reduce((sum, item) => {
      return sum + (item[selectedMetric as keyof typeof item] as number || 0);
    }, 0);
    return selectedMetric === 'revenue' ? formatCurrency(total) : formatNumber(total);
  };

  const getAverageValue = () => {
    if (!data?.sales_data || data.sales_data.length === 0) return '0';
    const avg = data.sales_data.reduce((sum, item) => {
      return sum + (item[selectedMetric as keyof typeof item] as number || 0);
    }, 0) / data.sales_data.length;
    return selectedMetric === 'revenue' ? formatCurrency(avg) : formatNumber(Math.round(avg));
  };

  const getMaxDay = () => {
    if (!data?.sales_data || data.sales_data.length === 0) return '-';
    const maxItem = data.sales_data.reduce((max, item) => {
      const val = item[selectedMetric as keyof typeof item] as number || 0;
      const maxVal = max[selectedMetric as keyof typeof max] as number || 0;
      return val > maxVal ? item : max;
    }, data.sales_data[0]);
    return formatDateShort(maxItem?.date) || '-';
  };

  const chartData = getChartData();
  const hasData = chartData.length > 0 && chartData.some(item => item.value > 0);

  const statCards: StatCard[] = [
    { title: '今日订单', value: data.stats?.today_orders || 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { title: '今日收入', value: data.stats?.today_revenue || 0, icon: DollarSign, color: 'bg-green-500', prefix: '¥' },
    { title: '待处理订单', value: data.stats?.pending_orders || 0, icon: Clock, color: 'bg-orange-500' },
    { title: '活跃演出', value: data.stats?.active_performances || 0, icon: Theater, color: 'bg-purple-500' },
    { title: '总用户数', value: data.stats?.total_users || 0, icon: Users, color: 'bg-pink-500' },
    { title: '本周订单', value: data.stats?.week_orders || 0, icon: TrendingUp, color: 'bg-cyan-500' },
    { title: '本周收入', value: data.stats?.week_revenue || 0, icon: DollarSign, color: 'bg-emerald-500', prefix: '¥' },
  ];

  const renderTrendChart = () => {
    if (!hasData) {
      return (
        <div className="flex items-center justify-center h-80 text-gray-400">
          暂无数据，请确保数据库中有近7天的订单数据
        </div>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatDateShort(value)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [value, currentMetric.label]}
              labelFormatter={(label) => `日期: ${formatDateShort(label)}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={currentMetric.color}
              strokeWidth={3}
              dot={{ fill: currentMetric.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: currentMetric.color }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatDateShort(value)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [value, currentMetric.label]}
              labelFormatter={(label) => `日期: ${formatDateShort(label)}`}
            />
            <Bar dataKey="value" fill={currentMetric.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  const renderPieChart = () => {
    if (!pieData || pieData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          暂无分布数据
        </div>
      );
    }

    return (
      <div className="flex">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={(label) => label}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-48 overflow-y-auto max-h-64 space-y-1">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="truncate text-gray-600" title={entry.name}>
                {entry.name}
              </span>
              <span className="text-gray-500 ml-auto">({entry.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            数据更新时间: {new Date().toLocaleString('zh-CN')}
          </span>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="刷新数据"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((card, index) => (
          <StatCardComponent key={index} {...card} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">数据趋势</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
            >
              {chartMetrics.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-2 flex items-center gap-1 transition ${chartType === 'line' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">折线图</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-2 flex items-center gap-1 transition ${chartType === 'bar' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">柱状图</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentMetric.color }}></div>
            <span className="text-gray-600">{currentMetric.label}</span>
          </div>
          <div className="text-gray-500">
            合计: <span className="font-semibold text-gray-800">{getTotalValue()}</span>
          </div>
          <div className="text-gray-500">
            日均: <span className="font-semibold text-gray-800">{getAverageValue()}</span>
          </div>
          <div className="text-gray-500">
            峰值日: <span className="font-semibold text-gray-800">{getMaxDay()}</span>
          </div>
        </div>

        <div className="h-80">
          {renderTrendChart()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">分布概览</h2>
            <select
              value={selectedPieChart}
              onChange={(e) => setSelectedPieChart(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
            >
              {pieChartTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64">
            {renderPieChart()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷入口</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/admin/orders"
              className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
            >
              <Clock className="w-10 h-10 text-orange-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(data?.stats?.pending_orders)}</div>
                <div className="text-sm text-gray-500">待处理订单</div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-orange-400" />
            </Link>
            <Link
              to="/admin/performances"
              className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <Theater className="w-10 h-10 text-purple-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(data?.stats?.active_performances)}</div>
                <div className="text-sm text-gray-500">活跃演出</div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-purple-400" />
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-4 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition"
            >
              <Users className="w-10 h-10 text-pink-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(data?.stats?.total_users)}</div>
                <div className="text-sm text-gray-500">注册用户</div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-pink-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link
            to="/admin/performances/create"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
          >
            <Theater className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm text-gray-700">添加演出</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
          >
            <ShoppingCart className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm text-gray-700">处理订单</span>
          </Link>
          <Link
            to="/admin/tickets"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
          >
            <Ticket className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm text-gray-700">票务管理</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
          >
            <Users className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm text-gray-700">用户管理</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
          >
            <TrendingUp className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm text-gray-700">分类管理</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
          >
            <DollarSign className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm text-gray-700">系统配置</span>
          </Link>
        </div>
      </div>
    </div>
  );
}