import { useState, useEffect } from "react";
import { performanceApi } from "@/api/performance";
import { Performance } from "@/types";
import PerformanceList from "@/components/performance/PerformanceList";
import PerformanceFilter from "@/components/performance/PerformanceFilter";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Loading from "@/components/common/Loading";
import Pagination from "@/components/common/Pagination";
import { toast } from "sonner";

export default function Performances() {
  // 状态管理
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [keyword, setKeyword] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<number>();
  const [loading, setLoading] = useState(true);

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 默认每页10条，将从API响应获取实际值
  const [totalItems, setTotalItems] = useState(0);

  // 获取演出列表（支持分页）
  const fetchPerformances = async (
    page: number = 1
  ) => {
    try {
      setLoading(true);

      const res = await performanceApi.getPerformances({
        category_id: selectedCategory,
        keyword: keyword,
        status: selectedStatus,
        page,
        size: pageSize, // 使用当前页大小
      });

      if (res.code === 200) {
        // 从API响应获取分页信息
        const paginationData = res.data;
        const performanceList = Array.isArray(paginationData)
          ? paginationData
          : paginationData.list || [];

        // 更新每页大小（如果API返回）
        if (!Array.isArray(paginationData) && paginationData.size) {
          setPageSize(paginationData.size);
        }

        // 更新总项目数（如果API返回）
        if (
          !Array.isArray(paginationData) &&
          paginationData.total !== undefined
        ) {
          setTotalItems(paginationData.total);
        } else if (Array.isArray(paginationData)) {
          setTotalItems(paginationData.length);
        }

        // 设置当前页数据
        setPerformances(performanceList);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("获取演出列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理筛选条件变化
  const handleFilterChange = (
    categoryId?: number,
    keyword?: string,
    status?: number
  ) => {
    setSelectedCategory(categoryId);
    setKeyword(keyword);
    setSelectedStatus(status);
  };

  // 当筛选条件变化时重新获取数据
  useEffect(() => {
    // 筛选条件变化时，重置为第一页
    fetchPerformances(1);
  }, [selectedCategory, keyword, selectedStatus]);

  // 处理页码变化
  const handlePageChange = (page: number) => {
    fetchPerformances(page);
  };

  return (
    <div className="min-h-screen flex-col bg-gray-50 dark:bg-gray-900 flex">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            演出列表
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            发现最新、最热门的演出活动
          </p>
        </div>

        {/* 筛选器 */}
        <PerformanceFilter onFilterChange={handleFilterChange} />

        {/* 演出列表 */}
        <PerformanceList performances={performances} loading={loading} />

        {/* 分页组件 */}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
