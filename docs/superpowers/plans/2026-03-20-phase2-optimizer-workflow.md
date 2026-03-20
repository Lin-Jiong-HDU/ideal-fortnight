# GEO 平台阶段 2：优化师侧工作流实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现优化师侧完整工作流 - 工单池、领取工单、开始处理、执行优化、提交结果、交付工单 + 优化历史记录显示

**Architecture:** 基于阶段 1 的架构扩展，新增优化师专用页面和优化历史组件

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

---

## 前置条件

- ✅ 阶段 1 已完成
- ✅ 登录认证功能正常
- ✅ 客户侧工单流程可用

---

## 文件结构（新增/修改）

```
app/
├── (dashboard)/
│   └── optimizer/                  # 新增：优化师专用路由
│       └── tickets/
│         └── page.tsx              # 工单池

lib/
├── api.ts                          # 修改：添加优化师相关 API 方法
└── types.ts                        # 修改：添加优化相关类型

components/
├── ticket/
│   └── optimization-history.tsx    # 新增：优化历史记录组件
```

---

## Chunk 1: API 扩展

### Task 1.1: 扩展 API 方法

**Files:**
- Modify: `lib/api.ts`

- [ ] **Step 1: 添加优化师相关 API 方法**

在 `api` 对象中添加以下方法：

```typescript
// 在 lib/api.ts 的 api 对象中添加

  // 优化师 - 工单池
  getOptimizerTickets: () =>
    request<Ticket[]>('/optimizer/tickets'),

  // 优化师 - 领取工单
  claimTicket: (id: string) =>
    request<{ message: string }>(`/optimizer/tickets/${id}/claim`, {
      method: 'POST',
    }),

  // 优化师 - 开始处理
  processTicket: (id: string) =>
    request<{ message: string }>(`/optimizer/tickets/${id}/process`, {
      method: 'POST',
    }),

  // 优化师 - 执行优化
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

  // 优化师 - 提交结果
  submitTicketResult: (id: string, data: {
    optimizedContent: string;
    scoreBefore: number;
    scoreAfter: number;
  }) =>
    request<{ message: string }>(`/optimizer/tickets/${id}/result`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 优化师 - 交付工单
  deliverTicket: (id: string) =>
    request<{ message: string }>(`/optimizer/tickets/${id}/deliver`, {
      method: 'POST',
    }),

  // 优化历史记录
  getTicketOptimizations: (ticketId: string) =>
    request<OptimizationRecord[]>(`/optimizer/tickets/${ticketId}/optimizations`),
```

- [ ] **Step 2: 添加优化记录类型**

**Files:**
- Modify: `lib/types.ts`

```typescript
// 在 lib/types.ts 中添加

// 优化记录
export interface OptimizationRecord {
  id: string;
  ticketId: string;
  optimizedContent: string;
  scoreBefore: number;
  scoreAfter: number;
  strategies: string[];
  targetAI: string[];
  keywords: string[];
  tokensUsed: number;
  llmModel: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

// 优化策略类型
export type OptimizationStrategy = 'structure' | 'schema' | 'answer_first' | 'authority' | 'faq';

// 目标 AI 平台
export type TargetAI = 'chatgpt' | 'perplexity' | 'google_ai' | 'claude';
```

- [ ] **Step 3: Commit**

```bash
git add lib/api.ts lib/types.ts
git commit -m "feat: add optimizer API methods and optimization types"
```

---

## Chunk 2: 工单池页面

### Task 2.1: 创建工单池页面

**Files:**
- Create: `app/(dashboard)/optimizer/tickets/page.tsx`

- [ ] **Step 1: 创建工单池页面**

```typescript
// app/(dashboard)/optimizer/tickets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card } from '@/components/ui/card';

export default function OptimizerTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOptimizerTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch optimizer tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClaim = async (ticketId: string) => {
    setClaimingId(ticketId);
    try {
      await api.claimTicket(ticketId);
      // 重新获取列表
      await fetchTickets();
    } catch (error) {
      console.error('Failed to claim ticket:', error);
      alert('领取失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setClaimingId(null);
    }
  };

  // 只显示 pending 状态的工单
  const pendingTickets = tickets.filter(t => t.status === 'pending');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">工单池</h1>
        <Button
          variant="outline"
          onClick={fetchTickets}
          disabled={isLoading}
        >
          🔄 刷新
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-700">
          当前有 <span className="font-bold">{pendingTickets.length}</span> 个待领取工单
        </p>
      </div>

      {/* 工单列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : pendingTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">🎉 暂无待处理工单</p>
          <p className="text-sm text-gray-400">有新工单时会出现在这里</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingTickets.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    📄 {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    客户：{ticket.customer?.companyName || '未分配'}  |  创建于 {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  {ticket.originalContent && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.originalContent.slice(0, 150)}...
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 items-end ml-4">
                  <Badge status={ticket.status} />
                  <Button
                    onClick={() => handleClaim(ticket.id)}
                    disabled={claimingId === ticket.id}
                    size="sm"
                  >
                    {claimingId === ticket.id ? '领取中...' : '领取'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 更新侧边栏导航**

**Files:**
- Modify: `components/layout/sidebar.tsx`

更新 `navItemsByRole` 中的 `admin` 和 `optimizer` 配置：

```typescript
// 在 components/layout/sidebar.tsx 中更新
const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
  ],
  optimizer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '工单池', href: '/optimizer/tickets', icon: '📥' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '创建工单', href: '/tickets/new', icon: '➕' },
  ],
  customer: [
    { label: '工作台', href: '/dashboard', icon: '📊' },
    { label: '我的工单', href: '/tickets', icon: '📋' },
    { label: '提交工单', href: '/tickets/new', icon: '➕' },
  ],
};
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/optimizer/tickets/page.tsx components/layout/sidebar.tsx
git commit -m "feat: add optimizer ticket pool page"
```

---

## Chunk 3: 工单详情页扩展（优化师视角）

### Task 3.1: 扩展工单详情页

**Files:**
- Modify: `app/(dashboard)/tickets/[id]/page.tsx`

- [ ] **Step 1: 添加优化师视角的处理界面**

在工单详情页面中添加优化师的处理界面。更新现有文件：

```typescript
// 在 app/(dashboard)/tickets/[id]/page.tsx 中添加优化师相关逻辑和 UI

// 在文件开头的 import 后添加优化策略配置
const optimizationStrategies = [
  { value: 'structure', label: '结构化优化', desc: '添加标题层级、列表、章节划分' },
  { value: 'schema', label: 'Schema 标记', desc: '生成 JSON-LD 结构化数据' },
  { value: 'answer_first', label: '答案优先', desc: '将关键结论移到开头' },
  { value: 'authority', label: '权威性增强', desc: '添加数据支撑和专业元素' },
  { value: 'faq', label: 'FAQ 生成', desc: '生成常见问题章节' },
];

const targetPlatforms = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'google_ai', label: 'Google AI' },
  { value: 'claude', label: 'Claude' },
];

// 在组件内添加优化相关的状态
const [optimizationForm, setOptimizationForm] = useState({
  strategies: [] as string[],
  targetAI: [] as string[],
  keywords: '',
});
const [isProcessing, setIsProcessing] = useState(false);
const [optimizedResult, setOptimizedResult] = useState<{
  content: string;
  scoreBefore: number;
  scoreAfter: number;
} | null>(null);

// 添加处理优化逻辑
const handleProcess = async () => {
  setIsProcessing(true);
  setMessage('');
  try {
    await api.processTicket(params.id);
    const updated = await api.getTicket(params.id);
    setTicket(updated);
    setMessage('✓ 已开始处理');
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '操作失败');
  } finally {
    setIsProcessing(false);
  }
};

const handleOptimize = async () => {
  if (optimizationForm.strategies.length === 0) {
    setMessage('请至少选择一种优化策略');
    return;
  }

  setIsProcessing(true);
  setMessage('');
  try {
    const result = await api.optimizeTicket(params.id, {
      strategies: optimizationForm.strategies,
      targetAI: optimizationForm.targetAI,
      keywords: optimizationForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
    });

    setOptimizedResult({
      content: result.optimizedContent,
      scoreBefore: result.scoreBefore,
      scoreAfter: result.scoreAfter,
    });

    // 更新工单数据
    const updated = await api.getTicket(params.id);
    setTicket(updated);

    setMessage('✓ 优化完成！');
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '优化失败');
  } finally {
    setIsProcessing(false);
  }
};

const handleSubmitResult = async () => {
  if (!optimizedResult) {
    setMessage('请先执行优化');
    return;
  }

  setIsProcessing(true);
  setMessage('');
  try {
    await api.submitTicketResult(params.id, {
      optimizedContent: optimizedResult.content,
      scoreBefore: optimizedResult.scoreBefore,
      scoreAfter: optimizedResult.scoreAfter,
    });

    const updated = await api.getTicket(params.id);
    setTicket(updated);
    setMessage('✓ 结果已保存');
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '提交失败');
  } finally {
    setIsProcessing(false);
  }
};

const handleDeliver = async () => {
  setIsProcessing(true);
  setMessage('');
  try {
    await api.deliverTicket(params.id);
    const updated = await api.getTicket(params.id);
    setTicket(updated);

    if (updated.needReview) {
      setMessage('✓ 已交付，等待客户审核');
      setTimeout(() => router.push('/tickets'), 1500);
    } else {
      setMessage('✓ 工单已完成！');
      setTimeout(() => router.push('/tickets'), 1500);
    }
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '交付失败');
  } finally {
    setIsProcessing(false);
  }
};

// 在 return 语句中，审核操作前添加优化师操作界面
{user?.role === 'admin' || user?.role === 'optimizer' ? (
  <div className="space-y-6">
    {/* 优化师操作面板 - assigned/processing 状态 */}
    {(ticket.status === 'assigned' || ticket.status === 'processing') && (
      <>
        {ticket.status === 'assigned' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">开始处理</h2>
              <p className="text-gray-600 mb-4">领取后点击下方按钮开始处理工单</p>
              <Button onClick={handleProcess} disabled={isProcessing}>
                {isProcessing ? '处理中...' : '开始处理'}
              </Button>
            </CardContent>
          </Card>
        )}

        {ticket.status === 'processing' && !optimizedResult && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">执行优化</h2>

              {/* 优化策略选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">优化策略 *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {optimizationStrategies.map((strategy) => (
                    <label
                      key={strategy.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        optimizationForm.strategies.includes(strategy.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 mr-3"
                        checked={optimizationForm.strategies.includes(strategy.value)}
                        onChange={(e) => {
                          const newStrategies = e.target.checked
                            ? [...optimizationForm.strategies, strategy.value]
                            : optimizationForm.strategies.filter(s => s !== strategy.value);
                          setOptimizationForm({ ...optimizationForm, strategies: newStrategies });
                        }}
                      />
                      <div>
                        <p className="font-medium">{strategy.label}</p>
                        <p className="text-sm text-gray-500">{strategy.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 目标平台选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">目标平台</label>
                <div className="flex flex-wrap gap-2">
                  {targetPlatforms.map((platform) => (
                    <label
                      key={platform.value}
                      className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                        optimizationForm.targetAI.includes(platform.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={optimizationForm.targetAI.includes(platform.value)}
                        onChange={(e) => {
                          const newTargetAI = e.target.checked
                            ? [...optimizationForm.targetAI, platform.value]
                            : optimizationForm.targetAI.filter(a => a !== platform.value);
                          setOptimizationForm({ ...optimizationForm, targetAI: newTargetAI });
                        }}
                      />
                      {platform.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 关键词输入 */}
              <div className="mb-6">
                <label htmlFor="keywords" className="block text-sm font-medium mb-2">关键词</label>
                <Input
                  id="keywords"
                  placeholder="用逗号分隔，如：云服务, 云计算, 企业上云"
                  value={optimizationForm.keywords}
                  onChange={(e) => setOptimizationForm({ ...optimizationForm, keywords: e.target.value })}
                />
              </div>

              <Button onClick={handleOptimize} disabled={isProcessing}>
                {isProcessing ? '优化中...' : '执行优化'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 优化结果 */}
        {optimizedResult && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">优化结果</h2>

              <div className="flex items-center gap-8 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">优化前</p>
                  <p className="text-2xl font-bold">{optimizedResult.scoreBefore}</p>
                </div>
                <div className="text-2xl">→</div>
                <div>
                  <p className="text-sm text-gray-500">优化后</p>
                  <p className="text-2xl font-bold text-green-600">{optimizedResult.scoreAfter}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">提升</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{(optimizedResult.scoreAfter - optimizedResult.scoreBefore).toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">优化后内容预览</label>
                <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {optimizedResult.content.slice(0, 500)}...
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmitResult} disabled={isProcessing}>
                  {isProcessing ? '保存中...' : '保存结果'}
                </Button>
                <Button
                  onClick={handleDeliver}
                  disabled={isProcessing || !ticket.optimizedContent}
                  variant="outline"
                >
                  {isProcessing ? '交付中...' : '交付工单'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    )}
  </div>
) : null}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/tickets/[id]/page.tsx
git commit -m "feat: add optimizer workflow to ticket detail page"
```

---

## Chunk 4: 优化历史记录

### Task 4.1: 创建优化历史组件

**Files:**
- Create: `components/ticket/optimization-history.tsx`

- [ ] **Step 1: 创建优化历史组件**

```typescript
// components/ticket/optimization-history.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { OptimizationRecord } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OptimizationHistoryProps {
  ticketId: string;
}

export function OptimizationHistory({ ticketId }: OptimizationHistoryProps) {
  const [optimizations, setOptimizations] = useState<OptimizationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const fetchOptimizations = async () => {
      try {
        const data = await api.getTicketOptimizations(ticketId);
        setOptimizations(data);
      } catch (error) {
        console.error('Failed to fetch optimizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptimizations();
  }, [ticketId]);

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">加载中...</div>;
  }

  if (optimizations.length === 0) {
    return null;
  }

  // 按时间倒序排列
  const sortedOptimizations = [...optimizations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📑 优化历史 (共 {optimizations.length} 次优化)</h2>
          {optimizations.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompare(!showCompare)}
            >
              {showCompare ? '隐藏对比' : '查看对比'}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {sortedOptimizations.map((opt, index) => {
            const isLatest = index === 0;
            const versionNumber = optimizations.length - index;

            return (
              <div
                key={opt.id}
              >
                <div className={`p-4 rounded-lg border-2 ${
                  isLatest
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">
                        v{versionNumber} {isLatest && '(当前)'}
                      </span>
                      <span className="text-gray-500 ml-3">
                        {new Date(opt.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        评分：<span className="font-medium">{opt.scoreAfter}</span>
                      </span>
                      {opt.scoreAfter > opt.scoreBefore && (
                        <span className="text-sm text-green-600 font-medium">
                          (+{(opt.scoreAfter - opt.scoreBefore).toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    策略：{opt.strategies.join(', ') || '无'}
                  </div>

                  {showCompare && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-gray-500 hover:text-gray-700">
                          查看完整内容
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">
                            {opt.optimizedContent}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 在工单详情页中使用优化历史组件**

**Files:**
- Modify: `app/(dashboard)/tickets/[id]/page.tsx`

```typescript
// 在 app/(dashboard)/tickets/[id]/page.tsx 中
// 1. 添加 import
import { OptimizationHistory } from '@/components/ticket/optimization-history';

// 2. 在评分对比卡片之后添加优化历史组件
// 找到评分对比的 Card，在它后面添加：

{ticket.status !== 'pending' && ticket.status !== 'assigned' && (
  <OptimizationHistory ticketId={ticket.id} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/ticket/optimization-history.tsx app/\(dashboard\)/tickets/[id]/page.tsx
git commit -m "feat: add optimization history component and display"
```

---

## Chunk 5: 侧边栏工单池链接

### Task 5.1: 更新侧边栏（已在 Task 2.1 中完成）

侧边栏已在工单池创建时更新，添加了"工单池"导航项。

---

## Chunk 6: 收尾与验证

### Task 6.1: 端到端验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 使用 Optimizer 账号登录**

邮箱：optimizer@test.com
密码：optimizer123

- [ ] **Step 3: 验证优化师工作流**

1. **工单池**
   - [ ] 侧边栏显示"工单池"导航项
   - [ ] 点击进入工单池页面
   - [ ] 看到 pending 状态的工单列表
   - [ ] 可以领取工单

2. **领取工单**
   - [ ] 点击"领取"按钮
   - [ ] 工单状态变为 assigned
   - [ ] 工单从工单池消失

3. **处理工单**
   - [ ] 从"我的工单"进入已领取的工单详情
   - [ ] 看到"开始处理"按钮
   - [ ] 点击后工单状态变为 processing
   - [ ] 显示优化策略选择界面

4. **执行优化**
   - [ ] 选择优化策略（至少一个）
   - [ ] 选择目标平台（可选）
   - [ ] 输入关键词（可选）
   - [ ] 点击"执行优化"
   - [ ] 看到优化结果（评分对比）
   - [ ] 看到优化后内容预览

5. **保存结果**
   - [ ] 点击"保存结果"
   - [ ] 结果保存到工单

6. **交付工单**
   - [ ] 点击"交付工单"
   - [ ] 如果 needReview=true，状态变为 reviewing
   - [ ] 如果 needReview=false，状态直接变为 completed

7. **优化历史**
   - [ ] 在工单详情页看到"优化历史"卡片
   - [ ] 显示所有优化版本
   - [ ] 点击"查看对比"可以看到完整内容对比
   - [ ] 最新版本高亮显示

8. **Admin 角色**
   - [ ] 使用 admin@test.com 登录
   - [ ] 验证 admin 也有工单池和优化师功能
   - [ ] 可以创建工单

- [ ] **Step 4: 使用 Customer 账号验证审核流程**

1. 登录 customer@test.com
2. 查看 reviewing 状态的工单
3. 验证可以看到优化历史
4. 通过或打回工单

- [ ] **Step 5: 修复发现的问题**

如有问题，修复后提交：
```bash
git add .
git commit -m "fix: address optimizer workflow issues"
```

---

### Task 6.2: 最终提交

- [ ] **Step 1: 查看所有更改**

```bash
git status
```

- [ ] **Step 2: 确保所有文件已提交**

```bash
git add .
git commit -m "chore: phase 2 final cleanup"
```

- [ ] **Step 3: 查看提交历史**

```bash
git log --oneline -15
```

---

## 验收标准

阶段 2 完成后，应该满足：

1. ✅ Admin/Optimizer 可以访问工单池页面
2. ✅ 可以领取 pending 状态的工单
3. ✅ 领取后工单状态变为 assigned
4. ✅ 可以开始处理工单（状态变为 processing）
5. ✅ 可以选择优化策略、目标平台、关键词
6. ✅ 可以执行 AI 优化并看到结果
7. ✅ 可以保存优化结果
8. ✅ 可以交付工单
9. ✅ 优化历史记录正确显示所有版本
10. ✅ 优化历史可以查看内容对比
11. ✅ 交付后工单正确流转到 reviewing 或 completed

---

## 完整功能检查清单

### Customer 角色
- [x] 登录认证
- [x] Dashboard 查看配额和统计
- [x] 查看工单列表（筛选）
- [x] 创建工单
- [x] 查看工单详情
- [x] 审核工单（通过/打回）

### Optimizer 角色
- [x] 登录认证
- [x] Dashboard 查看统计
- [x] 查看工单池
- [x] 领取工单
- [x] 开始处理工单
- [x] 执行 AI 优化
- [x] 保存优化结果
- [x] 交付工单
- [x] 查看优化历史

### Admin 角色
- [x] 所有 Optimizer 功能
- [x] 创建工单

---

## 下一步

完成阶段 2 后，核心工单流程已完整实现。后续可以考虑：

**阶段 3：Admin 高级功能**
- 配额管理界面
- 项目管理界面
- 用户管理界面
- 客户管理界面

**阶段 4：优化增强**
- 实时状态更新（WebSocket）
- 工单搜索功能
- 批量操作
- 数据导出
