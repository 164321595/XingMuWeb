import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '@/api/order';
import { Order, PaginationResult } from '@/types';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';
import OrderItem from '@/components/order/OrderItem';
import { Empty } from '@/components/Empty';

export default function Orders() {
  const [orders, setOrders] = useState<PaginationResult<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 订单状态选项
  const statusOptions = [
    { value: 'all', label: '全部订单' },
    { value: '0', label: '待支付' },
    { value: '1', label: '已支付' },
    { value: '2', label: '已取消' },
    { value: '3', label: '已退款' }
  ];
  
  // 获取订单列表
  const fetchOrders = async (status?: number, page: number = 1) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const res = await orderApi.getUserOrders({
        status,
        page,
        size: 10
      });
      
      if (res.code === 200) {
        setOrders(res.data);
      } else {
        toast.error(res.message || '获取订单列表失败');
      }
    } catch (error) {
      console.error('获取订单列表失败', error);
      toast.error('获取订单列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // 检查是否登录
    if (!isAuthenticated) {
      toast.info('请先登录');
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    
    // 初始加载全部订单
    fetchOrders();
  }, [isAuthenticated, navigate]);
  
  // 处理状态筛选变化
  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    fetchOrders(status === 'all' ? undefined : parseInt(status));
  };
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    fetchOrders(activeStatus === 'all' ? undefined : parseInt(activeStatus), page);
  };
  
  // 生成分页按钮
  const renderPagination = () => {
    if (!orders || orders.pages <= 1) return null;
    
    const pages = [];
    const totalPages = orders.pages;
    const current = orders.page;
    
    // 首页
    pages.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={current === 1}
        className={`px-3 py-1 rounded-md text-sm ${
          current === 1 
            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <i className="fa-solid fa-angle-left"></i>
        <i className="fa-solid fa-angle-left"></i>
      </button>
    );
    
    // 上一页
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
        className={`px-3 py-1 rounded-md text-sm ${
          current === 1 
            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <i className="fa-solid fa-angle-left"></i>
      </button>
    );
    
    // 页码
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, current + 2);
    
    // 确保显示5个页码
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm ${
            current === i 
              ? 'bg-red-600 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // 下一页
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages}
        className={`px-3 py-1 rounded-md text-sm ${
          current === totalPages 
            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <i className="fa-solid fa-angle-right"></i>
      </button>
    );
    
    // 末页
    pages.push(
      <button
        key="last"
        onClick={() => handlePageChange(totalPages)}
        disabled={current === totalPages}
        className={`px-3 py-1 rounded-md text-sm ${
          current === totalPages 
            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <i className="fa-solid fa-angle-right"></i>
        <i className="fa-solid fa-angle-right"></i>
      </button>
    );
    
    return (
      <div className="flex items-center justify-center space-x-1 mt-8">
        {pages}
      </div>
    );
  };
  
  if (!isAuthenticated) {
    return null; // 未登录时不渲染页面，会被重定向到登录页
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">我的订单</h1>
          <p className="text-gray-600 dark:text-gray-300">查看和管理您的所有订单</p>
        </div>
        
        {/* 订单状态筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeStatus === option.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 订单列表 */}
        {loading ? (
          <div className="py-16">
            <Loading size="medium" text="加载订单列表中..." />
          </div>
        ) : orders && orders.list.length > 0 ? (
          <div className="space-y-4">
            {orders.list.map(order => (
              <OrderItem key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Empty />
        )}
        
        {/* 分页 */}
        {renderPagination()}
      </main>
      
      <Footer />
    </div>
  );
}