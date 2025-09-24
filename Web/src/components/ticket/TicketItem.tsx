import { TicketType } from '@/types';

interface TicketItemProps {
  ticket: TicketType;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function TicketItem({ ticket, selected, onSelect, disabled = false }: TicketItemProps) {
  // 获取票种状态文本
  const getStatusText = (status?: number) => {
    // 处理undefined或null的情况
    if (status === undefined || status === null) {
      return '未知状态';
    }
    
    switch (status) {
      case 0:
        return '未开售';
      case 1:
        return '预售';
      case 2:
        return '在售';
      case 3:
        return '售罄';
      case 4:
        return '已结束';
      default:
        return '未知状态';
    }
  };
  
  // 获取票种状态样式
  const getStatusClass = (status?: number) => {
    // 处理undefined或null的情况
    if (status === undefined || status === null) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    switch (status) {
      case 0:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 1:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 2:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 3:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 4:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div 
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        disabled 
          ? 'opacity-60 cursor-not-allowed' 
          : selected 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md': 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
          {getStatusText(ticket.status)}
        </span>
      </div>
      
      <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
        ¥{ticket.price.toFixed(2)}
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="inline-block w-24">库存:</span>
        <span>{ticket.stock || 0} 张</span>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-block w-24">销售时间:</span>
        <span>{ticket.sale_start_time ? formatDateTime(ticket.sale_start_time) : '未设置'} - {ticket.sale_end_time ? formatDateTime(ticket.sale_end_time) : '未设置'}</span>
      </div>
      
      {selected && !disabled && (
        <div className="absolute top-3 right-3 text-red-500 transform translate-x-1">
          <i className="fa-solid fa-check-circle"></i>
        </div>
      )}
    </div>
  );
}