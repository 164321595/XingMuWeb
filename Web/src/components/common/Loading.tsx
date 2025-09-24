interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ 
  size = 'medium', 
  text = '加载中...', 
  fullScreen = false 
}: LoadingProps) {
  // 确定加载动画大小
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-sm';
      case 'large':
        return 'w-16 h-16 text-xl';
      default: // medium
        return 'w-12 h-12 text-base';
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 bg-black/5 z-50' : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-red-600 ${sizeClasses}`}></div>
        {text && <span className={`mt-2 text-gray-600 dark:text-gray-400 ${sizeClasses.split(' ')[2]}`}>{text}</span>}
      </div>
    </div>
  );
}