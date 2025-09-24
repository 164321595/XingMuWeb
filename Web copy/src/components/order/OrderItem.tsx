import { Link } from 'react-router-dom';
import { Order } from '@/types';

interface OrderItemProps {
  order: Order;
}

export default function OrderItem({ order }: OrderItemProps) {
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
  
  const statusInfo = getOrderStatus(order.status);
  
  return (
    <Link 
      to={`/orders/${order.id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {/* 演出封面 */}
        <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={order.performance?.cover_image || 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=performance%20cover&sign=fb7ac070db649a8e7c48c6221e08a251'} 
            alt={order.performance?.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 订单信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
              {order.performance?.title}
            </h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium {statusInfo.class}">
              {statusInfo.text}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
            {order.ticket_type?.name} x {order.quantity}
          </p>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            <i className="fa-solid fa-calendar mr-1"></i>
            <span>{order.created_at}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <i className="fa-solid fa-map-marker-alt mr-1"></i>
            <span className="line-clamp-1">{order.performance?.venue}</span>
          </div>
        </div>
        
        {/* 订单金额 */}
        <div className="flex flex-col items-end justify-between">
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            ¥{order.amount.toFixed(2)}
          </span>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            订单号: {order.order_no}
          </span>
        </div>
      </div>
    </Link>
  );
}