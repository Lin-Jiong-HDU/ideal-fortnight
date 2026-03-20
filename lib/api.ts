const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 统一请求处理
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 未授权 - 清除 token，跳转登录
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    // 其他错误
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}

// API 方法
export const api = {
  // 认证
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // 工单
  getTickets: () =>
    request<Ticket[]>('/tickets'),

  getTicket: (id: string) =>
    request<Ticket>(`/tickets/${id}`),

  createTicket: (data: {
    projectId: string;
    title: string;
    content: string;
    sourceType?: string;
    sourceFileUrl?: string;
    needReview?: boolean;
  }) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reviewTicket: (id: string, approved: boolean, comment: string) =>
    request<{ message: string }>(`/tickets/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, comment }),
    }),

  // 客户
  getCustomerMe: () =>
    request<Customer>('/customers/me'),
};

export type { Ticket, Customer, Project, User, TicketStatus } from './types';
