// 用户角色
export type UserRole = 'admin' | 'optimizer' | 'customer';

// 用户
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// 登录响应
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// 工单状态
export type TicketStatus = 'pending' | 'assigned' | 'processing' | 'reviewing' | 'completed';

// 工单
export interface Ticket {
  id: string;
  customerId: string;
  projectId: string;
  optimizerId: string | null;
  title: string;
  originalContent: string;
  optimizedContent: string;
  sourceType: string;
  sourceFileUrl: string | null;
  status: TicketStatus;
  needReview: boolean;
  reviewStatus: string | null;
  scoreBefore: number;
  scoreAfter: number;
  createdAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  // 关联数据
  project?: Project;
  customer?: Customer;
}

// 客户
export interface Customer {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  contactPhone: string;
  notes: string;
  quotaTotal: number;
  quotaUsed: number;
  quotaExpireAt: string;
  createdAt: string;
  updatedAt: string;
}

// 项目
export interface Project {
  id: string;
  customerId: string;
  name: string;
  description: string;
  enterpriseInfo: {
    companyName: string;
    companyWebsite: string;
    companyDescription: string;
    productName: string;
    productUrl: string;
    productDescription: string;
    productFeatures: string[];
    usp: string[];
    brandVoice: string;
    targetAudience: string;
    certifications: string[];
    awards: string[];
  };
  competitorInfo: Array<{
    name: string;
    website: string;
    weaknesses: string[];
    commonObjections: string[];
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 审核请求
export interface ReviewRequest {
  approved: boolean;
  comment: string;
}

// 创建工单请求
export interface CreateTicketRequest {
  projectId: string;
  title: string;
  content: string;
  sourceType?: string;
  sourceFileUrl?: string;
  needReview?: boolean;
}
