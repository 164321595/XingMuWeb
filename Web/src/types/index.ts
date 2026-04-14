export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  phone: string;
  email: string;
  avatar: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface Performance {
  id: number;
  title: string;
  category_id: number;
  cover_image: string;
  description: string;
  performer: string;
  venue: string;
  start_time: string;
  end_time: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number;
  sort: number;
}

export interface TicketType {
  id: number;
  performance_id: number;
  name: string;
  price: number;
  stock: number;
  total: number;
  sale_start_time: string;
  sale_end_time: string;
  status: number;
}

export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  performance_id: number;
  ticket_type_id: number;
  quantity: number;
  amount: number;
  status: number;
  expire_time: string;
  payment_time?: string;
  created_at: string;
  updated_at: string;
  performance?: Performance;
  ticket_type?: TicketType;
}

export interface PrivacySettings {
  dataCollection: boolean;
  personalizedAds: boolean;
  thirdPartySharing: boolean;
  marketingEmails: boolean;
}
