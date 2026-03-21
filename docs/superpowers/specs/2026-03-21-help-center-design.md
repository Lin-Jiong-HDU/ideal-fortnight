# 帮助中心功能设计

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个角色相关的帮助中心页面，让用户快速了解平台使用方法

**Architecture:** 单页面应用，左侧固定目录导航 + 右侧滚动内容区，使用 IntersectionObserver 实现滚动高亮

**Tech Stack:** Next.js 16, React, Tailwind CSS, 现有 UI 组件

---

## 功能概述

帮助中心是一个根据用户角色显示不同内容的文档页面，帮助用户快速了解平台功能和使用方法。

### 访问入口

- 在侧边栏添加「❓ 帮助中心」导航项
- 所有角色都能看到此入口

### 内容组织

页面分为三个主要区块：

1. **快速入门** - 该角色最常用的 3-5 个操作卡片
2. **常见问题** - FAQ 折叠面板
3. **完整指南** - 按章节组织的详细文档

### 布局结构

```
┌─────────────────────────────────────────────────────────────────┐
│  侧边栏（已有）  │   帮助中心页面                               │
│                 │   ┌────────────┬──────────────────────────┐   │
│  📊 工作台      │   │            │                          │   │
│  📥 工单池      │   │  目录导航   │      内容区域            │   │
│  📋 我的工单    │   │            │                          │   │
│  ➕ 创建工单    │   │ · 快速入门  │  ┌─────────────────────┐ │   │
│  ❓ 帮助中心    │   │ · 常见问题  │  │  快速参考卡片       │ │   │
│                 │   │ · 完整指南  │  └─────────────────────┘ │   │
│                 │   │   · 登录    │                          │   │
│                 │   │   · 工单    │  ┌─────────────────────┐ │   │
│                 │   │   · 配额    │  │  FAQ 折叠面板       │ │   │
│                 │   │            │  └─────────────────────┘ │   │
│                 │   │            │          ...             │   │
│                 │   └────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 文件结构

```
app/(dashboard)/help/
├── page.tsx                    # 帮助中心主页面
├── components/
│   ├── HelpNav.tsx             # 左侧目录导航
│   ├── QuickStart.tsx          # 快速入门卡片
│   ├── FAQ.tsx                 # 常见问题折叠面板
│   └── GuideContent.tsx        # 完整指南内容
├── content/
│   ├── customer.ts             # 客户角色帮助内容
│   ├── optimizer.ts            # 优化师角色帮助内容
│   └── admin.ts                # 管理员角色帮助内容
```

---

## 组件设计

### HelpNav（目录导航）

**功能：**
- 固定定位，不随内容滚动
- 显示一级和二级目录
- 使用 IntersectionObserver 检测当前可见区块并高亮
- 点击目录项平滑滚动到对应位置

**Props:**
```typescript
interface HelpNavProps {
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}
```

**行为：**
- 监听所有章节标题元素的可见性
- 当章节进入视口时，高亮对应目录项
- 点击目录项时，`scrollIntoView({ behavior: 'smooth' })`

### QuickStart（快速入门）

**功能：**
- 显示该角色最常用的操作
- 卡片形式，每个卡片包含：图标、操作名称、简短描述

**Props:**
```typescript
interface QuickStartProps {
  items: QuickStartItem[];
}

interface QuickStartItem {
  icon: string;
  title: string;
  description: string;
}
```

### FAQ（常见问题）

**功能：**
- 折叠面板形式
- 点击展开/收起答案
- 从内容配置中提取 FAQ 数据

**Props:**
```typescript
interface FAQProps {
  items: FAQItem[];
}

interface FAQItem {
  question: string;
  answer: string;
}
```

### GuideContent（完整指南）

**功能：**
- 按章节渲染完整内容
- 每个章节有唯一 id 用于锚点定位
- 支持 HTML 内容（从 markdown 转换）

**Props:**
```typescript
interface GuideContentProps {
  sections: GuideSection[];
}

interface GuideSection {
  id: string;
  title: string;
  content: string; // HTML 内容
}
```

---

## 内容配置

### 内容来源

基于现有文档 `docs/user-guides/` 中的角色指南：
- `customer-guide.md` → customer 内容
- `optimizer-guide.md` → optimizer 内容
- `admin-guide.md` → admin 内容

### 内容结构（每个角色）

```typescript
interface HelpContent {
  quickStart: QuickStartItem[];
  faq: FAQItem[];
  guide: GuideSection[];
}
```

### 各角色快速入门内容

**Customer（客户）：**
1. 提交工单 - 选择项目，填写内容，提交优化需求
2. 查看进度 - 在工单列表追踪处理状态
3. 审核结果 - 审核优化后的内容，通过或拒绝
4. 查看配额 - 了解剩余优化次数和有效期

**Optimizer（优化师）：**
1. 领取工单 - 从工单池选择工单领取
2. 执行优化 - 使用 AI 工具优化内容
3. 提交结果 - 提交优化结果供客户审核
4. 处理反馈 - 根据客户反馈重新优化

**Admin（管理员）：**
1. 创建用户 - 添加新用户并分配角色
2. 管理客户 - 创建和管理客户账户
3. 配置配额 - 为客户充值配额包
4. 监控工单 - 查看全平台工单状态

---

## 修改点

### Sidebar 组件

在 `components/layout/Sidebar.tsx` 中为所有角色添加帮助中心导航项：

```typescript
// 在每个角色的 navItemsByRole 数组末尾添加
{ label: '帮助中心', href: '/help', icon: '❓' }
```

---

## 样式规范

- 使用现有 Tailwind CSS 主题变量
- 目录导航宽度：`w-56`
- 内容区最大宽度：`max-w-4xl`
- 章节间距：`space-y-8`
- 高亮色：`text-primary`
