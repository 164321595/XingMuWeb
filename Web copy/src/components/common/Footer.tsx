import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">大麦抢票</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              提供便捷、安全的演出票务服务，让您轻松获取各类演出门票。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/performances" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">演出列表</Link></li>
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">关于我们</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">联系我们</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">帮助中心</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">常见问题</Link></li>
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">服务条款</Link></li>
              <li><Link to="/refund" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">退票政策</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">关注我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <i className="fa-brands fa-weixin text-xl"></i>
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <i className="fa-brands fa-weibo text-xl"></i>
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <i className="fa-brands fa-qq text-xl"></i>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">客服电话: 400-123-4567</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>© {new Date().getFullYear()} 大麦抢票系统 版权所有</p>
        </div>
      </div>
    </footer>
  );
}