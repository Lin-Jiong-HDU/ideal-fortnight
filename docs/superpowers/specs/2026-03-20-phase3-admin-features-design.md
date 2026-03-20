# GEO 平台阶段 3：Admin 高级功能设计

**日期：** 2026-03-20
**版本：** 1.0

---

## 1. 概述

阶段 3 实现 Admin 角色的高级管理功能，包括用户管理、客户管理、配额管理和项目管理。这些功能让管理员能够完整管理平台的用户、客户、配额和项目数据。

### 1.1 阶段划分

| 子阶段 | 模块 | 复杂度 | 说明 |
|--------|------|--------|------|
| 3.1 | 用户管理 | 简单 | 基础 CRUD，无复杂表单 |
| 3.2 | 客户管理 | 中等 | 涉及配额显示和关联 |
| 3.3 | 配额管理 | 中等 | 配额包管理 + 充值流程 |
| 3.4 | 项目管理 | 复杂 | 多步骤表单，大量字段 |

### 1.2 技术方案

- **复用现有架构**：基于 Phase 1/2 的布局和组件
- **通用组件抽象**：DataTable、FormDialog、ConfirmDialog
- **分步骤表单**：StepWizard 组件处理项目管理

---

## 2. 3.1 用户管理

### 2.1 页面

**路由：** `/admin/users`

### 2.2 功能

| 功能 | 说明 | API |
|------|------|-----|
| 用户列表 | 表格：邮箱、姓名、角色、创建时间 | `GET /users` |
| 创建用户 | 对话框：邮箱、密码、姓名、角色选择 | `POST /users` |
| 删除用户 | 二次确认后删除 | `DELETE /users/:id` |
| 用户详情 | 只读视图显示用户信息 | `GET /users/:id` |

### 2.3 界面设计

```
┌─────────────────────────────────────────────────────────┐
│  管理中心 > 用户管理                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ 创建用户]                    [搜索框]                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 邮箱              │ 姓名   │ 角色   │ 创建时间    │ │
│  │ admin@test.com    │ Admin  │ admin  │ 2026-03-20 │ │
│  │ optimizer@test.com│ Optim  │ opt    │ 2026-03-20 │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 3.2 客户管理

### 3.1 页面

**路由：** `/admin/customers`

### 3.2 功能

| 功能 | 说明 | API |
|------|------|-----|
| 客户列表 | 表格：公司名、行业、配额剩余/总量、创建时间 | `GET /customers` |
| 创建客户 | 对话框：公司名称*、联系电话、行业、备注 | `POST /customers` |
| 编辑客户 | 同创建字段 | `PUT /customers/:id` |
| 充值入口 | 跳转到配额管理页并预选该客户 | - |
| 客户详情 | 查看完整客户信息和关联项目 | `GET /customers/:id` |

### 3.3 界面设计

```
┌─────────────────────────────────────────────────────────┐
│  管理中心 > 客户管理                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ 创建客户]                    [搜索框]                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 公司名称    │ 行业    │ 配额      │ 充值 │ 操作   │ │
│  │ 某某科技    │ Tech    │ 8/10      │ [充值]│ 编辑   │ │
│  │ 产品公司    │ SaaS    │ 15/50     │ [充值]│ 编辑   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 3.3 配额管理

### 4.1 页面

**路由：** `/admin/quotas`

### 4.2 功能

| 功能 | 说明 | API |
|------|------|-----|
| 配额包列表 | 卡片视图：名称、文章数、价格 | `GET /quota-packages` |
| 创建配额包 | 对话框：名称、文章数、价格 | `POST /quota-packages` |
| 编辑配额包 | 同创建字段 | `PUT /quota-packages/:id` |
| 充值流程 | 选择客户 → 选择配额包 → 填写备注 → 确认 | `POST /customers/:id/quota` |
| 充值历史 | 表格：客户、配额包、数量、时间、操作人 | `GET /customers/:id/quota/history` |

### 4.3 充值流程设计

```
┌─────────────────────────────────────────────────────────┐
│  为客户充值配额                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: 选择客户 *                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ 某某科技有限公司                                │   │
│  │ ○ 产品设计公司                                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Step 2: 选择配额包 *                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ 基础包 - 10篇文章 - ¥99                        │   │
│  │ ● 专业包 - 50篇文章 - ¥299                       │   │
│  │ ○ 企业包 - 200篇文章 - ¥999                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Step 3: 确认信息                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 客户：某某科技有限公司                            │   │
│  │ 配额包：专业包 (50篇)                            │   │
│  │ 备注：首次购买                                    │   │
│  │                                                  │   │
│  │ [取消]                              [确认充值]  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.4 充值历史表格

```
┌─────────────────────────────────────────────────────────┐
│  充值历史                                               │
├─────────────────────────────────────────────────────────┤
│  客户        │ 配额包  │ 数量 │ 时间        │ 操作人   │
│  某某科技    │ 专业包  │ +50  │ 2026-03-20 │ Admin    │
│  产品公司    │ 基础包  │ +10  │ 2026-03-19 │ Admin    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. 3.4 项目管理

### 5.1 页面

**路由：** `/admin/projects`

### 5.2 功能

| 功能 | 说明 | API |
|------|------|-----|
| 项目列表 | 卡片视图：项目名、客户公司、创建时间 | `GET /projects` |
| 创建项目 | 分步骤表单（3步） | `POST /projects` |
| 编辑项目 | 同创建流程 | `PUT /projects/:id` |
| 删除项目 | 二次确认后删除 | `DELETE /projects/:id` |
| 项目详情 | 查看完整项目信息 | `GET /projects/:id` |

### 5.3 分步骤表单设计

#### Step 1: 基本信息

```
┌─────────────────────────────────────────────────────────┐
│  创建项目 - Step 1/3: 基本信息                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  客户 *         [下拉选择客户]                          │
│                                                         │
│  企业信息                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 公司名称 *        [输入框]                        │   │
│  │ 公司网站          [输入框]                        │   │
│  │ 公司描述          [文本域]                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [上一步]                              [下一步 →]      │
└─────────────────────────────────────────────────────────┘
```

#### Step 2: 产品信息

```
┌─────────────────────────────────────────────────────────┐
│  创建项目 - Step 2/3: 产品信息                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  产品名称 *      [输入框]                                │
│  产品 URL       [输入框]                                │
│  产品描述       [文本域]                                │
│                                                         │
│  产品特性       [标签输入，可多选]                       │
│  USP            [标签输入，可多选]                       │
│  品牌调性       [输入框]                                │
│  目标受众       [输入框]                                │
│                                                         │
│  [← 上一步]                            [下一步 →]      │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: 竞品信息

```
┌─────────────────────────────────────────────────────────┐
│  创建项目 - Step 3/3: 竞品信息                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  竞品列表                              [+ 添加竞品]    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 竞品 1                                          │   │
│  │   名称: [输入框]                                │   │
│  │   网站: [输入框]                                │   │
│  │   弱点: [标签输入]                              │   │
│  │   常见异议: [标签输入]                          │   │
│  │   [删除]                                        │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 竞品 2                           [+ 添加竞品]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [← 上一步]                            [创建 →]      │
└─────────────────────────────────────────────────────────┘
```

---

## 6. 导航菜单更新

### 6.1 Admin 菜单

```typescript
const adminNavItems = [
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
];
```

### 6.2 Optimizer 菜单

```typescript
const optimizerNavItems = [
  { label: '工作台', href: '/dashboard', icon: '📊' },
  { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
  { label: '我的工单', href: '/tickets', icon: '📋' },
  { label: '创建工单', href: '/tickets/new', icon: '➕' },
  { label: '管理中心', href: '/admin', icon: '⚙️', subitems: [
    { label: '客户列表', href: '/admin/customers', icon: '🏢' },
    { label: '项目列表', href: '/admin/projects', icon: '📁' },
  ]},
];
```

---

## 7. 共享组件设计

### 7.1 DataTable - 通用数据表格

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

// 用法示例
<DataTable
  data={users}
  columns={[
    { key: 'email', label: '邮箱' },
    { key: 'name', label: '姓名' },
    { key: 'role', label: '角色' },
  ]}
/>
```

### 7.2 FormDialog - 表单对话框

```typescript
interface FormDialogProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  children: ReactNode;
}
```

### 7.3 ConfirmDialog - 确认对话框

```typescript
interface ConfirmDialogProps {
  title: string;
  message: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
```

### 7.4 StepWizard - 分步骤向导

```typescript
interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}
```

---

## 8. 文件结构

```
app/
├── (dashboard)/
│   └── admin/                        # 阶段 3 新增
│       ├── layout.tsx                # Admin 布局（可选）
│       ├── users/
│       │   └── page.tsx              # 3.1 用户管理
│       ├── customers/
│       │   ├── page.tsx              # 3.2 客户管理
│       │   └── [id]/
│       │       └── page.tsx          # 客户详情
│       ├── quotas/
│       │   └── page.tsx              # 3.3 配额管理
│       └── projects/
│           ├── page.tsx              # 3.4 项目管理
│           ├── new/
│           │   └── page.tsx          # 创建项目
│           └── [id]/
│               ├── page.tsx          # 项目详情
│               └── edit/
│                   └── page.tsx      # 编辑项目

lib/
├── api.ts                            # 扩展：添加 admin 相关 API
└── types.ts                          # 扩展：添加 QuotaPackage 类型

components/
├── admin/
│   ├── data-table.tsx                # 通用数据表格
│   ├── form-dialog.tsx               # 表单对话框
│   ├── confirm-dialog.tsx            # 确认对话框
│   └── step-wizard.tsx               # 分步骤向导
├── quota/
│   └── quota-card.tsx                # 配额包卡片
└── layout/
    └── sidebar.tsx                   # 更新：添加管理中心菜单
```

---

## 9. API 扩展

### 9.1 新增类型定义

```typescript
// lib/types.ts

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

### 9.2 API 方法

```typescript
// lib/api.ts

export const api = {
  // ... 现有方法

  // 用户管理
  admin: {
    getUsers: () => request<User[]>('/users'),
    getUser: (id: string) => request<User>(`/users/${id}`),
    createUser: (data: { email: string; password: string; name: string; role: UserRole }) =>
      request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
      request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
  },

  // 客户管理
  getCustomers: () => request<Customer[]>('/customers'),
  getCustomer: (id: string) => request<Customer>(`/customers/${id}`),
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
  getQuotaPackages: () => request<QuotaPackage[]>('/quota-packages'),
  createQuotaPackage: (data: { name: string; articles: number; price: number }) =>
    request<QuotaPackage>('/quota-packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateQuotaPackage: (id: string, data: { name?: string; articles?: number; price?: number }) =>
    request<QuotaPackage>(`/quota-packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  rechargeQuota: (customerId: string, data: { packageId: string; remark: string }) =>
    request<{ message: string }>(`/customers/${customerId}/quota`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getQuotaHistory: (customerId: string) =>
    request<QuotaHistory[]>(`/customers/${customerId}/quota/history`),

  // 项目管理
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: ProjectCreateRequest) =>
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
    request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
};
```

---

## 10. 验收标准

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

---

## 11. 后续优化

阶段 3 完成后，可考虑：

- 数据导出功能（Excel）
- 批量操作（批量删除、批量充值）
- 高级搜索和筛选
- 实时数据更新（WebSocket）
