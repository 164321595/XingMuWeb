import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '@/api/order';
import { Order, Ticket } from '@/types';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';
import { Empty } from '@/components/Empty';
import Modal from '@/components/common/Modal';
import { getImagePath } from '@/utils/imageAssets';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  
  // 获取订单详情
  const fetchOrderDetail = async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      setLoading(true);
      const res = await orderApi.getOrderDetail(parseInt(id));
      
      if (res.code === 200) {
        setOrder(res.data);
      } else { // 4001 订单不存在
        toast.error(res.message || '获取订单详情失败');
        navigate('/orders');
      }
    } catch (error) {
      console.error('获取订单详情失败', error);
      toast.error('获取订单详情失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // 检查是否登录
    if (!isAuthenticated) {
      toast.info('请先登录');
      navigate('/login', { state: { from: `/orders/${id}` } });
      return;
    }
    
    fetchOrderDetail();
  }, [id, isAuthenticated, navigate]);
  
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
  
  // 获取订单状态文本和样式
  const getOrderStatus = (status: number) => {
    switch (status) {
      case 0:
        return { text: '待支付', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
      case 1:
        return { text: '已支付', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
      case 2:
        return { text: '已取消', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
      case 3:
        return { text: '已退款', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
      default:
        return { text: '未知状态', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };
  
  // 处理取消订单
  const handleCancelOrder = async () => {
    // 打开取消订单确认模态框
    setShowCancelConfirm(true);
  };
  
  // 确认取消订单
  const handleConfirmCancel = async () => {
    if (!order) return;
    
    try {
      setLoading(true);
      const res = await orderApi.cancelOrder(order.id);
      
      if (res.code === 200) {
        toast.success('订单已取消');
        fetchOrderDetail();
      } else { // 4002 订单已过期, 4003 订单状态错误
        toast.error(res.message || '取消订单失败，请重试');
      }
    } catch (error) {
      console.error('取消订单失败', error);
      toast.error('取消订单过程中出现错误，请重试');
    } finally {
      setLoading(false);
      setShowCancelConfirm(false);
    }
  };
  
  // 处理支付订单
  const handlePayOrder = async () => {
    if (!order) return;
    
    try {
      setPayLoading(true);
      const res = await orderApi.payOrder(order.id);
      
      if (res.code === 200) {
        toast.success('支付成功');
        fetchOrderDetail();
      } else { // 4002 订单已过期, 4003 订单状态错误
        toast.error(res.message || '支付失败，请重试');
      }
    } catch (error) {
      console.error('支付订单失败', error);
      toast.error('支付过程中出现错误，请重试');
    } finally {
      setPayLoading(false);
    }
  };
  
  // 检查订单是否已过期
  const isOrderExpired = () => {
    if (!order || order.status !== 0) return false;
    return new Date() > new Date(order.expire_time);
  };
  
  // 处理退款订单
  const handleRefundOrder = async () => {
    // 打开退款确认模态框
    setShowRefundConfirm(true);
  };
  
  // 确认退款
  const handleConfirmRefund = async () => {
    if (!order) return;
    
    try {
      setLoading(true);
      const res = await orderApi.refundOrder(order.id);
      
      if (res.code === 200) {
        toast.success('退款申请已提交');
        fetchOrderDetail();
      } else {
        toast.error(res.message || '退款失败，请重试');
      }
    } catch (error) {
      console.error('退款失败', error);
      toast.error('退款过程中出现错误，请重试');
    } finally {
      setLoading(false);
      setShowRefundConfirm(false);
    }
  };
  
  if (!isAuthenticated) {
    return null; // 未登录时不渲染页面，会被重定向到登录页
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="large" text="加载订单详情中..." />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!order) {
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
  
  const statusInfo = getOrderStatus(order.status);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">订单详情</h1>
            <p className="text-gray-600 dark:text-gray-300">订单编号: {order.order_no}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* 订单状态 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">订单状态</h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium {statusInfo.class}">
                {statusInfo.text}
              </span>
            </div>
            
            {/* 订单信息 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">订单编号</h3>
                  <p className="text-gray-900 dark:text-white">{order.order_no}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">创建时间</h3>
                  <p className="text-gray-900 dark:text-white">{order.created_at}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">订单金额</h3>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">¥{order.amount.toFixed(2)}</p>
                </div>
              </div>
              
              {/* 演出信息 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">演出信息</h3>
                
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={getImagePath(order.performance?.cover_image) || 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=performance%20cover&sign=fb7ac070db649a8e7c48c6221e08a251'} 
                      alt={order.performance?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                      {order.performance?.title}
                    </h4>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {order.ticket_type?.name} x {order.quantity}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <i className="fa-solid fa-user mr-1"></i>
                      {order.performance?.title}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <i className="fa-solid fa-map-marker-alt mr-1"></i>
                      {order.performance?.venue}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <i className="fa-solid fa-calendar mr-1"></i>
                      {order.performance?.start_time}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 票券信息 */}
              {order.status === 1 && order.tickets && order.tickets.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">票券信息</h3>
                  
                  <div className="space-y-3">
                    {order.tickets.map((ticket: Ticket) => (
                      <div key={ticket.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">票券编号</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">
                            未使用
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white mb-2">{ticket.ticket_no}</p>
                        
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>座位信息: {ticket.seat_info}</span>
                          <span>购买时间: {order.payment_time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 支付信息 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">支付信息</h3>
                
                {order.status === 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        {isOrderExpired() ? '订单已过期' : '请在以下时间前完成支付'}
                      </span>
                      <span className={`font-medium ${isOrderExpired() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {order.expire_time}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 justify-end">
                      <button
                        onClick={handleCancelOrder}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        取消订单
                      </button>
                      
                      <button
                        onClick={handlePayOrder}
                        disabled={loading || payLoading || isOrderExpired()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        {payLoading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
                          </>
                        ) : isOrderExpired() ? (
                          '订单已过期'
                        ) : (
                          '立即支付'
                        )}
                      </button>
                    </div>
                  </div>
                ) : order.status === 1 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">支付状态</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">已支付</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">支付时间</span>
                        <span className="text-gray-900 dark:text-white">{order.payment_time}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">支付方式</span>
                        <span className="text-gray-900 dark:text-white">模拟支付</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleRefundOrder}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        {loading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
                          </>
                        ) : (
                          '申请退款'
                        )}
                      </button>
                    </div>
                  </div>
                ) : order.status === 2 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">取消时间</span>
                    <span className="text-gray-900 dark:text-white">{order.updated_at}</span>
                  </div>
                ) : order.status === 3 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">退款状态</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">已退款</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">退款时间</span>
                      <span className="text-gray-900 dark:text-white">{order.updated_at}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              to="/orders" 
              className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> 返回订单列表
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* 取消订单确认模态框 */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="取消订单"
        footer={
          <>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            
            <button
              onClick={handleConfirmCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
                </>
              ) : (
                '确认取消'
              )}
            </button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="text-yellow-500 text-4xl mb-4">
            <i className="fa-solid fa-exclamation-triangle"></i>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">确定要取消订单吗？</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            取消后，订单将无法恢复，已扣除的票券库存将被释放。
          </p>
        </div>
      </Modal>
      
      {/* 退款确认模态框 */}
      <Modal
        isOpen={showRefundConfirm}
        onClose={() => setShowRefundConfirm(false)}
        title="申请退款"
        footer={
          <>
            <button
              onClick={() => setShowRefundConfirm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            
            <button
              onClick={handleConfirmRefund}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
                </>
              ) : (
                '确认退款'
              )}
            </button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="text-red-500 text-4xl mb-4">
            <i className="fa-solid fa-exclamation-circle"></i>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">确定要申请退款吗？</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            退款申请提交后，系统将进行处理，退款金额将按原支付路径返回。
          </p>
        </div>
      </Modal>
    </div>
  );
}