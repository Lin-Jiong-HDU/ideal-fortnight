# GEO 优化平台 - 前端开发指南

> 本文档面向前端开发者，帮助你理解这个产品的业务逻辑、数据流程以及如何正确使用后端 API。

---

## 1. 这个产品是什么？

### 一句话描述

这是一个 **AI 搜索引擎内容优化平台**（GEO - Generative Engine Optimization）。

### 解决什么问题？

当用户在 ChatGPT、Perplexity、Google AI 等 AI 搜索引擎中提问时，AI 会引用某些来源的内容。这个平台帮助企业和内容创作者**优化他们的内容，让 AI 更容易引用**。

### 两种服务模式

| 模式 | 谁在用 | 怎么用 |
|------|--------|--------|
| **SaaS 自助模式** | 客户自己 | 客户登录平台，自己提交内容、自己配置优化、自己查看结果 |
| **代服务模式** | 运营团队 | 客户把内容发给运营团队，团队帮忙优化后交付给客户 |

---

## 2. 三种用户角色

```
┌─────────────────────────────────────────────────────────────┐
│                        用户角色                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👑 admin (管理员)                                          │
│     └─ 拥有所有权限，管理用户、客户、配额包                    │
│                                                             │
│  🔧 optimizer (优化师)                                      │
│     └─ 处理工单、执行内容优化、查看项目和客户                  │
│                                                             │
│  👤 customer (客户)                                         │
│     └─ 创建工单、查看自己的数据、审核优化结果                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 角色与页面对应关系

| 页面/功能 | admin | optimizer | customer |
|-----------|:-----:|:---------:|:--------:|
| 用户管理 | ✅ | ✅ (只读) | ❌ |
| 客户管理 | ✅ | ✅ (只读) | ❌ |
| 配额管理 | ✅ | ❌ | ❌ |
| 项目管理 | ✅ | ✅ | ✅ (自己的) |
| 工单-客户视图 | ❌ | ❌ | ✅ |
| 工单-优化师视图 | ✅ | ✅ | ❌ |
| 执行优化 | ✅ | ✅ | ❌ |

---

## 3. 核心数据模型关系

```
┌──────────────┐     1:1      ┌──────────────────┐
│    User      │─────────────▶│ CustomerProfile  │
│  (用户账号)   │              │   (客户档案)      │
└──────────────┘              └────────┬─────────┘
                                       │
                                      1:N
                                       │
                              ┌────────▼─────────┐
                              │     Project      │
                              │    (项目)        │
                              │ - 企业配置       │
                              │ - 竞品信息       │
                              └────────┬─────────┘
                                       │
                                      1:N
                                       │
                              ┌────────▼─────────┐
                              │     Ticket       │
                              │    (工单)        │
                              │ - 原始内容       │
                              │ - 优化后内容     │
                              │ - 状态流转       │
                              └────────┬─────────┘
                                       │
                                      1:N
                                       │
                              ┌────────▼─────────┐
                              │  Optimization    │
                              │   (优化记录)      │
                              │ - 优化策略       │
                              │ - 评分变化       │
                              └──────────────────┘
```

### 关键概念解释

| 概念 | 说明 | 前端展示建议 |
|------|------|-------------|
| **User** | 登录账号，包含角色信息 | 登录后存储 token 和角色，控制页面权限 |
| **CustomerProfile** | 客户的企业信息、配额 | 客户详情页、配额显示 |
| **Project** | 一个品牌/网站的配置 | 项目列表、项目卡片 |
| **Ticket** | 一次优化任务 | 工单列表、工单详情 |
| **Optimization** | 每次AI优化的记录 | 优化历史、对比分析 |

---

## 4. 业务流程与 API 使用场景

### 4.1 登录认证流程

```
┌─────────────────────────────────────────────────────────────┐
│                        登录流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户输入邮箱密码                                            │
│       │                                                     │
│       ▼                                                     │
│  POST /login                                                │
│       │                                                     │
│       ├─── 成功: 返回 accessToken + refreshToken            │
│       │     └─► 前端存储 token，跳转到工作台                  │
│       │                                                     │
│       └─── 失败: 返回 401，提示账号密码错误                    │
│                                                             │
│  后续请求: Authorization: Bearer <accessToken>              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**前端实现要点：**
```javascript
// 1. 登录成功后存储 token
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);

// 2. 所有请求携带 token
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

// 3. Token 过期处理 (401)
// 可以用 refreshToken 刷新，或者跳转登录页
```

---

### 4.2 SaaS 自助模式：客户优化内容

**用户故事：** "我是一家企业客户，想优化一篇文章让 ChatGPT 更容易引用。"

```
┌─────────────────────────────────────────────────────────────┐
│                    SaaS 优化流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  步骤1: 登录后查看自己的客户档案                              │
│         GET /customers/me (如果有这个接口)                   │
│         或 GET /customers (customer 角色只能看到自己)         │
│                                                             │
│  步骤2: 查看或创建项目                                       │
│         GET /projects          ← 获取我的项目列表             │
│         POST /projects         ← 创建新项目（配置企业信息）    │
│                                                             │
│  步骤3: 创建工单（提交要优化的内容）                          │
│         POST /tickets                                        │
│         {                                                    │
│           "projectId": "xxx",                               │
│           "title": "文章标题",                               │
│           "content": "原始内容...",                          │
│           "needReview": true                                 │
│         }                                                    │
│                                                             │
│  步骤4: 查看工单状态                                         │
│         GET /tickets/:id      ← 轮询或监听状态变化            │
│                                                             │
│  步骤5: 审核优化结果（如果 needReview=true）                  │
│         POST /tickets/:id/review                             │
│         { "approved": true, "comment": "效果不错" }          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**工单状态变化（customer 视角）：**

```
pending (刚提交，等待优化师领取)
    ↓
assigned (已被领取)
    ↓
processing (正在优化)
    ↓
reviewing (优化完成，等待我审核)
    ↓
completed (我已通过，完成)
   或
   (我打回，回到 processing)
```

---

### 4.3 代服务模式：优化师处理工单

**用户故事：** "我是优化师，需要领取工单并执行优化。"

```
┌─────────────────────────────────────────────────────────────┐
│                    优化师工作流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  步骤1: 查看待处理工单池                                     │
│         GET /optimizer/tickets                              │
│         返回所有 pending 状态的工单                          │
│                                                             │
│  步骤2: 领取工单（只能领取 pending 状态的）                   │
│         POST /optimizer/tickets/:id/claim                   │
│         工单状态变为 assigned                               │
│                                                             │
│  步骤3: 开始处理                                             │
│         POST /optimizer/tickets/:id/process                 │
│         工单状态变为 processing                             │
│                                                             │
│  步骤4: 执行 AI 优化                                         │
│         POST /optimizer/tickets/:id/optimize                │
│         {                                                    │
│           "strategies": ["structure", "faq"],               │
│           "targetAI": ["chatgpt", "perplexity"],            │
│           "keywords": ["关键词1", "关键词2"]                 │
│         }                                                    │
│         返回优化后的内容和评分                               │
│                                                             │
│  步骤5: 提交结果                                             │
│         PUT /optimizer/tickets/:id/result                   │
│         {                                                    │
│           "optimizedContent": "优化后内容...",              │
│           "scoreBefore": 45.5,                              │
│           "scoreAfter": 78.2                                │
│         }                                                    │
│                                                             │
│  步骤6: 交付工单                                             │
│         POST /optimizer/tickets/:id/deliver                 │
│         - 如果 needReview=true → 状态变为 reviewing         │
│         - 如果 needReview=false → 状态直接变为 completed    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.4 配额管理流程

**业务逻辑：** 客户购买套餐，获得一定数量的文章优化配额。每完成一个工单，消耗1个配额。

```
┌─────────────────────────────────────────────────────────────┐
│                      配额流程                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【管理员视角】                                              │
│                                                             │
│  1. 查看配额包列表                                           │
│     GET /quota-packages                                     │
│                                                             │
│  2. 创建新配额包                                             │
│     POST /quota-packages                                    │
│     { "name": "专业包", "articles": 50, "price": 299 }      │
│                                                             │
│  3. 为客户充值配额                                           │
│     POST /customers/:id/quota                               │
│     { "packageId": "xxx", "remark": "首次购买" }            │
│                                                             │
│  4. 查看客户配额历史                                         │
│     GET /customers/:id/quota/history                        │
│                                                             │
│  【客户视角】                                                │
│                                                             │
│  在客户档案中可以看到:                                        │
│  - quotaTotal: 总配额                                        │
│  - quotaUsed: 已使用                                        │
│  - quotaExpireAt: 过期时间                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. API 快速参考

### 5.1 认证相关

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/login` | POST | 公开 | 登录获取 token |

### 5.2 用户管理

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/users` | GET | admin/optimizer | 用户列表 |
| `/users/:id` | GET | admin/optimizer | 用户详情 |
| `/users` | POST | admin | 创建用户 |
| `/users/:id` | DELETE | admin | 删除用户 |

### 5.3 客户管理

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/customers` | GET | admin/optimizer | 客户列表 |
| `/customers/:id` | GET | admin/optimizer/customer | 客户详情 |
| `/customers` | POST | admin | 创建客户档案 |
| `/customers/:id` | PUT | admin | 更新客户档案 |
| `/customers/:id/projects` | GET | admin/optimizer/customer | 客户的项目列表 |

### 5.4 配额管理

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/quota-packages` | GET | admin | 配额包列表 |
| `/quota-packages` | POST | admin | 创建配额包 |
| `/quota-packages/:id` | PUT | admin | 更新配额包 |
| `/customers/:id/quota` | POST | admin | 为客户充值配额 |
| `/customers/:id/quota/history` | GET | admin | 配额变更历史 |

### 5.5 项目管理

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/projects` | GET | 全部 | 项目列表（按角色过滤） |
| `/projects/:id` | GET | 全部 | 项目详情 |
| `/projects` | POST | admin/optimizer/customer | 创建项目 |
| `/projects/:id` | PUT | admin/optimizer/customer | 更新项目 |
| `/projects/:id` | DELETE | admin | 删除项目 |

### 5.6 工单系统 - 客户端

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/tickets` | GET | customer | 我的工单列表 |
| `/tickets` | POST | customer | 创建工单 |
| `/tickets/:id` | GET | customer | 工单详情 |
| `/tickets/:id/review` | POST | customer | 审核工单 |

### 5.7 工单系统 - 优化师端

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/optimizer/tickets` | GET | admin/optimizer | 待处理工单池 |
| `/optimizer/tickets/:id/claim` | POST | admin/optimizer | 领取工单 |
| `/optimizer/tickets/:id/process` | POST | admin/optimizer | 开始处理 |
| `/optimizer/tickets/:id/optimize` | POST | admin/optimizer | 执行优化 |
| `/optimizer/tickets/:id/result` | PUT | admin/optimizer | 提交结果 |
| `/optimizer/tickets/:id/deliver` | POST | admin/optimizer | 交付工单 |

### 5.8 优化记录

| 接口 | 方法 | 角色 | 说明 |
|------|------|------|------|
| `/optimizer/status` | GET | admin/optimizer | 优化服务状态 |
| `/optimizer/tickets/:id/optimizations` | GET | admin/optimizer | 工单优化历史 |
| `/optimizer/projects/:id/optimizations` | GET | admin/optimizer | 项目优化历史 |
| `/optimizer/optimizations/:id` | GET | admin/optimizer | 优化详情 |

---

## 6. 常见前端场景实现

### 场景1：根据用户角色显示不同导航

```javascript
// 登录后获取用户信息，根据角色渲染菜单
const role = user.role; // 'admin' | 'optimizer' | 'customer'

const menuItems = {
  admin: ['用户管理', '客户管理', '配额管理', '项目', '工单', '优化'],
  optimizer: ['客户', '项目', '工单池', '我的工单'],
  customer: ['我的项目', '提交工单', '我的工单', '配额']
};
```

### 场景2：工单状态徽章颜色

```javascript
const statusColors = {
  pending:   { color: 'gray',   text: '待领取' },
  assigned:  { color: 'blue',   text: '已分配' },
  processing:{ color: 'orange', text: '处理中' },
  reviewing: { color: 'purple', text: '待审核' },
  completed: { color: 'green',  text: '已完成' }
};
```

### 场景3：优化策略选择 UI

```javascript
const strategies = [
  { value: 'structure', label: '结构化优化', desc: '添加标题层级、列表、章节划分' },
  { value: 'schema', label: 'Schema 标记', desc: '生成 JSON-LD 结构化数据' },
  { value: 'answer_first', label: '答案优先', desc: '将关键结论移到开头' },
  { value: 'authority', label: '权威性增强', desc: '添加数据支撑和专业元素' },
  { value: 'faq', label: 'FAQ 生成', desc: '生成常见问题章节' }
];

const targetPlatforms = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'google_ai', label: 'Google AI' },
  { value: 'claude', label: 'Claude' }
];
```

### 场景4：轮询工单状态

```javascript
// 当工单处于 processing 状态时，定期查询状态
async function pollTicketStatus(ticketId) {
  const poll = async () => {
    const ticket = await api.get(`/tickets/${ticketId}`);
    if (ticket.status === 'reviewing') {
      // 停止轮询，显示审核界面
      showReviewUI(ticket);
    } else if (ticket.status === 'processing') {
      // 继续轮询
      setTimeout(poll, 3000);
    }
  };
  poll();
}
```

---

## 7. 错误处理

### 统一错误格式

```json
{
  "message": "Error description"
}
```

### 常见错误码处理

| 状态码 | 含义 | 前端处理建议 |
|--------|------|-------------|
| 400 | 参数错误 | 显示具体错误信息给用户 |
| 401 | 未授权 | 清除 token，跳转登录页 |
| 403 | 权限不足 | 显示"无权限访问"提示 |
| 404 | 资源不存在 | 显示"数据不存在"或跳转列表页 |
| 500 | 服务器错误 | 显示"系统繁忙，请稍后重试" |

---

## 8. 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| Admin | admin@test.com | admin123 |
| Optimizer | optimizer@test.com | optimizer123 |
| Customer | customer@test.com | customer123 |

---

## 9. 开发环境

```bash
# 后端服务地址
Base URL: http://localhost:8080

# 健康检查
GET http://localhost:8080/health
```

---

## 10. 完整业务流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              完整业务流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        【SaaS 自助模式】                              │   │
│  │                                                                     │   │
│  │  Customer 注册登录 → 创建项目 → 配置企业信息 → 创建工单              │   │
│  │       ↓                                                             │   │
│  │  Optimizer 领取工单 → 执行优化 → 交付                               │   │
│  │       ↓                                                             │   │
│  │  Customer 审核结果 → 通过/打回 → 完成（消耗配额）                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        【代服务模式】                                │   │
│  │                                                                     │   │
│  │  Admin 创建客户档案 → 配置配额 → 创建项目                           │   │
│  │       ↓                                                             │   │
│  │  客户提交内容（线下/工单系统）                                       │   │
│  │       ↓                                                             │   │
│  │  Optimizer 领取工单 → 执行优化 → 交付                               │   │
│  │       ↓                                                             │   │
│  │  Admin/客户确认 → 生成交付报告                                      │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

如有疑问，请参考详细 API 文档：`docs/API.md`
