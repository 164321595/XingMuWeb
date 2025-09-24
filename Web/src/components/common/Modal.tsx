import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOutsideClick?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnOutsideClick = true,
  size = 'medium'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // 点击外部关闭模态框
  const handleOutsideClick = (e: MouseEvent) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // 按ESC键关闭模态框
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // 恢复背景滚动
    };
  }, [isOpen]);
  
  // 确定模态框大小
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'max-w-md w-full';
      case 'large':
        return 'max-w-3xl w-full';
      case 'full':
        return 'max-w-5xl w-full max-h-[90vh]';
      default: // medium
        return 'max-w-2xl w-full';
    }
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOutsideClick}>
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 animate-fade-in-up ${getSizeClass()}`}
      >
        {/* 头部 */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}
        
        {/* 内容 */}
        <div className={`p-6 ${size === 'full' ? 'max-h-[calc(90vh-120px)] overflow-y-auto' : ''}`}>
          {children}
        </div>
        
        {/* 底部 */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}