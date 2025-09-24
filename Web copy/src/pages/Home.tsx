import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi } from '@/api/performance';
import { Performance, PaginationResult } from '@/types';
import PerformanceCard from '@/components/performance/PerformanceCard';
import Loading from '@/components/common/Loading';
import { Empty } from '@/components/Empty';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function Home() {
  const [hotPerformances, setHotPerformances] = useState<Performance[]>([]);
  const [upcomingPerformances, setUpcomingPerformances] = useState<Performance[]>([]);
  const [allUpcomingPerformances, setAllUpcomingPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotLoading, setHotLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  
  useEffect(() => {
    // 获取热门演出和即将上映演出
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
      // 获取热门演出（显示所有时间的演出）
      setHotLoading(true);
      // 增加获取数量，确保有足够数据
      const hotRes = await performanceApi.getPerformances({ page: 1, size: 30 });
      console.log('热门演出数据:', hotRes);
      if (hotRes.code === 200) {
        // 优化热门分数计算函数
        const calculatePopularityScore = (performance: Performance) => {
          if (!performance.ticket_types || performance.ticket_types.length === 0) {
            return 0;
          }
          
          // 找出价格最高的票种
          const highestPricedTicket = [...performance.ticket_types]
            .sort((a, b) => b.price - a.price)[0];
          
          // 计算价格得分 (归一化处理)
          const maxPossiblePrice = 5000; // 假设最高票价为5000元
          const priceScore = highestPricedTicket.price / maxPossiblePrice;
          
          // 计算库存得分 (库存越少得分越高，归一化处理)
          const maxPossibleStock = 1000; // 假设最大库存为1000张
          const stockScore = 1 - (highestPricedTicket.stock / maxPossibleStock);
          
          // 综合得分 (价格权重60%，库存权重40%)
          return (priceScore * 0.6) + (stockScore * 0.4);
        };
        
        // 热门演出：只显示预售(1)和在售(2)状态的演出，按热门分数排序
        const sortedHot = [...hotRes.data.list]
          .filter(p => p.status === 1 || p.status === 2) // 只显示预售和在售状态
          .sort((a, b) => calculatePopularityScore(b) - calculatePopularityScore(a)); // 按热门分数降序排列
        
        // 限制显示6个
        setHotPerformances(sortedHot.slice(0, 12));
      }
        
     // 获取即将开售演出（放宽筛选条件）
     setUpcomingLoading(true);
     // 获取更多演出，不限制状态
      // 获取即将开售演出（只包含未来的演出）
      // 增加获取数量，确保有足够数据
      const upcomingRes = await performanceApi.getPerformances({ page: 1, size: 30 });
      
      // 筛选出未来的演出并按时间排序
      if (upcomingRes.code === 200) {
        // 筛选出当前时间之后的演出，包含所有状态
        const futurePerformances = [...upcomingRes.data.list]
          .filter(p => new Date(p.start_time) > new Date())
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()); // 按时间升序排列
       
        setAllUpcomingPerformances(futurePerformances);
        setUpcomingPerformances(futurePerformances.slice(0, 6));
      }
        

      } catch (error) {
        console.error('获取首页数据失败', error);
        // 错误情况下仍然显示空状态，避免整个页面崩溃
        setHotPerformances([]);
        setUpcomingPerformances([]);
      } finally {
        setHotLoading(false);
        setUpcomingLoading(false);
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 轮播图 */}
        <div className="relative rounded-xl overflow-hidden mb-10">
          <div className="aspect-[16/9] bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">热门演出抢先购</h2>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                最新、最热门的演出门票，尽在大麦抢票系统，让您不错过任何精彩
              </p>
              <Link 
                to="/performances"
                className="inline-block bg-white text-red-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                浏览全部演出
              </Link>
            </div>
          </div>
        </div>
        
        {/* 热门演出 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">热门演出</h2>
            <Link 
              to="/performances"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center"
            >
              查看更多 <i className="fa-solid fa-angle-right ml-1"></i>
            </Link>
          </div>
          
          {hotLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse h-64"></div>
              ))}
            </div>
          ) : hotPerformances.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {hotPerformances.map(performance => (
                <PerformanceCard key={performance.id} performance={performance} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">暂无热门演出</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                当前没有正在热售的演出，敬请期待
              </p>
              <Link 
                to="/performances"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                浏览全部演出
              </Link>
            </div>
          )}
        </section>
        
        {/* 即将开售 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">即将开售</h2>
            <Link 
              to="/performances"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center"
            >
              查看更多 <i className="fa-solid fa-angle-right ml-1"></i>
            </Link>
          </div>
          
          {upcomingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse h-64"></div>
              ))}
            </div>
          ) : upcomingPerformances.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {upcomingPerformances.map(performance => (
                <PerformanceCard key={performance.id} performance={performance} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">暂无即将开售演出</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                目前没有即将开售的演出，请稍后再来查看
              </p>
              <Link 
                to="/performances"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                浏览全部演出
              </Link>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}