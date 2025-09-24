import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApi } from "@/api/user";
import { User } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { DEFAULT_AVATAR, getImagePath } from "@/utils/imageAssets";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // 获取当前登录用户信息
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const res = await userApi.getCurrentUser();
        if (res.code === 200) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        // 只有当错误信息不包含"未认证"时才输出错误日志
        if (!(error instanceof Error && error.message?.includes("未认证"))) {
          console.error("获取用户信息失败", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    userApi.logout();
    setUser(null);
    navigate("/login");
  };

  // 关闭移动菜单并导航
  const navigateAndCloseMenu = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <i className="fa-solid fa-ticket text-2xl text-red-600"></i>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              大麦抢票
            </span>
          </Link>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {mobileMenuOpen ? (
              <i className="fa-solid fa-times text-xl"></i>
            ) : (
              <i className="fa-solid fa-bars text-xl"></i>
            )}
          </button>

          {/* 导航链接 - 桌面端 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              首页
            </Link>
            <Link
              to="/performances"
              className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              演出列表
            </Link>
            <Link
              to="/orders"
              className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              我的订单
            </Link>
          </nav>

          {/* 用户区域 - 桌面端 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={
                theme === "light" ? "切换到深色模式" : "切换到浅色模式"
              }
            >
              {theme === "light" ? (
                <i className="fa-solid fa-moon text-gray-700"></i>
              ) : (
                <i className="fa-solid fa-sun text-yellow-400"></i>
              )}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <img
                    src={getImagePath(user.avatar)}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      // 图片加载失败时使用默认头像
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <span className="text-gray-700 dark:text-gray-200">
                    {user.username}
                  </span>
                  <i className="fa-solid fa-chevron-down text-xs text-gray-500 dark:text-gray-400"></i>
                </button>

                {/* 下拉菜单 */}
                <div className="absolute right-0  w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 hidden group-hover:block transition-all duration-300 delay-150 transform origin-top-right scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                  <Link
                    to="/user/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <i className="fa-solid fa-user mr-2"></i>个人中心
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <i className="fa-solid fa-list-alt mr-2"></i>我的订单
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2"></i>退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg z-40 animate-fade-in-down">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => navigateAndCloseMenu("/")}
            >
              <i className="fa-solid fa-home mr-2"></i>首页
            </Link>
            <Link
              to="/performances"
              className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => navigateAndCloseMenu("/performances")}
            >
              <i className="fa-solid fa-ticket mr-2"></i>演出列表
            </Link>
            <Link
              to="/orders"
              className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => navigateAndCloseMenu("/orders")}
            >
              <i className="fa-solid fa-list-alt mr-2"></i>我的订单
            </Link>
            {user ? (
              <>
                <Link
                  to="/user/profile"
                  className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => navigateAndCloseMenu("/user/profile")}
                >
                  <i className="fa-solid fa-user mr-2"></i>个人中心
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2"></i>退出登录
                </button>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label={
                      theme === "light" ? "切换到深色模式" : "切换到浅色模式"
                    }
                  >
                    {theme === "light" ? (
                      <i className="fa-solid fa-moon mr-2"></i>
                    ) : (
                      <i className="fa-solid fa-sun mr-2"></i>
                    )}
                    {theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/login"
                  className="block px-4 py-2 rounded-md text-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => navigateAndCloseMenu("/login")}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 rounded-md text-center text-white bg-red-600 hover:bg-red-700"
                  onClick={() => navigateAndCloseMenu("/register")}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
