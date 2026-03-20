# GEO 平台阶段 1：客户侧工作流实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现客户侧完整工作流 - 登录认证、创建工单、查看工单列表、工单详情/审核、Dashboard（含配额显示）

**Architecture:** Next.js 16 App Router + React Context 状态管理 + shadcn/ui 组件库 + 原生 fetch API 调用

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

---

## 文件结构

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx              # 登录页
├── (dashboard)/
│   ├── layout.tsx                # 侧边栏布局 + 认证保护
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard
│   └── tickets/
│       ├── page.tsx              # 工单列表
│       ├── new/
│       │   └── page.tsx          # 创建工单
│       └── [id]/
│           └── page.tsx          # 工单详情
├── layout.tsx                    # 根布局
└── page.tsx                      # 根页面重定向

lib/
├── api.ts                        # API 封装（统一请求处理）
├── auth.ts                       # 认证逻辑
└── types.ts                      # TypeScript 类型定义

components/
├── layout/
│   ├── sidebar.tsx               # 侧边栏导航
│   └── header.tsx                # 顶部栏
├── ticket/
│   ├── ticket-card.tsx           # 工单卡片
│   ├── ticket-status.tsx         # 状态徽章
│   └── score-comparison.tsx      # 评分对比组件
└── ui/                           # shadcn/ui 组件（按需添加）
```

---

## Chunk 1: 项目初始化与基础设施

### Task 1.1: 安装 shadcn/ui

**Files:**
- Modify: `package.json`
- Create: `components.json` (shadcn 配置)

- [ ] **Step 1: 安装 shadcn/ui 依赖**

```bash
npx shadcn@latest init -y -d
```

Expected: shadcn/ui 初始化完成，生成 components.json

- [ ] **Step 2: 添加基础组件**

```bash
npx shadcn@latest add button card input label select textarea badge avatar dropdown-menu
```

Expected: 基础组件添加到 components/ui/

- [ ] **Step 3: Commit**

```bash
git add package.json components.json components/ui/
git commit -m "chore: install shadcn/ui and base components"
```

---

### Task 1.2: 创建类型定义

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// lib/types.ts

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
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 1.3: 创建 API 封装

**Files:**
- Create: `lib/api.ts`

- [ ] **Step 1: 创建 API 封装**

```typescript
// lib/api.ts

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
```

- [ ] **Step 2: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add API wrapper with unified error handling"
```

---

### Task 1.4: 创建认证上下文

**Files:**
- Create: `lib/contexts/AuthContext.tsx`

- [ ] **Step 1: 创建认证上下文**

```typescript
// lib/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 localStorage 读取 token
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);

    // 暂时存储一个模拟用户（实际应该从 /users/me 获取）
    const mockUser: User = {
      id: 'mock-id',
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : email.includes('optimizer') ? 'optimizer' : 'customer',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    setToken(response.accessToken);
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: 更新根布局以提供 AuthContext**

**Files:**
- Modify: `app/layout.tsx`

```typescript
// app/layout.tsx
import { AuthProvider } from '@/lib/contexts/AuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/contexts/AuthContext.tsx app/layout.tsx
git commit -m "feat: add AuthContext with login/logout"
```

---

## Chunk 2: 登录页面

### Task 2.1: 创建登录页面

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: 创建登录页面组件**

```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 如果已登录，重定向到 dashboard
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">GEO 优化平台</CardTitle>
          <CardDescription>登录到您的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-2">测试账号：</p>
            <div className="space-y-1 text-xs">
              <p>Admin: admin@test.com / admin123</p>
              <p>Optimizer: optimizer@test.com / optimizer123</p>
              <p>Customer: customer@test.com / customer123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 创建根页面重定向逻辑**

**Files:**
- Modify: `app/page.tsx`

```typescript
// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.push(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">加载中...</div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/page.tsx app/page.tsx
git commit -m "feat: add login page with auth redirect"
```

---

## Chunk 3: 布局组件

### Task 3.1: 创建侧边栏组件

**Files:**
- Create: `components/layout/sidebar.tsx`

- [ ] **Step 1: 创建侧边栏组件**

```typescript
// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
  ],
  optimizer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
  ],
  customer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '提交工单', href: '/tickets/new', icon: '➕' },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          GEO 优化平台
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: add sidebar component with role-based navigation"
```

---

### Task 3.2: 创建 Dashboard 布局

**Files:**
- Create: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: 创建受保护路由的布局**

```typescript
// app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/layout.tsx
git commit -m "feat: add dashboard layout with auth protection"
```

---

## Chunk 4: Dashboard 页面

### Task 4.1: 创建 Dashboard 页面

**Files:**
- Create: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: 创建 Dashboard 页面**

```typescript
// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket, Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData] = await Promise.all([
          api.getTickets(),
        ]);

        setTickets(ticketsData);

        // 如果是 customer，获取配额信息
        if (user?.role === 'customer') {
          try {
            const customerData = await api.getCustomerMe();
            setCustomer(customerData);
          } catch {
            // 如果 /customers/me 不可用，使用模拟数据
            setCustomer({
              id: 'mock',
              userId: user.id,
              companyName: '测试公司',
              industry: 'Technology',
              contactPhone: '',
              notes: '',
              quotaTotal: 10,
              quotaUsed: 2,
              quotaExpireAt: '2026-04-18T00:00:00Z',
              createdAt: '',
              updatedAt: '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  // Customer Dashboard
  if (user?.role === 'customer') {
    const pendingReview = tickets.filter(t => t.status === 'reviewing').length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const recentTickets = tickets.slice(0, 5);

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">我的工作台</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">配额剩余</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {customer.quotaTotal - customer.quotaUsed}/{customer.quotaTotal}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  过期时间: {new Date(customer.quotaExpireAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">待审核</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* 最近工单 */}
        <Card>
          <CardHeader>
            <CardTitle>最近工单</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无工单</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">📄 {ticket.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge status={ticket.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin/Optimizer Dashboard
  const pending = tickets.filter(t => t.status === 'pending').length;
  const processing = tickets.filter(t => t.status === 'processing').length;
  const completed = tickets.filter(t => t.status === 'completed').length;
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">工作台</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* 最近工单 */}
      <Card>
        <CardHeader>
          <CardTitle>最近工单</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无工单</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">📄 {ticket.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge status={ticket.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: add dashboard page with role-based views"
```

---

## Chunk 5: 工单功能

### Task 5.1: 创建工单状态徽章组件

**Files:**
- Create: `components/ticket/ticket-status.tsx`

- [ ] **Step 1: 创建状态徽章组件**

```typescript
// components/ticket/ticket-status.tsx
'use client';

import { type TicketStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusConfig: Record<TicketStatus, { color: string; text: string }> = {
  pending: { color: 'bg-gray-100 text-gray-700', text: '待领取' },
  assigned: { color: 'bg-blue-100 text-blue-700', text: '已分配' },
  processing: { color: 'bg-orange-100 text-orange-700', text: '处理中' },
  reviewing: { color: 'bg-purple-100 text-purple-700', text: '待审核' },
  completed: { color: 'bg-green-100 text-green-700', text: '已完成' },
};

export function Badge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
      {config.text}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ticket/ticket-status.tsx
git commit -m "feat: add ticket status badge component"
```

---

### Task 5.2: 创建工单列表页面

**Files:**
- Create: `app/(dashboard)/tickets/page.tsx`

- [ ] **Step 1: 创建工单列表页面**

```typescript
// app/(dashboard)/tickets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket, TicketStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card } from '@/components/ui/card';

const statusFilters: { value: 'all' | TicketStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待领取' },
  { value: 'assigned', label: '已分配' },
  { value: 'processing', label: '处理中' },
  { value: 'reviewing', label: '待审核' },
  { value: 'completed', label: '已完成' },
];

export default function TicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === 'customer' ? '我的工单' : '工单列表'}
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchTickets}
            disabled={isLoading}
          >
            🔄 刷新
          </Button>
          <Button onClick={() => router.push('/tickets/new')}>
            ➕ 创建工单
          </Button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 mb-6">
        {statusFilters.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === item.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 工单列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">暂无工单</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/tickets/${ticket.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    📄 {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    项目：{ticket.project?.name || '未分配'}  |  创建于 {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  {ticket.originalContent && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.originalContent.slice(0, 150)}...
                    </p>
                  )}
                  {ticket.scoreAfter > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">优化前：{ticket.scoreBefore}</span>
                      <span className="mx-2">→</span>
                      <span className="text-gray-500">优化后：{ticket.scoreAfter}</span>
                      <span className="ml-2 text-green-600 font-medium">
                        (+{(ticket.scoreAfter - ticket.scoreBefore).toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
                <Badge status={ticket.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/tickets/page.tsx
git commit -m "feat: add tickets list page with filtering"
```

---

### Task 5.3: 创建创建工单页面

**Files:**
- Create: `app/(dashboard)/tickets/new/page.tsx`

- [ ] **Step 1: 创建工单表单页面**

```typescript
// app/(dashboard)/tickets/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 模拟项目数据（实际应该从 API 获取）
const mockProjects = [
  { id: '1', name: '某某科技官网项目' },
  { id: '2', name: '产品介绍页面' },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    content: '',
    needReview: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.projectId || !formData.title || !formData.content) {
      setError('请填写所有必填项');
      return;
    }

    setIsLoading(true);

    try {
      await api.createTicket({
        projectId: formData.projectId,
        title: formData.title,
        content: formData.content,
        needReview: formData.needReview,
      });

      router.push('/tickets');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建工单失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📝 创建工单</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 选择项目 */}
            <div className="space-y-2">
              <Label htmlFor="project">选择项目 *</Label>
              <select
                id="project"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">请选择项目</option>
                {mockProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 工单标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">工单标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：如何选择云服务提供商"
                required
              />
            </div>

            {/* 原始内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">原始内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="粘贴或输入要优化的文章内容..."
                rows={12}
                required
                className="resize-none"
              />
            </div>

            {/* 是否需要审核 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="needReview"
                checked={formData.needReview}
                onChange={(e) => setFormData({ ...formData, needReview: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="needReview" className="cursor-pointer">
                需要审核（交付后需要你审核通过才完成）
              </Label>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '提交中...' : '提交'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 添加 Textarea 组件（如果还没有）**

```bash
npx shadcn@latest add textarea
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/tickets/new/page.tsx
git commit -m "feat: add create ticket page"
```

---

### Task 5.4: 创建工单详情页面

**Files:**
- Create: `app/(dashboard)/tickets/[id]/page.tsx`

- [ ] **Step 1: 创建工单详情页面**

```typescript
// app/(dashboard)/tickets/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await api.getTicket(params.id);
        setTicket(data);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        setMessage('获取工单详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  const handleReview = async (approved: boolean) => {
    if (!reviewComment.trim() && !approved) {
      setMessage('请填写打回原因');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await api.reviewTicket(params.id, approved, reviewComment);

      if (approved) {
        setMessage('✅ 审核通过！');
        setTimeout(() => {
          router.push('/tickets');
        }, 1500);
      } else {
        setMessage('✓ 已打回，优化师将重新处理');
        setTimeout(() => {
          router.push('/tickets');
        }, 1500);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '审核失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">工单不存在</p>
          <Button onClick={() => router.push('/tickets')} className="mt-4">
            返回列表
          </Button>
        </Card>
      </div>
    );
  }

  const isReviewing = ticket.status === 'reviewing' && user?.role === 'customer';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      {/* 工单标题和状态 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">📄 {ticket.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>状态：<Badge status={ticket.status} /></span>
          <span>创建于 {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* 评分对比 */}
      {ticket.scoreAfter > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">优化前评分</p>
                <p className="text-3xl font-bold text-gray-700">{ticket.scoreBefore}</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">优化后评分</p>
                <p className="text-3xl font-bold text-green-600">{ticket.scoreAfter}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">提升</p>
                <p className="text-2xl font-bold text-green-600">
                  +{(ticket.scoreAfter - ticket.scoreBefore).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 优化后内容 */}
      {ticket.optimizedContent && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">优化后内容</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                {ticket.optimizedContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 原始内容 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">原始内容</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-600 text-sm">
              {ticket.originalContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 审核操作 */}
      {isReviewing && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">审核工单</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="审核意见（可选）"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
              {message && (
                <div className={`text-sm p-3 rounded-md ${
                  message.includes('✅') || message.includes('✓')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview(true)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✅ 通过
                </Button>
                <Button
                  onClick={() => handleReview(false)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  ❌ 打回
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/tickets/[id]/page.tsx
git commit -m "feat: add ticket detail page with review functionality"
```

---

## Chunk 6: 收尾与验证

### Task 6.1: 添加工具函数

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: 创建 utils 文件**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 安装依赖**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: Commit**

```bash
git add lib/utils.ts package.json package-lock.json
git commit -m "chore: add utility function for className merging"
```

---

### Task 6.2: 更新全局样式

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 更新全局样式**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* 添加 line-clamp 工具类 */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: update global styles"
```

---

### Task 6.3: 端到端验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

Expected: 服务器运行在 http://localhost:3000

- [ ] **Step 2: 验证功能清单**

1. **登录功能**
   - [ ] 访问 http://localhost:3000，自动跳转到登录页
   - [ ] 使用 customer@test.com / customer123 登录
   - [ ] 登录成功后跳转到 Dashboard

2. **Dashboard**
   - [ ] 看到配额显示（剩余/总量）
   - [ ] 看到统计卡片（待审核、已完成）
   - [ ] 看到最近工单列表

3. **工单列表**
   - [ ] 点击"我的工单"导航
   - [ ] 看到工单列表
   - [ ] 筛选功能正常工作
   - [ ] 刷新按钮正常工作

4. **创建工单**
   - [ ] 点击"创建工单"
   - [ ] 填写表单并提交
   - [ ] 创建成功后跳转到工单列表

5. **工单详情**
   - [ ] 点击工单卡片进入详情页
   - [ ] 看到评分对比
   - [ ] 看到原始内容和优化后内容

6. **审核功能**（需要有 reviewing 状态的工单）
   - [ ] 点击"通过"按钮，审核成功
   - [ ] 工单状态变为 completed

7. **退出登录**
   - [ ] 点击侧边栏的"退出登录"
   - [ ] 跳转到登录页

- [ ] **Step 3: 修复发现的问题**

如有问题，修复后提交：
```bash
git add .
git commit -m "fix: address issues found during testing"
```

---

### Task 6.4: 最终提交

- [ ] **Step 1: 查看所有更改**

```bash
git status
```

- [ ] **Step 2: 确保所有文件已提交**

如有未提交文件：
```bash
git add .
git commit -m "chore: final cleanup"
```

- [ ] **Step 3: 查看提交历史**

```bash
git log --oneline -10
```

---

## 验收标准

阶段 1 完成后，应该满足：

1. ✅ 三种角色可以登录并看到对应的导航菜单
2. ✅ Customer 可以创建工单、查看自己的工单列表
3. ✅ Customer Dashboard 显示配额信息和统计数据
4. ✅ 工单详情页显示评分对比和内容
5. ✅ Customer 可以审核工单（通过/打回）
6. ✅ 手动刷新按钮正常工作
7. ✅ 权限控制正确（无法越权访问）

---

## 下一步

完成阶段 1 后，继续**阶段 2：优化师侧工作流 + 优化历史记录**

实现计划文件：`docs/superpowers/plans/2026-03-20-phase2-optimizer-workflow.md`
