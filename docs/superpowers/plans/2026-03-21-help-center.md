# 帮助中心功能实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建角色相关的帮助中心页面，包含快速入门、FAQ 和完整指南

**Architecture:** 左侧固定目录导航 + 右侧滚动内容区，使用 IntersectionObserver 实现滚动高亮，内容按角色配置

**Tech Stack:** Next.js 16, React, Tailwind CSS, 现有 UI 组件

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
│   ├── index.ts                # 内容导出入口
│   ├── types.ts                # 类型定义
│   ├── customer.ts             # 客户角色帮助内容
│   ├── optimizer.ts            # 优化师角色帮助内容
│   └── admin.ts                # 管理员角色帮助内容
```

---

## Chunk 1: 内容配置层

### Task 1: 创建内容类型定义

**Files:**
- Create: `app/(dashboard)/help/content/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// app/(dashboard)/help/content/types.ts

export interface QuickStartItem {
  icon: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string; // HTML 内容
}

export interface HelpContent {
  quickStart: QuickStartItem[];
  faq: FAQItem[];
  guide: GuideSection[];
}

export interface Section {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/content/types.ts
git commit -m "feat(help): add help content type definitions"
```

---

### Task 2: 创建客户角色内容

**Files:**
- Create: `app/(dashboard)/help/content/customer.ts`

- [ ] **Step 1: 创建客户帮助内容**

```typescript
// app/(dashboard)/help/content/customer.ts

import type { HelpContent } from './types';

export const customerContent: HelpContent = {
  quickStart: [
    {
      icon: '📝',
      title: '提交工单',
      description: '选择项目，填写需要优化的内容，提交优化需求',
    },
    {
      icon: '📊',
      title: '查看进度',
      description: '在工单列表追踪处理状态，了解优化进展',
    },
    {
      icon: '✅',
      title: '审核结果',
      description: '审核优化后的内容，通过或拒绝并提出反馈',
    },
    {
      icon: '💎',
      title: '查看配额',
      description: '了解剩余优化次数和配额有效期',
    },
  ],

  faq: [
    {
      question: '工单提交后多久能完成？',
      answer: '通常 1-3 个工作日内完成。复杂内容可能需要更长时间。',
    },
    {
      question: '对优化结果不满意怎么办？',
      answer: '您可以拒绝优化结果并填写反馈意见，优化师会根据反馈重新优化。',
    },
    {
      question: '配额用完了怎么办？',
      answer: '请联系管理员或客户经理购买新的配额包。',
    },
    {
      question: '可以修改已提交的工单吗？',
      answer: '工单提交后无法直接修改。如需修改，请联系优化师或管理员。',
    },
  ],

  guide: [
    {
      id: 'intro',
      title: '平台简介',
      content: `
        <p>GEO（Generative Engine Optimization）优化平台帮助您的内容在 AI 搜索引擎（如 ChatGPT、Perplexity、Google AI、Claude）中获得更好的引用和曝光。</p>
        <h3>核心功能</h3>
        <ul>
          <li><strong>提交内容优化</strong>：将需要优化的内容提交给专业优化团队</li>
          <li><strong>实时进度追踪</strong>：随时查看优化进度和状态</li>
          <li><strong>结果审核</strong>：审核优化结果，确认满意后交付</li>
          <li><strong>配额管理</strong>：查看剩余优化次数和有效期</li>
        </ul>
      `,
    },
    {
      id: 'login',
      title: '登录与账户',
      content: `
        <h3>登录步骤</h3>
        <ol>
          <li>访问平台登录页面</li>
          <li>输入您的邮箱地址</li>
          <li>输入密码</li>
          <li>点击「登录」按钮</li>
        </ol>
        <p>登录成功后，系统将自动跳转到控制面板。</p>
        <h3>账户信息</h3>
        <p>您的账户由管理员创建。如需修改账户信息，请联系管理员。</p>
      `,
    },
    {
      id: 'dashboard',
      title: '控制面板',
      content: `
        <p>登录后首先看到的是控制面板，这里展示您的账户概览。</p>
        <h3>配额信息</h3>
        <p>控制面板顶部显示您的配额状态：</p>
        <ul>
          <li><strong>剩余配额</strong>：当前可用的优化次数</li>
          <li><strong>总配额</strong>：账户总优化次数</li>
          <li><strong>到期日期</strong>：配额有效期</li>
        </ul>
        <p><em>⚠️ 配额用尽或过期后将无法提交新工单。请联系管理员充值。</em></p>
        <h3>统计数据</h3>
        <ul>
          <li><strong>待审核</strong>：已完成优化，等待您审核的工单数量</li>
          <li><strong>已完成</strong>：已完成的优化工单总数</li>
        </ul>
      `,
    },
    {
      id: 'tickets',
      title: '工单管理',
      subsections: [
        { id: 'tickets-create', title: '创建工单' },
        { id: 'tickets-list', title: '查看工单列表' },
        { id: 'tickets-detail', title: '工单详情' },
      ],
      content: `
        <h3 id="tickets-create">创建新工单</h3>
        <ol>
          <li>点击侧边栏「新建工单」或在工单列表页点击「新建工单」按钮</li>
          <li>填写工单信息：
            <ul>
              <li><strong>选择项目</strong>：从您的项目列表中选择关联项目</li>
              <li><strong>标题</strong>：简短描述优化需求</li>
              <li><strong>内容</strong>：需要优化的完整内容</li>
              <li><strong>来源类型</strong>（可选）：内容来源（如官网、博客等）</li>
              <li><strong>来源链接</strong>（可选）：原始内容 URL</li>
            </ul>
          </li>
          <li>点击「提交」按钮</li>
        </ol>
        <p><em>📝 提交工单会消耗 1 个配额。请确保内容完整后再提交。</em></p>

        <h3 id="tickets-list">查看工单列表</h3>
        <p>在「我的工单」页面可以查看所有提交的工单。</p>
        <h4>状态筛选</h4>
        <ul>
          <li><strong>全部</strong>：显示所有工单</li>
          <li><strong>待处理</strong>：等待优化师领取</li>
          <li><strong>已领取</strong>：已被优化师领取，等待开始处理</li>
          <li><strong>处理中</strong>：正在优化中</li>
          <li><strong>审核中</strong>：优化完成，等待您审核</li>
          <li><strong>已完成</strong>：已完成的工单</li>
        </ul>

        <h3 id="tickets-detail">工单详情</h3>
        <p>工单详情页展示：</p>
        <ul>
          <li><strong>基本信息</strong>：标题、项目、创建时间、当前状态</li>
          <li><strong>原始内容</strong>：您提交的需要优化的内容</li>
          <li><strong>优化结果</strong>：优化师提交的优化后内容（优化完成后显示）</li>
          <li><strong>优化历史</strong>：记录每次优化的分数变化和策略</li>
        </ul>
      `,
    },
    {
      id: 'review',
      title: '工单审核',
      content: `
        <p>当工单状态变为「审核中」时，您需要审核优化结果。</p>
        <h3>审核步骤</h3>
        <ol>
          <li>进入工单详情页</li>
          <li>查看「优化结果」部分：
            <ul>
              <li>优化后的内容</li>
              <li>优化前后的分数对比</li>
              <li>使用的优化策略</li>
              <li>目标 AI 平台</li>
            </ul>
          </li>
          <li>做出决定：
            <ul>
              <li><strong>通过</strong>：确认满意，点击「通过」按钮完成工单</li>
              <li><strong>拒绝</strong>：如不满意，点击「拒绝」并填写反馈意见，优化师将重新优化</li>
            </ul>
          </li>
        </ol>
        <h3>审核建议</h3>
        <ul>
          <li>仔细阅读优化后的内容，确保符合您的品牌调性</li>
          <li>检查关键信息是否准确</li>
          <li>如有修改意见，在拒绝时详细说明</li>
        </ul>
        <p><em>⚠️ 工单通过后将正式完成，无法再次修改。请确认满意后再通过。</em></p>
      `,
    },
    {
      id: 'quota',
      title: '配额管理',
      content: `
        <h3>查看配额</h3>
        <p>在控制面板顶部可以看到当前配额信息。</p>
        <h3>配额规则</h3>
        <ul>
          <li>每提交一个工单消耗 1 个配额</li>
          <li>配额有有效期限制，过期作废</li>
          <li>配额不足时无法提交新工单</li>
        </ul>
        <h3>充值配额</h3>
        <p>如需充值配额，请联系您的客户经理或管理员。</p>
      `,
    },
  ],
};
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/content/customer.ts
git commit -m "feat(help): add customer role help content"
```

---

### Task 3: 创建优化师角色内容

**Files:**
- Create: `app/(dashboard)/help/content/optimizer.ts`

- [ ] **Step 1: 创建优化师帮助内容**

```typescript
// app/(dashboard)/help/content/optimizer.ts

import type { HelpContent } from './types';

export const optimizerContent: HelpContent = {
  quickStart: [
    {
      icon: '📥',
      title: '领取工单',
      description: '从工单池选择感兴趣的工单领取',
    },
    {
      icon: '⚡',
      title: '执行优化',
      description: '阅读原始内容，使用 AI 工具执行优化',
    },
    {
      icon: '📤',
      title: '提交结果',
      description: '查看优化结果和分数对比，提交供客户审核',
    },
    {
      icon: '🔄',
      title: '处理反馈',
      description: '根据客户反馈重新优化，直到满意',
    },
  ],

  faq: [
    {
      question: '可以同时领取多个工单吗？',
      answer: '可以，但建议根据处理能力合理领取，避免积压。',
    },
    {
      question: '客户拒绝优化结果怎么办？',
      answer: '仔细阅读客户反馈，针对性地修改内容，重新提交。',
    },
    {
      question: '优化策略应该怎么选择？',
      answer: '根据内容类型和客户需求选择。不确定时可以多选，系统会综合应用。',
    },
    {
      question: '分数提升多少算正常？',
      answer: '通常提升 10-30% 是正常的。具体取决于原始内容质量。',
    },
    {
      question: '可以手动修改 AI 优化结果吗？',
      answer: '可以。优化完成后，您可以在提交前手动调整内容。',
    },
  ],

  guide: [
    {
      id: 'intro',
      title: '平台简介',
      content: `
        <p>作为 GEO 优化师，您的主要职责是处理客户提交的内容优化工单，运用专业知识和 AI 辅助工具，提升内容在 AI 搜索引擎中的引用率。</p>
        <h3>核心职责</h3>
        <ul>
          <li>从工单池领取待处理工单</li>
          <li>分析客户内容和需求</li>
          <li>执行内容优化</li>
          <li>提交优化结果供客户审核</li>
        </ul>
      `,
    },
    {
      id: 'ticket-pool',
      title: '工单池',
      content: `
        <p>工单池展示所有待领取的工单。</p>
        <h3>查看工单池</h3>
        <ol>
          <li>点击侧边栏「工单池」</li>
          <li>浏览待处理工单列表</li>
        </ol>
        <p><em>📝 优化师只能看到「待处理」状态的工单。</em></p>
        <h3>领取工单</h3>
        <ol>
          <li>在工单池中选择感兴趣的工单</li>
          <li>点击工单查看详情</li>
          <li>点击「领取工单」按钮</li>
          <li>工单将移至「我的工单」</li>
        </ol>
        <h3>领取建议</h3>
        <ul>
          <li>优先处理紧急或高优先级的工单</li>
          <li>选择您擅长领域的内容</li>
          <li>避免一次领取过多工单</li>
        </ul>
      `,
    },
    {
      id: 'workflow',
      title: '工单处理流程',
      content: `
        <h3>完整流程</h3>
        <p><code>领取工单 → 开始处理 → 执行优化 → 提交结果 → 交付工单</code></p>

        <h4>1. 领取工单</h4>
        <p>从工单池选择工单并领取。</p>

        <h4>2. 开始处理</h4>
        <ol>
          <li>进入工单详情页</li>
          <li>点击「开始处理」按钮</li>
          <li>工单状态变为「处理中」</li>
        </ol>

        <h4>3. 执行优化</h4>
        <ol>
          <li>阅读原始内容和客户需求</li>
          <li>点击「执行优化」按钮</li>
          <li>配置优化参数：
            <ul>
              <li><strong>优化策略</strong>：选择适用的优化策略</li>
              <li><strong>目标平台</strong>：选择目标 AI 搜索引擎</li>
              <li><strong>关键词</strong>：输入需要覆盖的关键词</li>
            </ul>
          </li>
          <li>点击「执行」按钮</li>
          <li>系统将自动执行 AI 优化</li>
        </ol>

        <h4>4. 提交结果</h4>
        <ol>
          <li>查看优化结果和分数对比</li>
          <li>如满意，点击「提交结果」</li>
          <li>如不满意，可重新执行优化</li>
        </ol>

        <h4>5. 交付工单</h4>
        <ol>
          <li>提交结果后，工单状态变为「审核中」</li>
          <li>客户审核通过后，工单完成</li>
          <li>如客户拒绝，您需要根据反馈重新优化</li>
        </ol>
      `,
    },
    {
      id: 'optimization',
      title: '内容优化指南',
      subsections: [
        { id: 'opt-strategy', title: '优化策略' },
        { id: 'opt-tips', title: '优化建议' },
      ],
      content: `
        <h3 id="opt-strategy">优化策略说明</h3>
        <table>
          <thead>
            <tr>
              <th>策略</th>
              <th>说明</th>
              <th>适用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>structure</td><td>结构化内容</td><td>需要清晰层次结构的内容</td></tr>
            <tr><td>schema</td><td>添加结构化数据</td><td>需要搜索引擎更好理解的内容</td></tr>
            <tr><td>answer_first</td><td>答案优先</td><td>问答类内容</td></tr>
            <tr><td>authority</td><td>权威性增强</td><td>需要建立专业权威的内容</td></tr>
            <tr><td>faq</td><td>FAQ 优化</td><td>常见问题类内容</td></tr>
          </tbody>
        </table>

        <h3 id="opt-tips">优化建议</h3>
        <h4>内容结构</h4>
        <ul>
          <li>使用清晰的标题层次（H1-H4）</li>
          <li>段落简洁，每段 2-3 句话</li>
          <li>使用列表和表格提高可读性</li>
        </ul>
        <h4>关键词</h4>
        <ul>
          <li>覆盖用户可能搜索的关键词</li>
          <li>自然融入关键词，避免堆砌</li>
          <li>包含同义词和相关词</li>
        </ul>
        <h4>AI 友好</h4>
        <ul>
          <li>提供明确的答案和结论</li>
          <li>使用数据和事实支撑观点</li>
          <li>避免模糊和不确定的表述</li>
        </ul>
      `,
    },
  ],
};
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/content/optimizer.ts
git commit -m "feat(help): add optimizer role help content"
```

---

### Task 4: 创建管理员角色内容

**Files:**
- Create: `app/(dashboard)/help/content/admin.ts`

- [ ] **Step 1: 创建管理员帮助内容**

```typescript
// app/(dashboard)/help/content/admin.ts

import type { HelpContent } from './types';

export const adminContent: HelpContent = {
  quickStart: [
    {
      icon: '👥',
      title: '创建用户',
      description: '添加新用户并分配角色（管理员/优化师/客户）',
    },
    {
      icon: '🏢',
      title: '管理客户',
      description: '创建客户账户，关联用户，填写企业信息',
    },
    {
      icon: '💎',
      title: '配置配额',
      description: '创建配额包，为客户充值优化次数',
    },
    {
      icon: '📊',
      title: '监控工单',
      description: '查看全平台工单状态，必要时介入处理',
    },
  ],

  faq: [
    {
      question: '如何重置用户密码？',
      answer: '目前需要直接联系用户告知新密码，或通过后端系统重置。',
    },
    {
      question: '客户配额过期了怎么办？',
      answer: '过期配额无法恢复。需要重新购买配额包充值。',
    },
    {
      question: '如何处理客户投诉？',
      answer: '查看相关工单详情，如需要可亲自介入处理，与优化师沟通改进方案。',
    },
    {
      question: '可以批量创建用户吗？',
      answer: '目前需要逐个创建。批量创建功能可联系开发团队。',
    },
  ],

  guide: [
    {
      id: 'intro',
      title: '平台简介',
      content: `
        <p>作为平台管理员，您拥有系统的最高权限，负责：</p>
        <ul>
          <li>用户和权限管理</li>
          <li>客户账户管理</li>
          <li>项目配置</li>
          <li>配额包管理</li>
          <li>全局工单监控</li>
        </ul>
        <h3>权限范围</h3>
        <p>管理员可以访问所有功能和数据，包括其他用户的私密信息。请谨慎使用权限。</p>
      `,
    },
    {
      id: 'users',
      title: '用户管理',
      content: `
        <p>用户管理页面用于管理系统中的所有用户。</p>
        <h3>创建新用户</h3>
        <ol>
          <li>点击「新建用户」按钮</li>
          <li>填写用户信息：
            <ul>
              <li><strong>邮箱</strong>：用户登录邮箱</li>
              <li><strong>密码</strong>：初始密码</li>
              <li><strong>姓名</strong>：用户显示名称</li>
              <li><strong>角色</strong>：选择用户角色</li>
            </ul>
          </li>
          <li>点击「创建」按钮</li>
        </ol>
        <h3>用户角色说明</h3>
        <table>
          <thead>
            <tr><th>角色</th><th>权限范围</th></tr>
          </thead>
          <tbody>
            <tr><td>管理员 (admin)</td><td>全部权限，包括用户管理、系统配置</td></tr>
            <tr><td>优化师 (optimizer)</td><td>处理工单、查看工单池、优化内容</td></tr>
            <tr><td>客户 (customer)</td><td>提交工单、审核结果、查看配额</td></tr>
          </tbody>
        </table>
      `,
    },
    {
      id: 'customers',
      title: '客户管理',
      content: `
        <p>客户管理页面用于管理客户账户和企业信息。</p>
        <h3>创建客户</h3>
        <ol>
          <li>点击「新建客户」按钮</li>
          <li>选择关联用户（必须先创建用户）</li>
          <li>填写客户信息：
            <ul>
              <li><strong>公司名称</strong>：客户公司全称</li>
              <li><strong>联系电话</strong>（可选）</li>
              <li><strong>行业</strong>（可选）</li>
              <li><strong>备注</strong>（可选）</li>
            </ul>
          </li>
          <li>点击「创建」按钮</li>
        </ol>
        <h3>查看配额历史</h3>
        <p>在客户详情页可以查看：</p>
        <ul>
          <li>当前配额余额</li>
          <li>配额到期日期</li>
          <li>充值历史记录</li>
        </ul>
      `,
    },
    {
      id: 'projects',
      title: '项目管理',
      content: `
        <p>项目管理页面用于管理客户项目。</p>
        <h3>创建项目</h3>
        <ol>
          <li>点击「新建项目」按钮</li>
          <li>填写项目信息：
            <ul>
              <li><strong>客户</strong>：选择关联客户</li>
              <li><strong>项目名称</strong>：项目名称</li>
              <li><strong>描述</strong>（可选）：项目描述</li>
            </ul>
          </li>
          <li>填写企业信息（可选）：
            <ul>
              <li>企业名称、行业、规模</li>
              <li>目标受众、核心产品</li>
            </ul>
          </li>
          <li>填写竞争对手信息（可选）</li>
          <li>点击「创建」按钮</li>
        </ol>
        <p><em>企业信息和竞争对手信息有助于优化师更好地理解客户业务，提供更精准的优化服务。</em></p>
      `,
    },
    {
      id: 'quotas',
      title: '配额管理',
      content: `
        <p>配额管理页面用于管理配额包和客户充值。</p>
        <h3>创建配额包</h3>
        <ol>
          <li>点击「新建配额包」按钮</li>
          <li>填写配额包信息：
            <ul>
              <li><strong>套餐名称</strong>：如「基础版」「专业版」</li>
              <li><strong>文章数</strong>：包含的优化次数</li>
              <li><strong>价格</strong>：套餐价格</li>
              <li><strong>有效期</strong>：有效天数</li>
            </ul>
          </li>
          <li>点击「创建」按钮</li>
        </ol>
        <h3>客户充值</h3>
        <ol>
          <li>进入客户详情页</li>
          <li>点击「充值配额」</li>
          <li>选择配额包</li>
          <li>填写备注（可选）</li>
          <li>点击「确认充值」</li>
        </ol>
      `,
    },
    {
      id: 'tickets',
      title: '工单管理',
      content: `
        <p>管理员可以查看和管理全平台所有工单。</p>
        <h3>管理员工单权限</h3>
        <ul>
          <li>查看所有工单详情</li>
          <li>领取和处理任何工单</li>
          <li>监控工单处理进度</li>
          <li>在需要时介入处理</li>
        </ul>
        <h3>使用场景</h3>
        <ul>
          <li><strong>紧急工单</strong>：处理紧急或高优先级的工单</li>
          <li><strong>质量控制</strong>：抽查已完成的工单质量</li>
          <li><strong>工作量平衡</strong>：监控优化师工作量，必要时重新分配</li>
        </ul>
      `,
    },
  ],
};
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/content/admin.ts
git commit -m "feat(help): add admin role help content"
```

---

### Task 5: 创建内容导出入口

**Files:**
- Create: `app/(dashboard)/help/content/index.ts`

- [ ] **Step 1: 创建内容导出**

```typescript
// app/(dashboard)/help/content/index.ts

import type { HelpContent, Section } from './types';
import { customerContent } from './customer';
import { optimizerContent } from './optimizer';
import { adminContent } from './admin';

export type { HelpContent, QuickStartItem, FAQItem, GuideSection, Section } from './types';

const contentByRole: Record<string, HelpContent> = {
  customer: customerContent,
  optimizer: optimizerContent,
  admin: adminContent,
};

export function getHelpContent(role: string): HelpContent {
  return contentByRole[role] || customerContent;
}

export function getSections(content: HelpContent): Section[] {
  const sections: Section[] = [
    { id: 'quickstart', title: '快速入门' },
    { id: 'faq', title: '常见问题' },
  ];

  // 添加指南章节
  if (content.guide.length > 0) {
    const guideSection: Section = {
      id: 'guide',
      title: '完整指南',
      subsections: content.guide.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    };
    sections.push(guideSection);
  }

  return sections;
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/content/index.ts
git commit -m "feat(help): add content export with role-based lookup"
```

---

## Chunk 2: UI 组件

### Task 6: 创建快速入门组件

**Files:**
- Create: `app/(dashboard)/help/components/QuickStart.tsx`

- [ ] **Step 1: 创建快速入门卡片组件**

```typescript
// app/(dashboard)/help/components/QuickStart.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { QuickStartItem } from '../content/types';

interface QuickStartProps {
  items: QuickStartItem[];
}

export function QuickStart({ items }: QuickStartProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <Card key={index} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/components/QuickStart.tsx
git commit -m "feat(help): add QuickStart component"
```

---

### Task 7: 创建 FAQ 组件

**Files:**
- Create: `app/(dashboard)/help/components/FAQ.tsx`

- [ ] **Step 1: 创建 FAQ 折叠面板组件**

```typescript
// app/(dashboard)/help/components/FAQ.tsx

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FAQItem } from '../content/types';

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-foreground">{item.question}</span>
            <span
              className={cn(
                'text-muted-foreground transition-transform',
                openIndex === index && 'rotate-180'
              )}
            >
              ▼
            </span>
          </button>
          {openIndex === index && (
            <div className="px-4 py-3 bg-muted/30 border-t border-border">
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/components/FAQ.tsx
git commit -m "feat(help): add FAQ accordion component"
```

---

### Task 8: 创建完整指南组件

**Files:**
- Create: `app/(dashboard)/help/components/GuideContent.tsx`

- [ ] **Step 1: 创建完整指南内容组件**

```typescript
// app/(dashboard)/help/components/GuideContent.tsx

'use client';

import type { GuideSection } from '../content/types';

interface GuideContentProps {
  sections: GuideSection[];
}

export function GuideContent({ sections }: GuideContentProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
            {section.title}
          </h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none
              [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3
              [&>h4]:text-base [&>h4]:font-medium [&>h4]:mt-4 [&>h4]:mb-2
              [&>p]:text-muted-foreground [&>p]:mb-4
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:text-muted-foreground
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:text-muted-foreground
              [&>ul>li]:mb-1 [&>ol>li]:mb-1
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:text-muted-foreground
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:text-muted-foreground
              [&_li]:mb-1
              [&>table]:w-full [&>table]:border-collapse [&>table]:mb-4
              [&>table>thead>tr]:border-b [&>table>thead>tr]:border-border
              [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:px-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-medium
              [&>table>tbody>tr]:border-b [&>table>tbody>tr]:border-border
              [&>table>tbody>tr>td]:py-2 [&>table>tbody>tr>td]:px-3
              [&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
              [&_strong]:font-semibold [&_strong]:text-foreground
              [&_em]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/components/GuideContent.tsx
git commit -m "feat(help): add GuideContent component with HTML rendering"
```

---

### Task 9: 创建目录导航组件

**Files:**
- Create: `app/(dashboard)/help/components/HelpNav.tsx`

- [ ] **Step 1: 创建带滚动高亮的目录导航组件**

```typescript
// app/(dashboard)/help/components/HelpNav.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Section } from '../content/types';

interface HelpNavProps {
  sections: Section[];
}

export function HelpNav({ sections }: HelpNavProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 找到最接近视口顶部的元素
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // 按 ratio 排序，选择最可见的
          const mostVisible = visibleEntries.reduce((prev, current) =>
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          );
          setActiveId(mostVisible.target.id);
        }
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    // 观察所有章节
    const observeSections = () => {
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observerRef.current?.observe(el);

        // 观察子章节
        section.subsections?.forEach((sub) => {
          const subEl = document.getElementById(sub.id);
          if (subEl) observerRef.current?.observe(subEl);
        });
      });
    };

    // 延迟执行以确保 DOM 已渲染
    const timer = setTimeout(observeSections, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="w-56 flex-shrink-0">
      <div className="sticky top-8">
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollTo(section.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  activeId === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {section.title}
              </button>
              {section.subsections && section.subsections.length > 0 && (
                <ul className="ml-4 mt-1 space-y-1 border-l border-border">
                  {section.subsections.map((sub) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => scrollTo(sub.id)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-sm transition-colors',
                          activeId === sub.id
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {sub.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/components/HelpNav.tsx
git commit -m "feat(help): add HelpNav with scroll-based highlighting"
```

---

### Task 10: 创建帮助中心主页面

**Files:**
- Create: `app/(dashboard)/help/page.tsx`

- [ ] **Step 1: 创建帮助中心主页面**

```typescript
// app/(dashboard)/help/page.tsx

'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { getHelpContent, getSections } from './content';
import { HelpNav } from './components/HelpNav';
import { QuickStart } from './components/QuickStart';
import { FAQ } from './components/FAQ';
import { GuideContent } from './components/GuideContent';

export default function HelpPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-8">
        <p>请先登录</p>
      </div>
    );
  }

  const content = getHelpContent(user.role);
  const sections = getSections(content);

  return (
    <div className="min-h-screen">
      <div className="p-8 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">帮助中心</h1>
        <p className="text-muted-foreground mt-1">了解如何使用 GEO 优化平台</p>
      </div>

      <div className="flex gap-8 p-8">
        {/* 左侧目录导航 */}
        <HelpNav sections={sections} />

        {/* 右侧内容区 */}
        <div className="flex-1 max-w-4xl">
          {/* 快速入门 */}
          <section id="quickstart" className="scroll-mt-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              快速入门
            </h2>
            <QuickStart items={content.quickStart} />
          </section>

          {/* 常见问题 */}
          <section id="faq" className="scroll-mt-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              常见问题
            </h2>
            <FAQ items={content.faq} />
          </section>

          {/* 完整指南 */}
          <section id="guide" className="scroll-mt-8">
            <GuideContent sections={content.guide} />
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/\(dashboard\)/help/page.tsx
git commit -m "feat(help): add help center main page"
```

---

## Chunk 3: 集成

### Task 11: 添加侧边栏导航入口

**Files:**
- Modify: `components/layout/Sidebar.tsx:17-55`

- [ ] **Step 1: 在所有角色的导航中添加帮助中心**

在 `components/layout/Sidebar.tsx` 中，修改 `navItemsByRole` 对象，为每个角色添加帮助中心导航项：

```typescript
const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
    {
      label: '管理中心',
      href: '/admin',
      icon: '⚙️',
      subitems: [
        { label: '用户管理', href: '/admin/users', icon: '👥' },
        { label: '客户管理', href: '/admin/customers', icon: '🏢' },
        { label: '配额管理', href: '/admin/quotas', icon: '💎' },
        { label: '项目管理', href: '/admin/projects', icon: '📁' },
      ],
    },
    { label: '帮助中心', href: '/help', icon: '❓' },
  ],
  optimizer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
    {
      label: '管理中心',
      href: '/admin',
      icon: '⚙️',
      subitems: [
        { label: '客户列表', href: '/admin/customers', icon: '🏢' },
        { label: '项目列表', href: '/admin/projects', icon: '📁' },
      ],
    },
    { label: '帮助中心', href: '/help', icon: '❓' },
  ],
  customer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '提交工单', href: '/tickets/new', icon: '➕' },
    { label: '帮助中心', href: '/help', icon: '❓' },
  ],
};
```

- [ ] **Step 2: 提交**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat(help): add help center link to sidebar for all roles"
```

---

### Task 12: 最终集成测试

- [ ] **Step 1: 运行开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试客户角色**

1. 使用 customer@test.com / customer123 登录
2. 点击侧边栏「帮助中心」
3. 验证显示客户相关的快速入门、FAQ 和指南内容
4. 测试目录导航点击跳转
5. 测试滚动时目录高亮

- [ ] **Step 3: 测试优化师角色**

1. 使用 optimizer@test.com / optimizer123 登录
2. 点击侧边栏「帮助中心」
3. 验证显示优化师相关内容（工单池、优化策略等）

- [ ] **Step 4: 测试管理员角色**

1. 使用 admin@test.com / admin123 登录
2. 点击侧边栏「帮助中心」
3. 验证显示管理员相关内容（用户管理、配额管理等）

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat(help): complete help center feature with role-based content"
```
