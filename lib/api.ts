import type { Ticket, Customer, Project, User, UserRole, CreateTicketRequest, OptimizationRecord, OptimizationStrategy, TargetAI, QuotaPackage, QuotaHistory } from '@/lib/types';

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

    getProjects: () =>
      // 使用 customer 专用端点获取当前客户的项目列表
      request<Project[]>('/customers/me/projects'),

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
    getTickets: (status?: 'pending' | 'assigned' | 'processing' | 'reviewing' | 'completed' | 'all') =>
      request<Ticket[]>(status ? `/optimizer/tickets?status=${status}` : '/optimizer/tickets'),

    getMyTickets: () =>
      request<Ticket[]>('/optimizer/tickets/mine'),

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

  // 管理员 API
  admin: {
    // 用户管理
    getUsers: () =>
      request<User[]>('/users'),

    getUser: (id: string) =>
      request<User>(`/users/${id}`),

    createUser: (data: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
    }) =>
      request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    deleteUser: (id: string) =>
      request<{ message: string }>(`/users/${id}`, {
        method: 'DELETE',
      }),

    // 客户管理
    getCustomers: () =>
      request<Customer[]>('/customers'),

    getCustomer: (id: string) =>
      request<Customer>(`/customers/${id}`),

    createCustomer: (data: {
      userId: string;
      companyName: string;
      contactPhone?: string;
      industry?: string;
      notes?: string;
    }) =>
      request<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateCustomer: (id: string, data: {
      companyName?: string;
      contactPhone?: string;
      industry?: string;
      notes?: string;
    }) =>
      request<Customer>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // 配额管理
    getQuotaPackages: () =>
      request<QuotaPackage[]>('/quota-packages'),

    createQuotaPackage: (data: {
      name: string;
      articles: number;
      price: number;
      validDays: number;
    }) =>
      request<QuotaPackage>('/quota-packages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateQuotaPackage: (id: string, data: {
      name?: string;
      articles?: number;
      price?: number;
    }) =>
      request<QuotaPackage>(`/quota-packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    rechargeQuota: (customerId: string, data: {
      packageId: string;
      remark: string;
    }) =>
      request<{ message: string }>(`/customers/${customerId}/quota`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getQuotaHistory: (customerId: string) =>
      request<QuotaHistory[]>(`/customers/${customerId}/quota/history`),

    // 项目管理
    getProjects: () =>
      request<Project[]>('/projects'),

    getProject: (id: string) =>
      request<Project>(`/projects/${id}`),

    createProject: (data: {
      customerId: string;
      name: string;
      description?: string;
      enterpriseInfo: Project['enterpriseInfo'];
      competitorInfo: Project['competitorInfo'];
    }) =>
      request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateProject: (id: string, data: Partial<Project>) =>
      request<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteProject: (id: string) =>
      request<{ message: string }>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },
};

export type { Ticket, Customer, Project, User, UserRole, TicketStatus, OptimizationRecord, QuotaPackage, QuotaHistory } from './types';
