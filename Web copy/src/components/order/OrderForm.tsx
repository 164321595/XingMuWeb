import { useState } from 'react';
import { Order } from '@/types';
import { orderApi } from '@/api/order';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';

interface OrderFormProps {
  order: Order;
  onSuccess?: () => void;
}

export default function OrderForm({ order, onSuccess }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const navigate = useNavigate();
  
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
  
  // 检查订单是否已过期
  const isOrderExpired = () => {
    if (!order.expire_time) return false;
    return new Date() > new Date(order.expire_time);
  };
  
  // 处理支付
  const handlePay = async () => {
    if (isOrderExpired()) {
      toast.error('订单已过期，请重新下单');
      return;
    }
    
    try {
      setLoading(true);
      const res = await orderApi.payOrder(order.id);
      if (res.code === 200) {
        toast.success('支付成功！');
        if (onSuccess) onSuccess();
        navigate(`/orders/${order.id}`);
      } else {
        toast.error(res.message || '支付失败，请重试');
      }
    } catch (error) {
      console.error('支付失败', error);
      toast.error('支付过程中出现错误，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理取消订单
  const handleCancel = async () => {
    try {
      setLoading(true);
      const res = await orderApi.cancelOrder(order.id);
      if (res.code === 200) {
        toast.success('订单已取消');
        setShowCancelConfirm(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || '取消订单失败，请重试');
      }
    } catch (error) {
      console.error('取消订单失败', error);
      toast.error('取消订单过程中出现错误，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 订单信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">订单信息</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">订单编号:</span>
            <span className="text-gray-900 dark:text-white">{order.order_no}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">创建时间:</span>
            <span className="text-gray-900 dark:text-white">{order.created_at}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">订单状态:</span>
            <span className={`font-medium ${
              order.status === 0 ? 'text-yellow-600 dark:text-yellow-400' :
              order.status === 1 ? 'text-green-600 dark:text-green-400' :
              order.status === 2 ? 'text-gray-600 dark:text-gray-400' :
              order.status === 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {order.status === 0 ? '待支付' :
               order.status === 1 ? '已支付' :
               order.status === 2 ? '已取消' :
               order.status === 3 ? '已退款' : '未知状态'}
            </span>
          </div>
          
          {order.status === 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">过期时间:</span>
              <span className={`font-medium ${isOrderExpired() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {formatDateTime(order.expire_time)}
                {isOrderExpired() && <span className="ml-2">已过期</span>}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* 演出信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">演出信息</h3>
        
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={order.performance?.cover_image || 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=performance%20cover&sign=fb7ac070db649a8e7c48c6221e08a251'} 
              alt={order.performance?.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
              {order.performance?.title}
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <i className="fa-solid fa-user mr-2 text-gray-400"></i>
                <span>表演者: {order.performance?.title}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <i className="fa-solid fa-map-marker-alt mr-2 text-gray-400"></i>
                <span>场馆: {order.performance?.venue}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <i className="fa-solid fa-calendar mr-2 text-gray-400"></i>
                <span>时间: {formatDateTime(order.performance?.start_time || '')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 票种信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">票种信息</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">票种:</span>
            <span className="text-gray-900 dark:text-white">{order.ticket_type?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">单价:</span>
            <span className="text-gray-900 dark:text-white">¥{order.ticket_type?.price.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">数量:</span>
            <span className="text-gray-900 dark:text-white">{order.quantity} 张</span>
          </div>
        </div>
      </div>
      
      {/* 金额信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
          <span>订单总金额:</span>
          <span className="text-red-600 dark:text-red-400">¥{order.amount.toFixed(2)}</span>
        </div>
      </div>
      
      {/* 操作按钮 */}
      {order.status === 0 && !isOrderExpired() && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            取消订单
          </button>
          
          <button
            onClick={handlePay}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...
              </>
            ) : (
              '立即支付'
            )}
          </button>
        </div>
      )}
      
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
              onClick={handleCancel}
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
            <i className="fa-solid fa-exclamation-circle"></i>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">确定要取消订单吗？</h4>
          <p className="text-gray-500 dark:text-gray-400">取消订单后，票券将被释放，您可以重新抢购。</p>
        </div>
      </Modal>
    </div>
  );
}