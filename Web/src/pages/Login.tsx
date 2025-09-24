import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApi } from "@/api/user";
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [isMounted, setIsMounted] = useState(false);
  const abortControllerRef = useState<AbortController | null>(null);

  // 组件挂载状态管理
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // 组件卸载时取消所有未完成的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 安全更新状态的函数
  const safeSetState = useCallback(
    (callback: () => void) => {
      if (isMounted) {
        callback();
      }
    },
    [isMounted]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting || !isMounted) return;

      // 表单验证
      if (!username.trim()) {
        toast.error("请输入用户名");
        return;
      }

      if (!password.trim()) {
        toast.error("请输入密码");
        return;
      }

      // 创建新的AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        safeSetState(() => {
          setLoading(true);
          setIsSubmitting(true);
        });

        // 调用API
        const res = await userApi.login(username, password, {
          signal: abortController.signal,
        });

        // 检查组件是否仍挂载且请求未被取消
        if (!isMounted || abortController.signal.aborted) return;

        if (res.code === 200 && res.data && res.data.token) {
          // 保存token和用户信息
          localStorage.setItem("token", res.data.token);
          if (res.data.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }

          // 先显示成功消息，再导航
          toast.success("登录成功");

          // 使用setTimeout延迟导航，确保所有DOM更新完成
          setTimeout(() => {
            if (isMounted && !abortController.signal.aborted) {
              setIsAuthenticated(true);
              // 再次延迟导航，确保认证状态更新完成
              setTimeout(() => {
                if (isMounted) {
                  navigate("/");
                }
              }, 50);
            }
          }, 100);
        } else {
          toast.error(res.message || "登录失败，请重试");
          safeSetState(() => {
            setLoading(false);
            setIsSubmitting(false);
          });
        }
      } catch (error) {
        // 忽略取消操作导致的错误
        if (error.name !== "AbortError") {
          console.error("登录失败", error);
          toast.error("登录过程中出现错误，请重试");
        }
        safeSetState(() => {
          setLoading(false);
          setIsSubmitting(false);
        });
      }
    },
    [
      username,
      password,
      isSubmitting,
      isMounted,
      setIsAuthenticated,
      navigate,
      safeSetState,
    ]
  );

  // 如果组件已卸载，直接返回null避免渲染
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <i className="fa-solid fa-ticket text-3xl text-red-600 mr-2"></i>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                大麦抢票系统
              </h1>
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              用户登录
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* 用户名 */}
                <div className="mb-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    用户名
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="请输入用户名"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-lock text-gray-400"></i>
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="请输入密码"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* 登录按钮 */}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading || isSubmitting}
                  // 添加关键属性，帮助React识别组件
                  key="login-button"
                >
                  {loading ? (
                    <span key="loading-text">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      登录中...
                    </span>
                  ) : (
                    <span key="login-text">登录</span>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                还没有账号？{" "}
                <Link
                  to="/register"
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  立即注册
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
