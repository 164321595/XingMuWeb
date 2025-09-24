import api, { ApiResponse } from './index';
import { Order, PaginationResult, Ticket } from '@/types';

export const orderApi = {
  // 创建订单（从抢票结果创建）
  async createOrderFromSeckill(orderId: number): Promise<ApiResponse<Order>> {
    return api.request.post<Order>('/orders/from-seckill', { orderId });
  },
  
  // 获取订单详情
  async getOrderDetail(id: number): Promise<ApiResponse<Order>> {
    return api.request.get<Order>(`/orders/${id}`);
  },
  
  // 获取用户订单列表
  async getUserOrders(params: {
    status?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginationResult<Order>>> {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params.status !== undefined) {
      queryParams.append('status', params.status.toString());
    }
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.request.get<PaginationResult<Order>>(`/orders${queryString}`);
  },
  
  // 取消订单
  async cancelOrder(id: number): Promise<ApiResponse<{}>> {
    return api.request.post<{}>(`/orders/${id}/cancel`);
  },
  
  // 支付订单
  async payOrder(id: number): Promise<ApiResponse<{
    payment_time: string;
    tickets: Ticket[];
  }>> {
    return api.request.post<{ payment_time: string; tickets: Ticket[] }>(`/orders/${id}/pay`);
  },
  
  // 退款订单
  async refundOrder(id: number): Promise<ApiResponse<{}>> {
    return api.request.post<{}>(`/orders/${id}/refund`);
  }
};