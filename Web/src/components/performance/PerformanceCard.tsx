import { Link } from "react-router-dom";
import { Performance } from "@/types";
import { getImagePath } from "@/utils/imageAssets";

interface PerformanceCardProps {
  performance: Performance;
}

export default function PerformanceCard({ performance }: PerformanceCardProps) {
  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 获取演出状态文本
  const getStatusText = (status: number) => {
    const statusMap = {
      0: "未开售",
      1: "预售",
      2: "在售",
      3: "售罄",
      4: "已结束",
    };

    return statusMap[status as keyof typeof statusMap] || "未知状态";
  };

  // 获取演出状态样式（标签）
  const getStatusClass = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 2:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 3:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 4:
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // 获取卡片背景样式
  const getCardBackgroundClass = (status: number) => {
    switch (status) {
      case 0: // 未开售
        return "bg-yellow-100 dark:bg-yellow-950/70";
      case 1: // 预售
        return "bg-blue-100 dark:bg-blue-950/70";
      case 2: // 在售
        return "bg-green-100 dark:bg-green-950/70";
      case 3: // 售罄
        return "bg-red-100 dark:bg-red-950/70";
      case 4: // 已结束
        return "bg-gray-100 dark:bg-gray-950/70";
      default:
        return "bg-white/90 dark:bg-gray-800/90";
    }
  };

  return (
    <Link
      to={`/performances/${performance.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`group ${getCardBackgroundClass(
        performance.status
      )} rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* 演出封面 */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={getImagePath(performance.cover_image)}
          alt={performance.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* 状态标签 */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
            performance.status
          )}`}
        >
          {getStatusText(performance.status)}
        </div>
      </div>

      {/* 演出信息 */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {performance.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {performance.performer}
        </p>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
          <i className="fa-solid fa-map-marker-alt mr-1"></i>
          <span className="line-clamp-1">{performance.venue}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <i className="fa-solid fa-calendar mr-1"></i>
          <span>{formatDateTime(performance.start_time)}</span>
        </div>
      </div>
    </Link>
  );
}
