import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import { performanceApi } from '@/api/performance';
import Loading from '../common/Loading';

interface PerformanceFilterProps {
  onFilterChange: (categoryId?: number, keyword?: string, status?: number) => void;
}

export default function PerformanceFilter({ 
  onFilterChange 
}: PerformanceFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();
  
  // 获取演出分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await performanceApi.getCategories();
        if (res.code === 200) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error('获取演出分类失败', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 当筛选条件变化时触发回调
  useEffect(() => {
    onFilterChange(selectedCategory, keyword, selectedStatus);
  }, [selectedCategory, keyword, selectedStatus, onFilterChange]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const categoryId = value === 'all' ? undefined : parseInt(value);
    setSelectedCategory(categoryId);
  };
  
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
  };
  
  const handleClearSearch = () => {
    setKeyword('');
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const status = value === 'all' ? undefined : parseInt(value);
    setSelectedStatus(status);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 分类筛选 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">演出分类</label>
          <div className="relative">
            {loading ? (
              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : (
              <select
                value={selectedCategory?.toString() || 'all'}
                onChange={handleCategoryChange}
                className="w-full h-10 px-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white appearance-none"
              >
                <option value="all">全部分类</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <i className="fa-solid fa-chevron-down text-gray-400"></i>
            </div>
          </div>
        </div>
        
        {/* 状态筛选 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">演出状态</label>
          <div className="relative">
            <select
              value={selectedStatus?.toString() || 'all'}
              onChange={handleStatusChange}
              className="w-full h-10 px-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">全部状态</option>
              <option value="1">预售</option>
              <option value="2">在售</option>
              <option value="3">售罄</option>
              <option value="4">已结束</option>
              <option value="0">未开售</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <i className="fa-solid fa-chevron-down text-gray-400"></i>
            </div>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">搜索演出</label>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索演出名称或表演者..."
              value={keyword}
              onChange={handleKeywordChange}
              className="w-full h-10 pl-10 pr-10 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fa-solid fa-search text-gray-400"></i>
            </div>
            {keyword && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}