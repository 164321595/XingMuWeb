import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态，使下一次渲染显示降级UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 可以将错误信息发送到错误日志服务
    console.error('React组件错误:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 可以自定义错误UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-center max-w-md">
            <i className="fa-solid fa-triangle-exclamation text-5xl text-yellow-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">发生了错误</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              页面加载过程中出现了问题，请尝试刷新页面。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              刷新页面
            </button>
            
            {/* 在开发环境显示更多错误信息 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-left text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">错误详情:</p>
                <p className="text-gray-800 dark:text-gray-200 mb-2">{this.state.error?.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 正常情况下，渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;