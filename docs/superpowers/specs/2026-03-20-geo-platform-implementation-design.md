# GEO 优化平台 - 前端实现设计

**日期：** 2026-03-20
**版本：** 1.0

---

## 1. 概述

本文档描述 GEO（Generative Engine Optimization）优化平台的前端实现设计。该平台帮助企业和内容创作者优化内容，让 ChatGPT、Perplexity 等 AI 搜索引擎更容易引用。

### 1.1 设计目标

- 实现核心工单流程：创建 → 领取 → 处理 → 交付 → 审核
- 支持三种用户角色：admin、optimizer、customer
- 提供清晰的数据可视化和操作界面
- 使用现代技术栈，确保良好的开发体验和用户体验

### 1.2 新增功能

相比原始设计规范，新增以下功能：
1. **优化历史记录** - 在工单详情页显示该工单的所有优化版本
2. **配额显示集成** - 在 Customer Dashboard 中显示配额信息

---

## 2. 技术栈

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Next.js 16 + React 19 + TypeScript | 最新版本，支持 App Router |
| 样式 | Tailwind CSS 4 | 原子化 CSS |
| UI 组件 | shadcn/ui | 基于 Radix UI，可定制性强 |
| 状态管理 | React Context + hooks | 轻量级状态管理 |
| 数据获取 | 原生 fetch | 简单直接 |
| 认证 | JWT + localStorage | Token 存储在本地 |

---

## 3. 目录结构

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx              # 登录页
├── (dashboard)/                  # 受保护路由组
│   ├── layout.tsx                # 侧边栏布局
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard
│   ├── tickets/
│   │   ├── page.tsx              # 工单列表
│   │   ├── new/
│   │   │   └── page.tsx          # 创建工单
│   │   └── [id]/
│   │       └── page.tsx          # 工单详情（含优化历史）
│   └── optimizer/                # 阶段 2
│       └── tickets/
│           └── page.tsx          # 工单池
├── layout.tsx
└── page.tsx                      # 根页面重定向

lib/
├── api.ts                        # API 封装
├── auth.ts                       # 认证逻辑
└── types.ts                      # 类型定义

components/
├── layout/
│   ├── sidebar.tsx               # 侧边栏导航
│   └── header.tsx                # 顶部栏
├── ticket/
│   ├── ticket-card.tsx           # 工单卡片
│   ├── ticket-status.tsx         # 状态徽章
│   ├── optimization-history.tsx  # 优化历史记录（新增）
│   └── score-comparison.tsx      # 评分对比组件
└── ui/                           # shadcn/ui 组件
```

---

## 4. 认证与路由

### 4.1 认证流程

```
用户输入邮箱密码
       ↓
POST /login
       ↓
返回 accessToken + refreshToken
       ↓
存储到 localStorage
       ↓
跳转到 /dashboard
       ↓
每次请求携带 Authorization: Bearer <token>
       ↓
401 响应 → 清除 token → 跳转 /login
```

### 4.2 路由与权限

| 路由 | admin | optimizer | customer |
|------|-------|-----------|----------|
| /login | ✅ | ✅ | ✅ |
| /dashboard | ✅ | ✅ | ✅ |
| /tickets | ✅ | ✅ | ✅（只看自己的）|
| /tickets/new | ✅ | ✅ | ✅ |
| /tickets/[id] | ✅ | ✅ | ✅（自己的）|
| /optimizer/tickets | ✅ | ✅ | ❌ |

### 4.3 路由保护

在 `(dashboard)` 路由组的 layout 中检查认证状态：

```typescript
// app/(dashboard)/layout.tsx
const token = localStorage.getItem('accessToken');
if (!token) {
  redirect('/login');
}
```

---

## 5. 页面设计

### 5.1 登录页 (/login)

简洁的登录表单，包含邮箱和密码输入。

**接口：** `POST /login`

### 5.2 Dashboard (/dashboard)

#### Admin/Optimizer Dashboard

- 统计卡片：待处理、今日完成、进行中、本周完成
- 最近活动列表
- 快捷操作入口

#### Customer Dashboard

- 配额卡片：显示剩余配额/总量、过期时间
- 统计卡片：待审核、已完成
- 最近工单列表

**接口：**
- `GET /tickets` - 获取工单列表和统计
- `GET /customers/me` - Customer 获取配额信息

### 5.3 工单列表 (/tickets)

- 筛选器：全部、待领取、处理中、待审核、已完成
- 工单卡片：标题、项目、状态、摘要、评分对比
- 刷新按钮：手动刷新列表
- 创建工单按钮（阶段 1：admin/optimizer/customer）

**接口：** `GET /tickets`

### 5.4 创建工单 (/tickets/new)

- 选择项目（下拉选择客户的项目）
- 工单标题
- 原始内容（文本输入）
- 是否需要审核（开关，默认开启）

**接口：** `POST /tickets`

### 5.5 工单详情 (/tickets/[id])

#### 共通元素

- 工单标题、状态、项目、创建时间
- 评分对比：优化前 → 优化后，显示提升幅度
- 优化历史记录：显示该工单的所有优化版本

#### Customer 视角（reviewing 状态）

- 显示优化后内容
- 审核操作：通过/打回按钮
- 打回需填写原因

**接口：** `POST /tickets/:id/review`

#### Optimizer 视角（assigned/processing 状态）

- 显示原始内容
- 优化策略选择：结构化、Schema、答案优先、权威性、FAQ
- 目标平台选择：ChatGPT、Perplexity、Google AI、Claude
- 关键词输入
- 操作按钮：执行优化、提交结果、交付

**接口：**
- `POST /optimizer/tickets/:id/optimize` - 执行优化
- `PUT /optimizer/tickets/:id/result` - 提交结果
- `POST /optimizer/tickets/:id/deliver` - 交付工单
- `GET /optimizer/tickets/:id/optimizations` - 获取优化历史

### 5.6 工单池 (/optimizer/tickets) - 阶段 2

- 显示所有 pending 状态的工单
- 领取按钮（只能领取 pending 状态）

**接口：**
- `GET /optimizer/tickets` - 获取待处理工单池
- `POST /optimizer/tickets/:id/claim` - 领取工单

---

## 6. 状态管理

### 6.1 AuthContext

```typescript
interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

### 6.2 数据刷新策略

使用**手动刷新**方式，用户点击刷新按钮获取最新数据。

---

## 7. UI 组件

### 7.1 状态颜色

| 状态 | 颜色 | 文案 |
|------|------|------|
| pending | gray | 待领取 |
| assigned | blue | 已分配 |
| processing | orange | 处理中 |
| reviewing | purple | 待审核 |
| completed | green | 已完成 |

### 7.2 核心组件

- `TicketCard` - 工单卡片，显示摘要信息
- `TicketStatus` - 状态徽章
- `ScoreComparison` - 评分对比组件
- `OptimizationHistory` - 优化历史记录（新增）
- `RequireRole` - 权限控制组件

---

## 8. 错误处理

### 8.1 统一错误格式

```json
{
  "message": "Error description"
}
```

### 8.2 错误处理策略

| 状态码 | 处理方式 |
|--------|----------|
| 400 | 显示具体错误信息 |
| 401 | 清除 token，跳转登录页 |
| 403 | 显示"无权限访问" |
| 404 | 显示"数据不存在"或跳转列表页 |
| 500 | 显示"系统繁忙，请稍后重试" |

---

## 9. 接口依赖清单

### 阶段 1（客户侧流程）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/login` | POST | 登录获取 token |
| `/tickets` | GET | 获取工单列表 |
| `/tickets` | POST | 创建工单 |
| `/tickets/:id` | GET | 获取工单详情 |
| `/tickets/:id/review` | POST | 审核工单 |
| `/customers/me` | GET | 获取客户配额信息 |

### 阶段 2（优化师侧流程）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/optimizer/tickets` | GET | 获取待处理工单池 |
| `/optimizer/tickets/:id/claim` | POST | 领取工单 |
| `/optimizer/tickets/:id/process` | POST | 开始处理 |
| `/optimizer/tickets/:id/optimize` | POST | 执行优化 |
| `/optimizer/tickets/:id/result` | PUT | 提交结果 |
| `/optimizer/tickets/:id/deliver` | POST | 交付工单 |
| `/optimizer/tickets/:id/optimizations` | GET | 获取优化历史 |

---

## 10. 阶段划分

| 阶段 | 内容 | 交付物 |
|------|------|--------|
| **阶段 1** | 登录 + 客户侧完整流程 + Dashboard（含配额显示） | 客户可用 MVP |
| **阶段 2** | 优化师侧流程（工单池、领取、处理、交付）+ 优化历史记录 | 优化师可用 |
| **阶段 3** | 配额管理、项目管理等 Admin 功能 | 完整平台 |

---

## 11. 验收标准

### 阶段 1

1. 三种角色可以登录并看到对应的导航菜单
2. Customer 可以创建工单、查看自己的工单、审核工单
3. Customer Dashboard 显示正确的配额信息和统计
4. 工单详情页显示评分对比和优化后内容
5. 权限控制正确（无法越权访问）

### 阶段 2

1. Admin/Optimizer 可以查看工单池、领取工单
2. 可以执行优化、提交结果、交付工单
3. 优化历史记录正确显示
4. 工单状态流转正确

---

## 12. 设计风格

- **风格**：现代 SaaS 风（Vercel/Stripe 风格）
- **布局**：侧边栏导航 + 主内容区
- **组件**：圆角卡片、渐变、清晰的视觉层次
- **响应式**：支持桌面端为主，移动端自适应

---

## 附录：原始设计文档

- `docs/API.md` - 后端 API 文档
- `docs/FRONTEND_GUIDE.md` - 前端开发指南
- `docs/superpowers/specs/2026-03-20-phase1-core-ticket-flow-design.md` - 阶段 1 核心工单流程设计
