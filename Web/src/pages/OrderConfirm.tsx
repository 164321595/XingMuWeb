import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '@/api/order';
import { Order } from '@/types';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Loading from '@/components/common/Loading';
import OrderForm from '@/components/order/OrderForm';

export default function OrderConfirm() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
      navigate('/login', { state: { from: `/order/confirm/${id}` } });
      return;
    }
    
    fetchOrderDetail();
  }, [id, isAuthenticated, navigate]);
  
  // 订单状态变化后的回调
  const handleOrderStatusChange = () => {
    fetchOrderDetail();
  };
  
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
          <div className="text-center">
            <i className="fa-solid fa-exclamation-circle text-4xl text-yellow-500 mb-4"></i>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">订单不存在</h2>
            <button 
              onClick={() => navigate('/orders')}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              查看我的订单
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">订单确认</h1>
            <p className="text-gray-600 dark:text-gray-300">请确认订单信息并完成支付</p>
          </div>
          
          <OrderForm order={order} onSuccess={handleOrderStatusChange} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}