import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '@/api/ticket';
import { performanceApi } from '@/api/performance';
import { Order, Performance } from '@/types';
import { orderApi } from '@/api/order';
import { toast } from 'sonner';
import { StatusMessage } from '@/api';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';
import TicketSelector from '@/components/ticket/TicketSelector';
import Modal from '@/components/common/Modal';

export default function TicketSeckill() {
  const { id } = useParams<{ id: string }>();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [seckillLoading, setSeckillLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>();
  const [selectedQuantity, setSelectedQuantity] = useState<number | undefined>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  
  // 获取演出详情
  const fetchPerformanceDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const res = await performanceApi.getPerformanceDetail(parseInt(id));
      
      if (res.code === 200) {
        setPerformance(res.data);
      } else {
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
  
  useEffect(() => {
    fetchPerformanceDetail();
  }, [id]);
  
  // 处理票种选择变化
  const handleTicketSelect = (ticketTypeId?: number, quantity?: number) => {
    setSelectedTicketId(ticketTypeId);
    setSelectedQuantity(quantity);
  };
  
  // 处理抢票
  const handleSeckill = async () => {
    if (!selectedTicketId || !selectedQuantity || !id) {
      // 使用setTimeout包装toast，避免React渲染冲突
      setTimeout(() => {
        toast.error('请选择票种和数量');
      }, 0);
      return;
    }
    
    try {
      setSeckillLoading(true);
      // 调用抢票接口
      const seckillRes = await ticketApi.seckillTicket(selectedTicketId, selectedQuantity);
      
      if (seckillRes.code === 200) {
        // 抢票成功，创建正式订单
        const orderRes = await orderApi.createOrderFromSeckill(seckillRes.data.order_id);
        
        if (orderRes.code === 200) {
          setOrder(orderRes.data);
          setShowSuccessModal(true);
        } else {
          toast.error(orderRes.message || '创建订单失败，请重试');
        }
      } else {
        // 使用StatusMessage中定义的状态码消息
        toast.error(StatusMessage[seckillRes.code] || seckillRes.message || '抢票失败，请重试');
      }
    } catch (error) {
      console.error('抢票失败', error);
      toast.error('抢票过程中出现错误，请重试');
    } finally {
      setSeckillLoading(false);
    }
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="large" text="加载中..." />
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
          <div className="text-center">
            <i className="fa-solid fa-exclamation-circle text-4xl text-yellow-500 mb-4"></i>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">演出不存在</h2>
            <button 
              onClick={() => navigate('/performances')}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              返回演出列表
            </button>
          </div>
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
          {/* 演出信息 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={performance.cover_image} 
                  alt={performance.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {performance.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{performance.performer}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <i className="fa-solid fa-map-marker-alt mr-2 text-gray-400 w-4 text-center"></i>
                    <span>{performance.venue}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <i className="fa-solid fa-calendar mr-2 text-gray-400 w-4 text-center"></i>
                    <span>{formatDateTime(performance.start_time)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <i className="fa-solid fa-tags mr-2 text-gray-400 w-4 text-center"></i>
                    <span>{performance.category_name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 票种选择 */}
          <div className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">选择票种</h2>
            
            <TicketSelector 
              performanceId={parseInt(id!)} 
              onSelect={handleTicketSelect} 
            />
            
            {/* 抢票按钮 - 重构为单一button元素以避免DOM不同步问题 */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSeckill}
                disabled={seckillLoading || !selectedTicketId || !selectedQuantity}
                className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${ 
                  seckillLoading || !selectedTicketId || !selectedQuantity 
                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white' 
                }`}
              >
                {/* 简化文本渲染逻辑，避免嵌套条件导致的DOM不同步 */}
                {seckillLoading && <i className="fa-solid fa-spinner fa-spin mr-2"></i>}
                {seckillLoading ? '抢票中...' : (selectedTicketId && selectedQuantity ? '立即抢票' : '请先选择票种和数量')}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* 抢票成功模态框 */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="抢票成功"
        footer={
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate(`/order/confirm/${order?.id}`);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            去支付
          </button>
        }
        closeOnOutsideClick={false}
      >
        <div className="text-center py-6">
          <div className="text-green-500 text-5xl mb-4">
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">抢票成功！</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            您已成功抢到票，请在规定时间内完成支付
          </p>
          
          {order && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">订单编号:</span>
                <span className="text-gray-900 dark:text-white font-medium">{order.order_no}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">票种:</span>
                <span className="text-gray-900 dark:text-white">{order.ticket_type?.name} x {order.quantity}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">订单金额:</span>
                <span className="text-red-600 dark:text-red-400 font-bold">¥{order.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">支付截止时间:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{order.expire_time}</span>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            温馨提示：订单将保留15分钟，请尽快完成支付
          </p>
        </div>
      </Modal>
    </div>
  );
}