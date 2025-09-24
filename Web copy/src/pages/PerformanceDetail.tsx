import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { performanceApi } from '@/api/performance';
import { Performance, Category } from '@/types';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';
import { Empty } from '@/components/Empty';
import { getImagePath } from '@/utils/imageAssets';

export default function PerformanceDetail() {
  const { id } = useParams<{ id: string }>();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  // 获取所有分类
  const fetchCategories = async () => {
    try {
      const res = await performanceApi.getCategories();
      if (res.code === 200 && res.data) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('获取分类失败', error);
    }
  };
  
  // 获取演出详情
  const fetchPerformanceDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const res = await performanceApi.getPerformanceDetail(parseInt(id));
      
      if (res.code === 200) {
        setPerformance(res.data);
      } else { // 2001 演出不存在
        toast.error(res.message || '获取演出详情失败');
        navigate('/performances');
      }
    } catch (error) {
      console.error('获取演出详情失败', error);
      toast.error('获取演出详情失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化时获取数据
  useEffect(() => {
    // 并行获取分类和演出详情
    Promise.all([fetchCategories(), fetchPerformanceDetail()]);
  }, [id]);
  
  // 获取分类名称
  const getCategoryName = (categoryId: number): string => {
    // 查找匹配的分类
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '未知分类';
  };
  
  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 获取演出状态文本
  const getStatusText = (status: number) => {
    const statusMap = {
      0: '未开售',
      1: '预售',
      2: '在售',
      3: '售罄',
      4: '已结束'
    };
    
    return statusMap[status as keyof typeof statusMap] || '未知状态';
  };
  
  // 处理抢票按钮点击
  const handleSeckill = () => {
    // 检查是否登录
    if (!isAuthenticated) {
      toast.info('请先登录');
      navigate('/login', { state: { from: `/performances/${id}` } });
      return;
    }
    
    // 检查演出状态
    if (!performance) return;
    
    if (performance.status === 0) {
      toast.info('演出尚未开售');
      return;
    } else if (performance.status === 3) {
      toast.info('演出票已售罄');
      return;
    } else if (performance.status === 4) {
      toast.info('演出已结束');
      return;
    }
    
    // 跳转到抢票页面
    navigate(`/ticket/seckill/${id}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="large" text="加载演出详情中..." />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!performance) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Empty />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* 演出头部信息 */}
          <div className="relative">
            {/* 封面图 */}
            <div className="aspect-[16/5] md:aspect-[16/4] lg:aspect-[16/3] overflow-hidden">
              <img 
                src={getImagePath(performance.cover_image)} 
                alt={performance.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 状态标签 */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              {getStatusText(performance.status)}
            </div>
            
            {/* 返回按钮 */}
            <button 
              onClick={() => navigate('/performances')}
              className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>
          
          {/* 演出基本信息 */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {performance.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {performance.performer}
                </p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <i className="fa-solid fa-tags mr-2 text-gray-400"></i>
                    <span>{getCategoryName(performance.category_id)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fa-solid fa-map-marker-alt mr-2 text-gray-400"></i>
                    <span>{performance.venue}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fa-solid fa-calendar mr-2 text-gray-400"></i>
                    <span>{formatDateTime(performance.start_time)}</span>
                  </div>
                </div>
              </div>
              
              {/* 抢票按钮 */}
              <button
                onClick={handleSeckill}
                disabled={[0, 3, 4].includes(performance.status)} // 未开售、售罄、已结束状态不可点击
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  [0, 3, 4].includes(performance.status)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {[0, 3, 4].includes(performance.status) ? getStatusText(performance.status) : '立即抢票'}
              </button>
            </div>
            
            {/* 演出详情 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">演出详情</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <p>{performance.description || '暂无演出详情'}</p>
                
                {/* 如果没有描述，显示一些占位内容 */}
                {!performance.description && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">演出介绍</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        这是一场精彩的演出，不容错过。表演者将为您带来精彩绝伦的表演，让您享受一场视听盛宴。
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">观演须知</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        请携带有效证件入场，演出开始前30分钟可入场。请勿携带易燃易爆物品及专业摄影设备。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 票种信息 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">票种信息</h2>
              
              {performance.ticket_types && performance.ticket_types.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {performance.ticket_types.map(ticket => (
                    <div key={ticket.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.name}</h3>
                      <p className="text-red-600 dark:text-red-400 font-bold mb-2">¥{ticket.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        库存: {ticket.stock} 张
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ticket.status === 0 ? '未开售' : ticket.status === 1 ? '预售' : ticket.status === 2 ? '在售' : ticket.status === 3 ? '售罄' : ticket.status === 4 ? '已结束' : '未知状态'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}