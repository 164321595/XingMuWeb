import { useState, useEffect } from 'react';
import { TicketType } from '@/types';
import TicketItem from './TicketItem';
import { ticketApi } from '@/api/ticket';
import Loading from '../common/Loading';

interface TicketSelectorProps {
  performanceId: number;
  onSelect: (ticketTypeId?: number, quantity?: number) => void;
}

export default function TicketSelector({ performanceId, onSelect }: TicketSelectorProps) {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(1);
  
  // 获取票种列表
  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        setLoading(true);
        const res = await ticketApi.getTicketTypes(performanceId);
        if (res.code === 200) {
          // 处理票种数据，确保每个票种都有完整的字段
          const processedTickets = res.data.map((ticket: TicketType) => ({
            ...ticket,
            status: ticket.status ?? 0, // 如果status不存在，默认为0
            stock: ticket.stock ?? 0, // 如果stock不存在，默认为0
          }));
          
          setTickets(processedTickets);
          
          // 默认选择第一个可购买的票种（预售或在售）
          const firstAvailableTicket = processedTickets.find(t => t.status === 1 || t.status === 2);
          if (firstAvailableTicket) {
            setSelectedTicketId(firstAvailableTicket.id);
            setMaxQuantity(Math.min(firstAvailableTicket.stock, 5)); // 最多购买5张
          }
        }
      } catch (error) {
        console.error('获取票种列表失败', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketTypes();
  }, [performanceId]);
  
  // 当选择的票种变化时更新最大购买数量
  useEffect(() => {
    if (selectedTicketId) {
      const selectedTicket = tickets.find(t => t.id === selectedTicketId);
      if (selectedTicket) {
        // 确保stock是有效的数字
        const stock = typeof selectedTicket.stock === 'number' ? selectedTicket.stock : 0;
        setMaxQuantity(Math.min(stock, 5)); // 最多购买5张
        
        // 如果当前数量大于新的最大数量，更新数量
        if (quantity > maxQuantity) {
          setQuantity(maxQuantity);
        }
      }
    }
    
    // 触发选择回调
    onSelect(selectedTicketId, quantity);
  }, [selectedTicketId, quantity, tickets, maxQuantity, onSelect]);
  
  const handleTicketSelect = (ticketId: number) => {
    const selectedTicket = tickets.find(t => t.id === ticketId);
    if (selectedTicket) {
      // 即使状态不是1也允许选择，让用户能够看到所有票种
      setSelectedTicketId(ticketId);
      setMaxQuantity(Math.min(selectedTicket.stock || 0, 5));
      // 重置数量为1
      setQuantity(1);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  if (loading) {
    return <Loading size="small" text="加载票种信息中..." />;
  }
  
  if (tickets.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">暂无票种信息</div>;
  }
  
  return (
    <div className="space-y-4">
      {/* 票种选择 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="relative">
            <TicketItem 
              ticket={ticket} 
              selected={selectedTicketId === ticket.id} 
              onSelect={() => handleTicketSelect(ticket.id)}
              disabled={ticket.status !== 1 && ticket.status !== 2} // 预售和在售状态都可以选择
            />
          </div>
        ))}
      </div>
      
      {/* 数量选择 */}
      {selectedTicketId && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">选择数量</h4>
          
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300 mr-4">购买数量:</span>
            
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              
               <input
                 type="number"
                 min="1"
                 max={maxQuantity}
                 value={quantity}
                 onChange={handleQuantityChange}
                 className="w-16 h-10 flex items-center justify-center border-x border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none text-lg text-center"
              />
              
              <button 
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
                className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              最多可购买 {maxQuantity} 张
            </span>
          </div>
        </div>
      )}
    </div>
  );
}