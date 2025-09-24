import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApi } from "@/api/user";
import { toast } from "sonner";
import { z } from "zod";

// 表单验证schema
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(20, "用户名最多20个字符"),
  password: z.string().min(6, "密码至少6个字符").max(20, "密码最多20个字符"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  email: z.string().email("请输入有效的邮箱地址"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    safeSetState(() => {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // 清除对应字段的错误信息
      if (errors[name as keyof RegisterFormData]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || !isMounted) return;

    // 表单验证
    try {
      registerSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof RegisterFormData;
          fieldErrors[field] = err.message;
        });
        safeSetState(() => setErrors(fieldErrors));
        return;
      }
    }

    // 创建新的AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      safeSetState(() => {
        setLoading(true);
        setIsSubmitting(true);
      });

      const res = await userApi.register(formData, {
        signal: abortController.signal,
      });

      // 检查组件是否仍挂载且请求未被取消
      if (!isMounted || abortController.signal.aborted) return;

      if (res.code === 200) {
        toast.success("注册成功，请登录");
        // 延迟导航，确保所有DOM更新完成
        setTimeout(() => {
          if (isMounted && !abortController.signal.aborted) {
            navigate("/login", { replace: true });
          }
        }, 100);
      } else {
        // 1001 用户已存在
        toast.error(res.message || "注册失败，请重试");
        safeSetState(() => {
          setLoading(false);
          setIsSubmitting(false);
        });
      }
    } catch (error) {
      // 忽略取消操作导致的错误
      if (error.name !== "AbortError") {
        console.error("注册失败", error);
        toast.error("注册过程中出现错误，请重试");
      }
      safeSetState(() => {
        setLoading(false);
        setIsSubmitting(false);
      });
    }
  };

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
              用户注册
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
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.username
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:ring-red-500"
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="请输入用户名"
                      disabled={loading}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* 密码 */}
                <div className="mb-4">
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:ring-red-500"
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="请输入密码"
                      disabled={loading}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 手机号 */}
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-phone text-gray-400"></i>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:ring-red-500"
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="请输入手机号"
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* 邮箱 */}
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    邮箱
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-envelope text-gray-400"></i>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:ring-red-500"
                      } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="请输入邮箱"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 注册按钮 */}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading || isSubmitting}
                  key="register-button"
                >
                  {loading ? (
                    <span key="loading-text">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      注册中...
                    </span>
                  ) : (
                    <span key="register-text">注册</span>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                已有账号？{" "}
                <Link
                  to="/login"
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  立即登录
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
