# GEO 平台阶段 3：Admin 高级功能实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Admin 角色的高级管理功能 - 用户管理、客户管理、配额管理、项目管理

**Architecture:** 基于 Phase 1/2 的现有架构，新增通用组件（DataTable、FormDialog、ConfirmDialog、StepWizard）和 4 个管理模块页面

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

---

## 文件结构

```
app/
├── (dashboard)/
│   └── admin/                        # 新增
│       ├── users/
│       │   └── page.tsx              # 用户管理
│       ├── customers/
│       │   ├── page.tsx              # 客户管理
│       │   └── [id]/
│       │       └── page.tsx          # 客户详情
│       ├── quotas/
│       │   └── page.tsx              # 配额管理
│       └── projects/
│           ├── page.tsx              # 项目管理
│           ├── new/
│           │   └── page.tsx          # 创建项目
│           └── [id]/
│               ├── page.tsx          # 项目详情
│               └── edit/
│                   └── page.tsx      # 编辑项目

lib/
├── api.ts                            # 扩展
└── types.ts                          # 扩展

components/
├── admin/                            # 新增
│   ├── data-table.tsx
│   ├── form-dialog.tsx
│   ├── confirm-dialog.tsx
│   └── step-wizard.tsx
├── quota/                            # 新增
│   └── quota-card.tsx
└── layout/
    └── sidebar.tsx                   # 更新
```

---

## Chunk 1: 通用组件与基础设施

### Task 1.1: 扩展类型定义

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: 添加配额相关类型**

```typescript
// 在 lib/types.ts 末尾添加

// 配额包
export interface QuotaPackage {
  id: string;
  name: string;
  articles: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// 配额历史
export interface QuotaHistory {
  id: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageName: string;
  amount: number;
  remark: string;
  operatedBy: string;
  operatedAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add QuotaPackage and QuotaHistory types"
```

---

### Task 1.2: 扩展 API 方法

**Files:**
- Modify: `lib/api.ts`

- [ ] **Step 1: 添加 Admin 相关 API 方法**

在 `api` 对象中添加以下命名空间和方法：

```typescript
// 在 lib/api.ts 的 api 对象中添加

  // 用户管理
  admin: {
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
  },

  // 客户管理
  getCustomers: () =>
    request<Customer[]>('/customers'),

  getCustomer: (id: string) =>
    request<Customer>(`/customers/${id}`),

  createCustomer: (data: {
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
```

- [ ] **Step 2: 更新类型导出**

在文件末尾更新：

```typescript
export type { Ticket, Customer, Project, User, TicketStatus, OptimizationRecord, QuotaPackage, QuotaHistory } from './types';
```

- [ ] **Step 3: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add admin APIs for users, customers, quotas, and projects"
```

---

### Task 1.3: 创建通用数据表格组件

**Files:**
- Create: `components/admin/data-table.tsx`

- [ ] **Step 1: 创建 DataTable 组件**

```typescript
// components/admin/data-table.tsx
'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyMessage = '暂无数据',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        加载中...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-medium text-gray-700"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                  {column.render ? column.render(item) : String(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/data-table.tsx
git commit -m "feat: add reusable DataTable component"
```

---

### Task 1.4: 创建表单对话框组件

**Files:**
- Create: `components/admin/form-dialog.tsx`

- [ ] **Step 1: 创建 FormDialog 组件**

```typescript
// components/admin/form-dialog.tsx
'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FormDialogProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  children: ReactNode;
}

export function FormDialog({
  title,
  description,
  open,
  onClose,
  onSubmit,
  submitLabel = '提交',
  cancelLabel = '取消',
  isSubmitting = false,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          {children}
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/form-dialog.tsx
git commit -m "feat: add FormDialog component"
```

---

### Task 1.5: 创建确认对话框组件

**Files:**
- Create: `components/admin/confirm-dialog.tsx`

- [ ] **Step 1: 创建 ConfirmDialog 组件**

```typescript
// components/admin/confirm-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  open,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/confirm-dialog.tsx
git commit -m "feat: add ConfirmDialog component"
```

---

## Chunk 2: 用户管理 (3.1)

### Task 2.1: 创建用户管理页面

**Files:**
- Create: `app/(dashboard)/admin/users/page.tsx`

- [ ] **Step 1: 创建用户管理页面组件**

```typescript
// app/(dashboard)/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/admin/data-table';
import { FormDialog } from '@/components/admin/form-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 创建用户表单
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer' as UserRole,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      await api.admin.createUser(formData);
      setCreateDialogOpen(false);
      setFormData({ email: '', password: '', name: '', role: 'customer' });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('创建失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.admin.deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'email',
      label: '邮箱',
    },
    {
      key: 'name',
      label: '姓名',
    },
    {
      key: 'role',
      label: '角色',
      render: (user: User) => {
        const roleLabels: Record<UserRole, string> = {
          admin: '管理员',
          optimizer: '优化师',
          customer: '客户',
        };
        return roleLabels[user.role] || user.role;
      },
    },
    {
      key: 'createdAt',
      label: '创建时间',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: '操作',
      render: (user: User) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
            setDeleteDialogOpen(true);
          }}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          + 创建用户
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
          />
        </CardContent>
      </Card>

      {/* 创建用户对话框 */}
      <FormDialog
        title="创建用户"
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">角色 *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="customer">客户</option>
              <option value="optimizer">优化师</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
      </FormDialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        title="确认删除"
        message={`确定要删除用户 "${selectedUser?.name}" 吗？此操作不可撤销。`}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        variant="destructive"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/users/page.tsx
git commit -m "feat: add user management page"
```

---

### Task 2.2: 创建用户详情页面

**Files:**
- Create: `app/(dashboard)/admin/users/[id]/page.tsx`

- [ ] **Step 1: 创建用户详情页面组件**

```typescript
// app/(dashboard)/admin/users/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.admin.getUser(id);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">用户不存在</p>
          <Button onClick={() => router.push('/admin/users')} className="mt-4">
            返回列表
          </Button>
        </Card>
      </div>
    );
  }

  const roleLabels: Record<UserRole, string> = {
    admin: '管理员',
    optimizer: '优化师',
    customer: '客户',
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">邮箱</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">姓名</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">角色</p>
            <p className="font-medium">{roleLabels[user.role]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">创建时间</p>
            <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/users/\[id\]/page.tsx
git commit -m "feat: add user detail page"
```

---

## Chunk 3: 客户管理 (3.2)

### Task 3.1: 创建客户管理页面

**Files:**
- Create: `app/(dashboard)/admin/customers/page.tsx`

- [ ] **Step 1: 创建客户管理页面组件**

```typescript
// app/(dashboard)/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/admin/data-table';
import { FormDialog } from '@/components/admin/form-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPhone: '',
    industry: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setFormData({ companyName: '', contactPhone: '', industry: '', notes: '' });
  };

  const handleCreateCustomer = async () => {
    setIsSubmitting(true);
    try {
      await api.createCustomer(formData);
      setCreateDialogOpen(false);
      resetForm();
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('创建失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      companyName: customer.companyName,
      contactPhone: customer.contactPhone || '',
      industry: customer.industry || '',
      notes: customer.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await api.updateCustomer(selectedCustomer.id, formData);
      setEditDialogOpen(false);
      setSelectedCustomer(null);
      resetForm();
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('更新失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecharge = (customer: Customer) => {
    router.push(`/admin/quotas?customerId=${customer.id}`);
  };

  const columns = [
    {
      key: 'companyName',
      label: '公司名称',
    },
    {
      key: 'industry',
      label: '行业',
    },
    {
      key: 'quota',
      label: '配额',
      render: (customer: Customer) => (
        <span>{customer.quotaUsed}/{customer.quotaTotal}</span>
      ),
    },
    {
      key: 'createdAt',
      label: '创建时间',
      render: (customer: Customer) => new Date(customer.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: '操作',
      render: (customer: Customer) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleRecharge(customer);
            }}
          >
            充值
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(customer);
            }}
          >
            编辑
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">客户管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          + 创建客户
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>客户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={customers}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(customer) => router.push(`/admin/customers/${customer.id}`)}
          />
        </CardContent>
      </Card>

      {/* 创建/编辑客户对话框 - 共用表单 */}
      <FormDialog
        title={selectedCustomer ? '编辑客户' : '创建客户'}
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedCustomer(null);
          resetForm();
        }}
        onSubmit={selectedCustomer ? handleUpdateCustomer : handleCreateCustomer}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName">公司名称 *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">联系电话</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="industry">行业</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/customers/page.tsx
git commit -m "feat: add customer management page"
```

---

### Task 3.2: 创建客户详情页面

**Files:**
- Create: `app/(dashboard)/admin/customers/[id]/page.tsx`

- [ ] **Step 1: 创建客户详情页面组件**

```typescript
// app/(dashboard)/admin/customers/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await api.getCustomer(id);
        setCustomer(data);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">客户不存在</p>
          <Button onClick={() => router.push('/admin/customers')} className="mt-4">
            返回列表
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>客户信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">公司名称</p>
            <p className="font-medium">{customer.companyName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">行业</p>
            <p className="font-medium">{customer.industry || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">联系电话</p>
            <p className="font-medium">{customer.contactPhone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">备注</p>
            <p className="font-medium whitespace-pre-wrap">{customer.notes || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>配额信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-500">总配额</p>
              <p className="text-2xl font-bold">{customer.quotaTotal}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">已使用</p>
              <p className="text-2xl font-bold text-orange-600">{customer.quotaUsed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">剩余</p>
              <p className="text-2xl font-bold text-green-600">
                {customer.quotaTotal - customer.quotaUsed}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">过期时间</p>
            <p className="font-medium">{new Date(customer.quotaExpireAt).toLocaleDateString()}</p>
          </div>
          <Button onClick={() => router.push(`/admin/quotas?customerId=${customer.id}`)}>
            充值配额
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/customers/\[id\]/page.tsx
git commit -m "feat: add customer detail page"
```

---

## Chunk 4: 配额管理 (3.3)

### Task 4.1: 创建配额卡片组件

**Files:**
- Create: `components/quota/quota-card.tsx`

- [ ] **Step 1: 创建 QuotaCard 组件**

```typescript
// components/quota/quota-card.tsx
'use client';

import { QuotaPackage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuotaCardProps {
  quota: QuotaPackage;
  onEdit?: (quota: QuotaPackage) => void;
}

export function QuotaCard({ quota, onEdit }: QuotaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{quota.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {quota.articles} 篇文章
            </p>
          </div>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(quota)}
            >
              编辑
            </Button>
          )}
        </div>
        <div className="text-2xl font-bold text-blue-600">
          ¥{quota.price}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/quota/quota-card.tsx
git commit -m "feat: add QuotaCard component"
```

---

### Task 4.2: 创建配额管理页面

**Files:**
- Create: `app/(dashboard)/admin/quotas/page.tsx`

- [ ] **Step 1: 创建配额管理页面组件**

```typescript
// app/(dashboard)/admin/quotas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { QuotaPackage, QuotaHistory, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/admin/data-table';
import { FormDialog } from '@/components/admin/form-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { QuotaCard } from '@/components/quota/quota-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuotasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [packages, setPackages] = useState<QuotaPackage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [history, setHistory] = useState<QuotaHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 配额包对话框
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<QuotaPackage | null>(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    articles: 0,
    price: 0,
  });

  // 充值对话框
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [rechargeStep, setRechargeStep] = useState(1);
  const [rechargeData, setRechargeData] = useState({
    customerId: preselectedCustomerId || '',
    packageId: '',
    remark: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPackages = async () => {
    try {
      const data = await api.getQuotaPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchHistory = async (customerId: string) => {
    try {
      const data = await api.getQuotaHistory(customerId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPackages(), fetchCustomers()]);
      setIsLoading(false);
    };
    loadData();

    // 如果预选了客户，打开充值对话框
    if (preselectedCustomerId) {
      setRechargeData({ ...rechargeData, customerId: preselectedCustomerId });
      setRechargeDialogOpen(true);
    }
  }, [preselectedCustomerId]);

  const resetPackageForm = () => {
    setPackageFormData({ name: '', articles: 0, price: 0 });
  };

  const handleCreatePackage = async () => {
    setIsSubmitting(true);
    try {
      await api.createQuotaPackage(packageFormData);
      setPackageDialogOpen(false);
      resetPackageForm();
      await fetchPackages();
    } catch (error) {
      console.error('Failed to create package:', error);
      alert('创建失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;
    setIsSubmitting(true);
    try {
      await api.updateQuotaPackage(selectedPackage.id, packageFormData);
      setPackageDialogOpen(false);
      setSelectedPackage(null);
      resetPackageForm();
      await fetchPackages();
    } catch (error) {
      console.error('Failed to update package:', error);
      alert('更新失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditPackageDialog = (pkg: QuotaPackage) => {
    setSelectedPackage(pkg);
    setPackageFormData({
      name: pkg.name,
      articles: pkg.articles,
      price: pkg.price,
    });
    setPackageDialogOpen(true);
  };

  const handleRecharge = async () => {
    setIsSubmitting(true);
    try {
      await api.rechargeQuota(rechargeData.customerId, {
        packageId: rechargeData.packageId,
        remark: rechargeData.remark,
      });
      setRechargeDialogOpen(false);
      setRechargeStep(1);
      setRechargeData({ customerId: '', packageId: '', remark: '' });
      alert('充值成功！');
    } catch (error) {
      console.error('Failed to recharge:', error);
      alert('充值失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const historyColumns = [
    { key: 'customerName', label: '客户' },
    { key: 'packageName', label: '配额包' },
    {
      key: 'amount',
      label: '数量',
      render: (item: QuotaHistory) => <span className="text-green-600">+{item.amount}</span>,
    },
    { key: 'remark', label: '备注' },
    {
      key: 'operatedAt',
      label: '时间',
      render: (item: QuotaHistory) => new Date(item.operatedAt).toLocaleString(),
    },
  ];

  const selectedCustomer = customers.find(c => c.id === rechargeData.customerId);
  const selectedPackage = packages.find(p => p.id === rechargeData.packageId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">配额管理</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setRechargeDialogOpen(true)}>
            充值配额
          </Button>
          <Button onClick={() => setPackageDialogOpen(true)}>
            + 创建配额包
          </Button>
        </div>
      </div>

      {/* 配额包列表 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>配额包</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无配额包</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <QuotaCard
                  key={pkg.id}
                  quota={pkg}
                  onEdit={openEditPackageDialog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 充值历史 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>充值历史</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={history} columns={historyColumns} />
          </CardContent>
        </Card>
      )}

      {/* 创建/编辑配额包对话框 */}
      <FormDialog
        title={selectedPackage ? '编辑配额包' : '创建配额包'}
        open={packageDialogOpen}
        onClose={() => {
          setPackageDialogOpen(false);
          setSelectedPackage(null);
          resetPackageForm();
        }}
        onSubmit={selectedPackage ? handleUpdatePackage : handleCreatePackage}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              value={packageFormData.name}
              onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
              placeholder="例如：专业包"
              required
            />
          </div>
          <div>
            <Label htmlFor="articles">文章数 *</Label>
            <Input
              id="articles"
              type="number"
              value={packageFormData.articles}
              onChange={(e) => setPackageFormData({ ...packageFormData, articles: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">价格 *</Label>
            <Input
              id="price"
              type="number"
              value={packageFormData.price}
              onChange={(e) => setPackageFormData({ ...packageFormData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
        </div>
      </FormDialog>

      {/* 充值对话框 */}
      <FormDialog
        title="为客户充值配额"
        open={rechargeDialogOpen}
        onClose={() => {
          setRechargeDialogOpen(false);
          setRechargeStep(1);
          setRechargeData({ customerId: '', packageId: '', remark: '' });
        }}
        onSubmit={handleRecharge}
        isSubmitting={isSubmitting}
        submitLabel={rechargeStep === 3 ? '确认充值' : '下一步'}
      >
        {rechargeStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">Step 1: 选择客户</h3>
            <div className="space-y-2">
              {customers.map((customer) => (
                <label
                  key={customer.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${
                    rechargeData.customerId === customer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="customer"
                    checked={rechargeData.customerId === customer.id}
                    onChange={() => setRechargeData({ ...rechargeData, customerId: customer.id })}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">{customer.companyName}</p>
                    <p className="text-sm text-gray-500">
                      配额：{customer.quotaUsed}/{customer.quotaTotal}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {rechargeStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Step 2: 选择配额包</h3>
            <div className="space-y-2">
              {packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${
                    rechargeData.packageId === pkg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    checked={rechargeData.packageId === pkg.id}
                    onChange={() => setRechargeData({ ...rechargeData, packageId: pkg.id })}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-sm text-gray-500">
                      {pkg.articles} 篇文章 - ¥{pkg.price}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {rechargeStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">Step 3: 确认信息</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><span className="text-gray-500">客户：</span>{selectedCustomer?.companyName}</p>
              <p><span className="text-gray-500">配额包：</span>{selectedPackage?.name} ({selectedPackage?.articles} 篇)</p>
              <div>
                <Label htmlFor="remark">备注</Label>
                <Input
                  id="remark"
                  value={rechargeData.remark}
                  onChange={(e) => setRechargeData({ ...rechargeData, remark: e.target.value })}
                  placeholder="例如：首次购买"
                />
              </div>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/quotas/page.tsx
git commit -m "feat: add quota management page"
```

---

## Chunk 5: 项目管理 (3.4)

### Task 5.1: 创建分步骤向导组件

**Files:**
- Create: `components/admin/step-wizard.tsx`

- [ ] **Step 1: 创建 StepWizard 组件**

```typescript
// components/admin/step-wizard.tsx
'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Step {
  title: string;
  content: ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function StepWizard({
  steps,
  currentStep,
  onNext,
  onPrev,
  onComplete,
  isSubmitting = false,
}: StepWizardProps) {
  return (
    <div>
      {/* 进度指示器 */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                currentStep === index
                  ? 'bg-blue-600 text-white'
                  : currentStep > index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-1 mx-2',
                  currentStep > index ? 'bg-green-600' : 'bg-gray-200'
                )}
              />
            )}
            {index < steps.length - 1 && (
              <div className="ml-4 text-sm text-gray-500">{step.title}</div>
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤内容 */}
      <div className="mb-6">
        {steps[currentStep].content}
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={onNext}>
            下一步
          </Button>
        ) : (
          <Button onClick={onComplete} disabled={isSubmitting}>
            {isSubmitting ? '创建中...' : '创建'}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/step-wizard.tsx
git commit -m "feat: add StepWizard component"
```

---

### Task 5.2: 创建项目列表页面

**Files:**
- Create: `app/(dashboard)/admin/projects/page.tsx`

- [ ] **Step 1: 创建项目列表页面组件**

```typescript
// app/(dashboard)/admin/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    setIsDeleting(true);
    try {
      await api.deleteProject(selectedProject.id);
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <Button onClick={() => router.push('/admin/projects/new')}>
          + 创建项目
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">暂无项目</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/projects/${project.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    删除
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  客户：{project.enterpriseInfo.companyName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  创建于 {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        title="确认删除项目"
        message={`确定要删除项目 "${selectedProject?.name}" 吗？此操作不可撤销。`}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteProject}
        variant="destructive"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/projects/page.tsx
git commit -m "feat: add projects list page"
```

---

### Task 5.3: 创建项目页面

**Files:**
- Create: `app/(dashboard)/admin/projects/new/page.tsx`

- [ ] **Step 1: 创建项目页面组件**

```typescript
// app/(dashboard)/admin/projects/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Customer, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepWizard } from '@/components/admin/step-wizard';
import { Card, CardContent } from '@/components/ui/card';

export default function NewProjectPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    customerId: '',
    // Step 1: 基本信息
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    // Step 2: 产品信息
    productName: '',
    productUrl: '',
    productDescription: '',
    productFeatures: [] as string[],
    usp: [] as string[],
    brandVoice: '',
    targetAudience: '',
    // Step 3: 竞品信息
    competitors: [] as Array<{
      name: string;
      website: string;
      weaknesses: string[];
      commonObjections: string[];
    }>,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await api.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleNext = () => {
    // 验证当前步骤
    if (currentStep === 0 && !formData.customerId) {
      alert('请选择客户');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.createProject({
        customerId: formData.customerId,
        name: formData.productName,
        description: formData.productDescription,
        enterpriseInfo: {
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          companyDescription: formData.companyDescription,
          productName: formData.productName,
          productUrl: formData.productUrl,
          productDescription: formData.productDescription,
          productFeatures: formData.productFeatures,
          usp: formData.usp,
          brandVoice: formData.brandVoice,
          targetAudience: formData.targetAudience,
          certifications: [],
          awards: [],
        },
        competitorInfo: formData.competitors,
      });

      router.push('/admin/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('创建失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCompetitor = () => {
    setFormData({
      ...formData,
      competitors: [
        ...formData.competitors,
        { name: '', website: '', weaknesses: [], commonObjections: [] },
      ],
    });
  };

  const updateCompetitor = (index: number, field: string, value: any) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = { ...newCompetitors[index], [field]: value };
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const removeCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  const steps = [
    {
      title: '基本信息',
      content: (
        <div className="space-y-4">
          <div>
            <Label>客户 *</Label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">请选择客户</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">企业信息</h4>
            <div>
              <Label htmlFor="companyName">公司名称 *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyWebsite">公司网站</Label>
              <Input
                id="companyWebsite"
                value={formData.companyWebsite}
                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyDescription">公司描述</Label>
              <Textarea
                id="companyDescription"
                value={formData.companyDescription}
                onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '产品信息',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="productName">产品名称 *</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="productUrl">产品 URL</Label>
            <Input
              id="productUrl"
              value={formData.productUrl}
              onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="productDescription">产品描述</Label>
            <Textarea
              id="productDescription"
              value={formData.productDescription}
              onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="brandVoice">品牌调性</Label>
            <Input
              id="brandVoice"
              value={formData.brandVoice}
              onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
              placeholder="例如：专业、友好、创新"
            />
          </div>
          <div>
            <Label htmlFor="targetAudience">目标受众</Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="例如：25-35岁企业决策者"
            />
          </div>
        </div>
      ),
    },
    {
      title: '竞品信息',
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">竞品列表</h4>
            <Button type="button" variant="outline" size="sm" onClick={addCompetitor}>
              + 添加竞品
            </Button>
          </div>
          {formData.competitors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无竞品</p>
          ) : (
            formData.competitors.map((competitor, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="font-medium">竞品 {index + 1}</h5>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCompetitor(index)}
                  >
                    删除
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="竞品名称"
                    value={competitor.name}
                    onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="竞品网站"
                    value={competitor.website}
                    onChange={(e) => updateCompetitor(index, 'website', e.target.value)}
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            onNext={handleNext}
            onPrev={handlePrev}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/admin/projects/new/page.tsx
git commit -m "feat: add create project page with step wizard"
```

---

### Task 5.4: 更新侧边栏导航

**Files:**
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: 更新导航结构**

```typescript
// 在 components/layout/sidebar.tsx 中更新 navItemsByRole

interface NavItem {
  label: string;
  href: string;
  icon: string;
  subitems?: NavItem[];
}

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
    { label: '管理中心', href: '/admin', icon: '⚙️', subitems: [
      { label: '用户管理', href: '/admin/users', icon: '👥' },
      { label: '客户管理', href: '/admin/customers', icon: '🏢' },
      { label: '配额管理', href: '/admin/quotas', icon: '💎' },
      { label: '项目管理', href: '/admin/projects', icon: '📁' },
    ]},
  ],
  optimizer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
    { label: '管理中心', href: '/admin', icon: '⚙️', subitems: [
      { label: '客户列表', href: '/admin/customers', icon: '🏢' },
      { label: '项目列表', href: '/admin/projects', icon: '📁' },
    ]},
  ],
  customer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '提交工单', href: '/tickets/new', icon: '➕' },
  ],
};
```

- [ ] **Step 2: 更新 Sidebar 组件以支持子菜单**

更新 Sidebar 组件的导航部分以支持子菜单展开/折叠：

```typescript
// 在 components/layout/sidebar.tsx 的 Sidebar 组件中
// 替换原有的导航部分

const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

const toggleMenu = (label: string) => {
  setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
};

// 在导航渲染部分：
<nav className="flex-1 p-4">
  <ul className="space-y-2">
    {navItems.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
      const hasSubitems = item.subitems && item.subitems.length > 0;
      const isExpanded = expandedMenus[item.label];

      return (
        <li key={item.href || item.label}>
          <div>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                if (hasSubitems) {
                  toggleMenu(item.label);
                } else {
                  router.push(item.href);
                }
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {hasSubitems && (
                <span className="text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
            </div>
            {hasSubitems && isExpanded && (
              <ul className="ml-8 mt-1 space-y-1">
                {item.subitems!.map((subitem) => (
                  <li key={subitem.href}>
                    <div
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                        pathname === subitem.href
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => router.push(subitem.href)}
                    >
                      <span className="text-base">{subitem.icon}</span>
                      <span>{subitem.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      );
    })}
  </ul>
</nav>
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: update sidebar with admin center submenu"
```

---

## Chunk 6: 收尾与验证

### Task 6.1: 添加 shadcn/ui Dialog 组件

**Files:**
- Modify: `components.json` (如果 Dialog 组件不存在)

- [ ] **Step 1: 检查并添加 Dialog 组件**

```bash
# 检查是否已有 Dialog 组件
ls components/ui/dialog.tsx 2>/dev/null || npx shadcn@latest add dialog
```

Expected: Dialog 组件添加到 `components/ui/`

- [ ] **Step 2: Commit (如果有变更)**

```bash
git add components/
git commit -m "chore: add shadcn/ui dialog component"
```

---

### Task 6.2: 端到端验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

Expected: 服务器运行在 http://localhost:3000

- [ ] **Step 2: 使用 Admin 账号登录**

邮箱：admin@test.com
密码：admin123

- [ ] **Step 3: 验证用户管理 (3.1)**

- [ ] 侧边栏显示"管理中心"菜单
- [ ] 点击展开显示子菜单项
- [ ] 进入"用户管理"页面
- [ ] 可以看到用户列表
- [ ] 点击"+ 创建用户"可以打开对话框
- [ ] 填写信息并提交，成功创建用户
- [ ] 点击"删除"按钮可以删除用户（有确认提示）

- [ ] **Step 4: 验证客户管理 (3.2)**

- [ ] 进入"客户管理"页面
- [ ] 可以看到客户列表
- [ ] 配额列显示"已用/总量"格式
- [ ] 点击"+ 创建客户"可以创建客户
- [ ] 点击"编辑"可以修改客户信息
- [ ] 点击"充值"跳转到配额管理页面并预选该客户

- [ ] **Step 5: 验证配额管理 (3.3)**

- [ ] 进入"配额管理"页面
- [ ] 可以看到配额包列表（卡片视图）
- [ ] 点击"+ 创建配额包"可以创建新配额包
- [ ] 点击"编辑"可以修改配额包
- [ ] 点击"充值配额"打开充值对话框
- [ ] 充值流程 3 步：选择客户 → 选择配额包 → 确认
- [ ] 充值成功后显示充值历史

- [ ] **Step 6: 验证项目管理 (3.4)**

- [ ] 进入"项目管理"页面
- [ ] 可以看到项目列表
- [ ] 点击"+ 创建项目"进入创建页面
- [ ] 分步骤表单正常工作：
  - Step 1: 基本信息（选择客户）
  - Step 2: 产品信息
  - Step 3: 竞品信息（可添加/删除多个竞品）
- [ ] 点击"下一步"/"上一步"正常切换
- [ ] 点击"创建"成功创建项目
- [ ] 点击项目卡片进入详情页
- [ ] 点击"删除"可以删除项目

- [ ] **Step 7: 验证 Optimizer 角色**

邮箱：optimizer@test.com
密码：optimizer123

- [ ] 侧边栏显示"管理中心"菜单
- [ ] 只显示"客户列表"和"项目列表"（无用户管理、配额管理）
- [ ] 可以查看客户和项目，但无管理操作

- [ ] **Step 8: 修复发现的问题**

如有问题，修复后提交：

```bash
git add .
git commit -m "fix: address issues found during Phase 3 testing"
```

---

### Task 6.3: 最终提交

- [ ] **Step 1: 查看所有更改**

```bash
git status
```

- [ ] **Step 2: 查看提交历史**

```bash
git log --oneline -20
```

---

## 验收标准

阶段 3 完成后，应该满足：

### 3.1 用户管理
- [ ] 可以查看用户列表
- [ ] 可以创建新用户（选择角色）
- [ ] 可以删除用户（有确认提示）
- [ ] 点击用户可查看详情

### 3.2 客户管理
- [ ] 可以查看客户列表（显示配额信息）
- [ ] 可以创建客户档案
- [ ] 可以编辑客户信息
- [ ] 配额列显示"已用/总量"格式

### 3.3 配额管理
- [ ] 可以查看配额包列表
- [ ] 可以创建/编辑配额包
- [ ] 充值流程完整（选择客户 → 选择配额包 → 确认）
- [ ] 可以查看充值历史记录

### 3.4 项目管理
- [ ] 可以查看项目列表
- [ ] 分步骤创建项目（3步）
- [ ] 可以编辑项目
- [ ] 可以删除项目
- [ ] 表单验证正确（必填项检查）

### 导航菜单
- [ ] Admin 显示完整管理中心菜单
- [ ] Optimizer 显示受限管理中心菜单
- [ ] 子菜单可以展开/折叠

---

## 后续优化

阶段 3 完成后，可考虑：

- 数据导出功能（Excel）
- 批量操作（批量删除、批量充值）
- 高级搜索和筛选
- 实时数据更新（WebSocket）
