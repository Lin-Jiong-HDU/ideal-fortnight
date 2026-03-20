import type { Ticket, Customer, Project, User, UserRole, CreateTicketRequest, OptimizationRecord, OptimizationStrategy, TargetAI } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 统一请求处理
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 确保只在浏览器环境获取 token
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 添加 Authorization header（仅在 token 存在时）
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Request with token:', token.substring(0, 20) + '...');
  } else {
    console.log('[API] Request without token:', endpoint);
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

  // 客户工单 API (仅 customer 角色)
  customer: {
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
  },

  // 优化器工单 API (admin 和 optimizer 角色)
  optimizer: {
    getTickets: () =>
      request<Ticket[]>('/optimizer/tickets'),

    claimTicket: (id: string) =>
      request<{ message: string }>(`/optimizer/tickets/${id}/claim`, {
        method: 'POST',
      }),

    processTicket: (id: string) =>
      request<{ message: string }>(`/optimizer/tickets/${id}/process`, {
        method: 'POST',
      }),

    optimizeTicket: (id: string, data: {
      strategies: string[];
      targetAI: string[];
      keywords: string[];
    }) =>
      request<{
        id: string;
        optimizedContent: string;
        scoreBefore: number;
        scoreAfter: number;
        strategies: string[];
        targetAI: string[];
        keywords: string[];
      }>(`/optimizer/tickets/${id}/optimize`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    submitTicketResult: (id: string, data: {
      optimizedContent: string;
      scoreBefore: number;
      scoreAfter: number;
    }) =>
      request<{ message: string }>(`/optimizer/tickets/${id}/result`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deliverTicket: (id: string) =>
      request<{ message: string }>(`/optimizer/tickets/${id}/deliver`, {
        method: 'POST',
      }),

    // 优化历史记录
    getTicketOptimizations: (ticketId: string) =>
      request<OptimizationRecord[]>(`/optimizer/tickets/${ticketId}/optimizations`),
  },

  // 客户信息
  getCustomerMe: () =>
    request<Customer>('/customers/me'),

  // 向后兼容的别名（默认使用 customer API）
  getTickets: () => request<Ticket[]>('/tickets'),
  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),
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
};

export type { Ticket, Customer, Project, User, TicketStatus, OptimizationRecord } from './types';
