import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Theater,
  Ticket,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  FileText,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';

const menuItems = [
  {
    title: '仪表盘',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: '演出管理',
    path: '/admin/performances',
    icon: Theater,
    children: [
      { title: '演出列表', path: '/admin/performances' },
      { title: '添加演出', path: '/admin/performances/create' },
    ],
  },
  {
    title: '票种管理',
    path: '/admin/tickets',
    icon: Ticket,
  },
  {
    title: '订单管理',
    path: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: '用户管理',
    path: '/admin/users',
    icon: Users,
  },
  {
    title: '分类管理',
    path: '/admin/categories',
    icon: BarChart3,
  },
  {
    title: '系统配置',
    path: '/admin/settings',
    icon: Settings,
  },
  {
    title: '操作日志',
    path: '/admin/logs',
    icon: FileText,
  },
  {
    title: '管理员',
    path: '/admin/admins',
    icon: Shield,
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('admin_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const info = localStorage.getItem('admin_info');
    if (info) {
      try {
        setAdminInfo(JSON.parse(info));
      } catch (e) {
        localStorage.removeItem('admin_info');
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('admin_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    navigate('/admin/login');
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col h-full`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-red-500">大麦网</h1>
          ) : (
            <span className="text-2xl">🎫</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <div key={item.path}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.path)}
                    className={`w-full flex items-center px-6 py-3 hover:bg-gray-800 transition ${
                      isActive(item.path) ? 'bg-gray-800 text-red-400 border-r-2 border-red-500' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition ${expandedMenus.includes(item.path) ? 'rotate-180' : ''}`}
                        />
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.path) && (
                    <div className="bg-gray-800">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-12 py-2 text-sm hover:bg-gray-700 transition ${
                            isActive(child.path) ? 'text-red-400' : ''
                          }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 hover:bg-gray-800 transition ${
                    isActive(item.path) ? 'bg-gray-800 text-red-400 border-r-2 border-red-500' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">退出登录</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              欢迎，{adminInfo?.real_name || adminInfo?.username || '管理员'}
            </span>
            <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-medium">
              {adminInfo?.real_name?.[0] || adminInfo?.username?.[0] || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
