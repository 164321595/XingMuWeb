import api, { ApiResponse } from './index';
import { TicketType } from '@/types';

export const ticketApi = {
  // 获取演出票种列表
  async getTicketTypes(performanceId: number): Promise<ApiResponse<TicketType[]>> {
    return api.request.get<TicketType[]>(`/tickets/performance/${performanceId}`);
  },
  
  // 抢票接口
  async seckillTicket(ticketTypeId: number, quantity: number): Promise<ApiResponse<{
    order_id: number;
    order_no: string;
    amount: number;
    expire_time: string;
  }>> {
    return api.request.post<{
      order_id: number;
      order_no: string;
      amount: number;
      expire_time: string;
    }>('/tickets/seckill', { ticketTypeId, quantity });
  }
};