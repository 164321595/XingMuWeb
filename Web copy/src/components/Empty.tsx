import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

// Empty component with improved styling
export function Empty() {
  const location = useLocation();
  
  // Determine empty state content based on current path
  const getEmptyContent = () => {
    if (location.pathname.includes('/orders')) {
      return {
        icon: 'fa-file-invoice',
        title: '暂无订单',
        description: '您还没有任何订单，快去抢购演出票吧！',
        buttonText: '浏览演出',
        path: '/performances'
      };
    } else if (location.pathname.includes('/performances')) {
      return {
        icon: 'fa-ticket',
        title: '暂无演出',
        description: '没有找到符合条件的演出，请尝试其他筛选条件',
        buttonText: '重置筛选',
        path: '/performances'
      };
    } else if (location.pathname === '/') {
      return {
        icon: 'fa-calendar-alt',
        title: '暂无数据',
        description: '当前没有热门演出和即将开售的演出',
        buttonText: '查看全部演出',
        path: '/performances'
      };
    }
    
    return {
      icon: 'fa-box-open',
      title: '暂无内容',
      description: '这里空空如也，快去探索更多内容吧',
      buttonText: '返回首页',
      path: '/'
    };
  };
  
  const content = getEmptyContent();
  
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center")}>
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <i className={`fa-solid ${content.icon} text-3xl`}></i>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{content.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{content.description}</p>
  <Link 
    to={content.path}
    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
  >
    {content.buttonText}
  </Link>
    </div>
  );
}