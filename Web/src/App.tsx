import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { userApi } from '@/api/user';

// 页面导入
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Performances from "@/pages/Performances";
import PerformanceDetail from "@/pages/PerformanceDetail";
import TicketSeckill from "@/pages/TicketSeckill";
import OrderConfirm from "@/pages/OrderConfirm";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import UserProfile from "@/pages/UserProfile";
import AccountSettings from "@/pages/AccountSettings";

// 管理员页面导入
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import PerformanceList from "@/pages/admin/PerformanceList";
import PerformanceForm from "@/pages/admin/PerformanceForm";
import OrderList from "@/pages/admin/OrderList";
import UserList from "@/pages/admin/UserList";
import CategoryList from "@/pages/admin/CategoryList";
import TicketTypeList from "@/pages/admin/TicketTypeList";
import SystemSettings from "@/pages/admin/SystemSettings";
import LogList from "@/pages/admin/LogList";
import AdminList from "@/pages/admin/AdminList";

// 错误边界组件
import ErrorBoundary from "@/components/common/ErrorBoundary";

// 私有路由组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 管理员路由组件
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    userApi.logout();
    setIsAuthenticated(false);
  };

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await userApi.getCurrentUser();
        setIsAuthenticated(res.code === 200);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout, loading }}
    >
      <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/performances" element={<Performances />} />
        <Route path="/performances/:id" element={<PerformanceDetail />} />

        {/* 需要登录的路由 */}
        <Route path="/ticket/seckill/:id" element={
          <PrivateRoute>
            <ErrorBoundary>
              <TicketSeckill />
            </ErrorBoundary>
          </PrivateRoute>
        } />
        <Route path="/order/confirm/:id" element={
          <PrivateRoute>
            <OrderConfirm />
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        } />
        <Route path="/orders/:id" element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        } />
         <Route path="/user/profile" element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } />
        <Route path="/account/settings" element={
          <PrivateRoute>
            <AccountSettings />
          </PrivateRoute>
        } />

        {/* 管理员路由 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="performances" element={<PerformanceList />} />
          <Route path="performances/create" element={<PerformanceForm />} />
          <Route path="performances/:id/edit" element={<PerformanceForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="tickets" element={<TicketTypeList />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="logs" element={<LogList />} />
          <Route path="admins" element={<AdminList />} />
        </Route>

        {/* 404路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}