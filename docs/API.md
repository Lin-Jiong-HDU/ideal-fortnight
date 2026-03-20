# GEO Service API 文档

Base URL: `http://localhost:8080`

## 目录

- [认证](#认证)
- [用户管理](#用户管理)
- [客户管理](#客户管理)
- [配额管理](#配额管理)
- [项目管理](#项目管理)
- [工单系统](#工单系统)

---

## 认证

### 登录

```
POST /login
```

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 认证方式

所有受保护的 API 需要在请求头中携带 Token：

```
Authorization: Bearer <accessToken>
```

### 用户角色

| 角色 | 权限 |
|------|------|
| `admin` | 所有权限 |
| `optimizer` | 查看/管理项目、工单处理 |
| `customer` | 创建工单、查看自己的数据 |

---

## 用户管理

> 需要 admin 或 optimizer 角色

### 获取用户列表

```
GET /users
```

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@test.com",
    "name": "User Name",
    "role": "customer",
    "createdAt": "2026-03-19T10:00:00Z"
  }
]
```

### 获取用户详情

```
GET /users/:id
```

### 创建用户

```
POST /users
```

**Request Body:**
```json
{
  "email": "newuser@test.com",
  "password": "password123",
  "name": "New User",
  "role": "customer"
}
```

### 删除用户

```
DELETE /users/:id
```

> 需要 admin 角色

---

## 客户管理

### 获取客户列表

```
GET /customers
```

> 需要 admin 或 optimizer 角色

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "companyName": "Test Company",
    "industry": "Technology",
    "contactPhone": "1234567890",
    "notes": "",
    "quotaTotal": 10,
    "quotaUsed": 0,
    "quotaExpireAt": "2026-04-18T00:00:00Z",
    "createdAt": "2026-03-19T10:00:00Z",
    "updatedAt": "2026-03-19T10:00:00Z"
  }
]
```

### 获取客户详情

```
GET /customers/:id
```

### 创建客户档案

```
POST /customers
```

> 需要 admin 角色

**Request Body:**
```json
{
  "userId": "user-uuid",
  "companyName": "Company Name",
  "industry": "Technology",
  "contactPhone": "1234567890",
  "notes": "Optional notes"
}
```

### 更新客户档案

```
PUT /customers/:id
```

> 需要 admin 角色

**Request Body:**
```json
{
  "companyName": "New Company Name",
  "industry": "Finance",
  "contactPhone": "0987654321",
  "notes": "Updated notes"
}
```

---

## 配额管理

> 所有配额接口需要 admin 角色

### 获取配额包列表

```
GET /quota-packages
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Basic",
    "articles": 10,
    "validDays": 30,
    "price": 99,
    "description": "Basic package",
    "createdAt": "2026-03-19T10:00:00Z",
    "updatedAt": "2026-03-19T10:00:00Z"
  }
]
```

### 创建配额包

```
POST /quota-packages
```

**Request Body:**
```json
{
  "name": "Pro",
  "articles": 50,
  "validDays": 90,
  "price": 299,
  "description": "Professional package"
}
```

### 更新配额包

```
PUT /quota-packages/:id
```

### 为客户充值配额

```
POST /customers/:id/quota
```

**Request Body:**
```json
{
  "packageId": "quota-package-uuid",
  "remark": "Initial purchase"
}
```

**Response:**
```json
{
  "message": "Quota added successfully"
}
```

### 查看配额历史

```
GET /customers/:id/quota/history
```

**Response:**
```json
[
  {
    "id": "uuid",
    "customerId": "uuid",
    "changeType": "purchase",
    "amount": 10,
    "balanceAfter": 10,
    "ticketId": null,
    "remark": "Initial purchase",
    "createdAt": "2026-03-19T10:00:00Z"
  }
]
```

---

## 项目管理

> 需要 admin 或 optimizer 角色

### 获取项目列表

```
GET /projects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "customerId": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "enterpriseInfo": {
      "companyName": "Company",
      "companyWebsite": "https://example.com",
      "companyDescription": "Company description",
      "productName": "Product",
      "productUrl": "https://product.example.com",
      "productDescription": "Product description",
      "productFeatures": ["Feature 1", "Feature 2"],
      "usp": ["USP 1", "USP 2"],
      "brandVoice": "Professional",
      "targetAudience": "Developers",
      "certifications": ["ISO 9001"],
      "awards": ["Best Product 2025"]
    },
    "competitorInfo": [
      {
        "name": "Competitor A",
        "website": "https://competitor-a.com",
        "weaknesses": ["Expensive", "Slow"],
        "commonObjections": ["Price is too high"]
      }
    ],
    "createdBy": "uuid",
    "createdAt": "2026-03-19T10:00:00Z",
    "updatedAt": "2026-03-19T10:00:00Z"
  }
]
```

### 获取项目详情

```
GET /projects/:id
```

### 创建项目

```
POST /projects
```

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "name": "New Project",
  "description": "Project description",
  "enterpriseInfo": {
    "companyName": "Company Name",
    "productName": "Product Name",
    "usp": ["Fast", "Reliable", "Affordable"]
  },
  "competitorInfo": [
    {
      "name": "Competitor",
      "weaknesses": ["Slow", "Expensive"]
    }
  ]
}
```

### 更新项目

```
PUT /projects/:id
```

### 删除项目

```
DELETE /projects/:id
```

> 需要 admin 角色

### 获取客户的项目列表

```
GET /customers/:id/projects
```

---

## 工单系统

### 工单状态流转

```
pending → assigned → processing → reviewing → completed
                                    ↓
                              (rejected)
                                    ↓
                              processing
```

| 状态 | 说明 |
|------|------|
| `pending` | 待领取 |
| `assigned` | 已分配 |
| `processing` | 处理中 |
| `reviewing` | 待审核 |
| `completed` | 已完成 |

---

### 客户端接口

> 需要 customer 角色

#### 创建工单

```
POST /tickets
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "title": "需要优化的文章标题",
  "content": "原始文章内容...",
  "sourceType": "text",
  "sourceFileUrl": "https://optional-file-url.com/file.pdf",
  "needReview": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "projectId": "uuid",
  "optimizerId": null,
  "title": "需要优化的文章标题",
  "originalContent": "原始文章内容...",
  "optimizedContent": "",
  "sourceType": "text",
  "sourceFileUrl": null,
  "status": "pending",
  "needReview": true,
  "reviewStatus": null,
  "scoreBefore": 0,
  "scoreAfter": 0,
  "createdAt": "2026-03-19T10:00:00Z",
  "assignedAt": null,
  "completedAt": null
}
```

#### 获取我的工单列表

```
GET /tickets
```

#### 获取工单详情

```
GET /tickets/:id
```

#### 审核工单

```
POST /tickets/:id/review
```

**Request Body:**
```json
{
  "approved": true,
  "comment": "审核通过，效果很好"
}
```

---

### 优化师端接口

> 需要 optimizer 或 admin 角色

#### 获取待处理工单池

```
GET /optimizer/tickets
```

**Response:**
```json
[
  {
    "id": "uuid",
    "customerId": "uuid",
    "projectId": "uuid",
    "title": "工单标题",
    "originalContent": "原始内容",
    "status": "pending",
    "createdAt": "2026-03-19T10:00:00Z"
  }
]
```

#### 领取工单

```
POST /optimizer/tickets/:id/claim
```

**Response:** 工单状态变为 `assigned`

#### 开始处理

```
POST /optimizer/tickets/:id/process
```

**Response:** 工单状态变为 `processing`

#### 提交优化结果

```
PUT /optimizer/tickets/:id/result
```

**Request Body:**
```json
{
  "optimizedContent": "优化后的文章内容...",
  "scoreBefore": 45.5,
  "scoreAfter": 78.2
}
```

#### 交付工单

```
POST /optimizer/tickets/:id/deliver
```

- 如果 `needReview: true`，状态变为 `reviewing`
- 如果 `needReview: false`，状态直接变为 `completed`

---

## 错误响应

所有错误响应格式：

```json
{
  "message": "Error description"
}
```

### 常见错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| Admin | admin@test.com | admin123 |
| Optimizer | optimizer@test.com | optimizer123 |
| Customer | customer@test.com | customer123 |

---

## 缓存策略

服务使用 Redis 进行数据缓存，提升读取性能。

### 缓存的数据

| 数据类型 | 缓存键 | TTL | 说明 |
|----------|--------|-----|------|
| 配额包列表 | `quota_packages:all` | 1小时 | 静态配置数据，很少变化 |
| 客户档案 | `customer:user:{userID}` | 10分钟 | 按用户ID缓存客户档案 |
| 项目详情 | `project:{id}` | 15分钟 | 按项目ID缓存项目信息 |
| 客户项目列表 | `customer:projects:{customerID}` | 15分钟 | 按客户ID缓存项目列表 |

### 缓存失效

- **写入操作自动失效**：创建、更新、删除操作会自动清除相关缓存
- **配额变更**：客户配额变更会清除客户档案缓存

### 环境配置

```bash
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## 开发环境启动

```bash
# 启动服务
go run cmd/main.go

# 或编译后运行
go build -o bookish-train cmd/main.go
./bookish-train
```

服务默认运行在 `http://localhost:8080`

---

## 优化器接口

> 需要 optimizer 或 admin 角色

### 检查服务状态

```
GET /optimizer/status
```

**Response:**
```json
{
  "available": true,
  "message": "Optimization service is available"
}
```

### 执行优化

```
POST /optimizer/tickets/:id/optimize
```

**Request Body:**
```json
{
  "strategies": ["structure", "schema", "faq"],
  "targetAI": ["chatgpt", "perplexity"],
  "keywords": ["云服务", "云计算"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "ticketId": "uuid",
  "optimizedContent": "优化后的完整内容...",
  "scoreBefore": 45.5,
  "scoreAfter": 78.2,
  "strategies": ["structure", "schema", "faq"],
  "targetAI": ["chatgpt", "perplexity"],
  "keywords": ["云服务", "云计算"],
  "tokensUsed": 2500,
  "llmModel": "glm-4.7",
  "status": "completed",
  "createdAt": "2026-03-19T10:00:00Z",
  "completedAt": "2026-03-19T10:00:30Z"
}
```

### 获取工单优化历史

```
GET /optimizer/tickets/:id/optimizations
```

**Response:**
```json
[
  {
    "id": "uuid",
    "optimizedContent": "...",
    "scoreBefore": 45.5,
    "scoreAfter": 78.2,
    "strategies": ["structure"],
    "status": "completed",
    "createdAt": "2026-03-19T10:00:00Z"
  }
]
```

### 获取项目优化历史

```
GET /optimizer/projects/:id/optimizations?page=1&pageSize=20
```

**Response:**
```json
{
  "projectId": "uuid",
  "totalOptimizations": 45,
  "totalTokensUsed": 125000,
  "avgScoreImprovement": 32.5,
  "optimizations": [
    {
      "id": "uuid",
      "ticketId": "uuid",
      "optimizedContent": "...",
      "scoreBefore": 45.0,
      "scoreAfter": 78.5,
      "tokensUsed": 2500,
      "status": "completed",
      "createdAt": "2026-03-19T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45
  }
}
```

### 获取单次优化详情

```
GET /optimizer/optimizations/:id
```

### 优化策略说明

| 策略 | 说明 |
|------|------|
| `structure` | 结构化优化 - 添加标题层级、列表、章节划分 |
| `schema` | Schema 标记 - 生成 JSON-LD 结构化数据 |
| `answer_first` | 答案优先 - 将关键结论移到开头 |
| `authority` | 权威性增强 - 添加数据支撑和专业元素 |
| `faq` | FAQ 生成 - 生成常见问题章节 |

### 目标平台

| 平台 | 说明 |
|------|------|
| `chatgpt` | ChatGPT - 专业性强、结构化 |
| `perplexity` | Perplexity - 简洁直接、带引用 |
| `google_ai` | Google AI - 全面详细、学术风格 |
| `claude` | Claude - 对话式、可读性高 |

### 环境配置

```bash
GLM_API_KEY=your-glm-api-key-here
GLM_MODEL=glm-4.7
GLM_MAX_TOKENS=8000
GLM_TEMPERATURE=0.7
GLM_TIMEOUT=300
```

