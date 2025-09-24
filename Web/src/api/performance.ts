import api, { ApiResponse } from "./index";
import { Category, Performance, PaginationResult } from "@/types";

export const performanceApi = {
  // 获取演出分类
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return api.request.get<Category[]>("/performances/categories");
  },

  // 获取演出列表
  async getPerformances(params: {
    category_id?: number;
    keyword?: string;
    page?: number;
    size?: number;
    status?: number;
  }): Promise<ApiResponse<Performance[] | PaginationResult<Performance>>> {
    // 构建查询参数
    const queryParams = new URLSearchParams();

    if (params.category_id !== undefined) {
      queryParams.append("categoryId", params.category_id.toString());
    }

    if (params.keyword) {
      queryParams.append("keyword", params.keyword);
    }

    if (params.status !== undefined) {
      queryParams.append("status", params.status.toString());
    }

    if (params.page !== undefined && params.size !== undefined) {
      queryParams.append("page", params.page.toString());
      queryParams.append("pageSize", params.size.toString());
    }

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";
    return api.request.get<Performance[] | PaginationResult<Performance>>(
      `/performances${queryString}`
    );
  },

  // 获取演出详情
  async getPerformanceDetail(id: number): Promise<ApiResponse<Performance>> {
    const response = await api.request.get<{
      code: number;
      message: string;
      data: {
        performance: Performance,
        ticketTypes: any[]
      }
    }>(`/performances/${id}`);
    
    // 确保返回的数据格式符合前端预期
    if (response.code === 200 && response.data && response.data.performance) {
      // 将ticketTypes添加到performance对象中
      const performanceWithTickets = {
        ...response.data.performance,
        ticket_types: response.data.ticketTypes || []
      };
      return {
        ...response,
        data: performanceWithTickets
      };
    }
    return response;
  },

  // 更新票种库存
  async updateTicketStock(
    performanceId: number,
    ticketTypeId: number,
    quantity: number
  ): Promise<boolean> {
    try {
      const response = await api.request.post<{ success: boolean }>(
        `/performances/${performanceId}/tickets/${ticketTypeId}/update-stock`,
        { quantity }
      );

      return response.data.success;
    } catch (error) {
      console.error("更新票种库存失败", error);
      return false;
    }
  },
};
