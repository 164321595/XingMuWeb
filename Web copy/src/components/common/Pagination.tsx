import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = ''
}) => {
  // 计算总页数
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // 如果只有一页，不显示分页控件
  if (totalPages <= 1) {
    return null;
  }

  // 处理页码点击
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // 生成分页按钮
  const renderPageButtons = () => {
    const buttons = [];
    
    // 首页按钮
    buttons.push(
      <button
        key="first"
        onClick={() => handlePageClick(1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm border transition-colors ${currentPage === 1 ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 hover:border-red-500 hover:text-red-600'}
        dark:${currentPage === 1 ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-700 hover:border-red-500 hover:text-red-400'}`}
      >
        <i className="fa-solid fa-angle-left"></i>
        <i className="fa-solid fa-angle-left ml-1"></i>
      </button>
    );
    
    // 上一页按钮
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm border transition-colors ${currentPage === 1 ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 hover:border-red-500 hover:text-red-600'}
        dark:${currentPage === 1 ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-700 hover:border-red-500 hover:text-red-400'}`}
      >
        <i className="fa-solid fa-angle-left"></i>
      </button>
    );
    
    // 页码按钮
    // 简单的页码展示逻辑，实际项目中可以根据需要调整
    const displayRange = 2; // 当前页前后显示的页数
    
    for (let i = 1; i <= totalPages; i++) {
      // 总是显示第一页和最后一页
      if (i === 1 || i === totalPages) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`mx-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === i ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}
            dark:${currentPage === i ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          >
            {i}
          </button>
        );
        
        // 如果第一页和当前页之间有间隔，显示省略号
        if (i === 1 && currentPage > displayRange + 2) {
          buttons.push(
            <span key="ellipsis1" className="mx-1 text-gray-500">...</span>
          );
        }
        
        // 如果最后一页和当前页之间有间隔，显示省略号
        if (i === totalPages && currentPage < totalPages - displayRange - 1) {
          buttons.push(
            <span key="ellipsis2" className="mx-1 text-gray-500">...</span>
          );
        }
      }
      // 显示当前页附近的页码
      else if (i >= currentPage - displayRange && i <= currentPage + displayRange) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`mx-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === i ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}
            dark:${currentPage === i ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          >
            {i}
          </button>
        );
      }
    }
    
    // 下一页按钮
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm border transition-colors ${currentPage === totalPages ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 hover:border-red-500 hover:text-red-600'}
        dark:${currentPage === totalPages ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-700 hover:border-red-500 hover:text-red-400'}`}
      >
        <i className="fa-solid fa-angle-right"></i>
      </button>
    );
    
    // 末页按钮
    buttons.push(
      <button
        key="last"
        onClick={() => handlePageClick(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm border transition-colors ${currentPage === totalPages ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 hover:border-red-500 hover:text-red-600'}
        dark:${currentPage === totalPages ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-700 hover:border-red-500 hover:text-red-400'}`}
      >
        <i className="fa-solid fa-angle-right"></i>
        <i className="fa-solid fa-angle-right ml-1"></i>
      </button>
    );
    
    return buttons;
  };

  return (
    <div className={`flex flex-col items-center mt-8 ${className}`}>
      <div className="flex items-center space-x-2">
        {renderPageButtons()}
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        第 {currentPage} / {totalPages} 页，共 {totalItems} 条记录
      </div>
    </div>
  );
};

export default Pagination;