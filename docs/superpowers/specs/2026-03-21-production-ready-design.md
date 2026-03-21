# 生产就绪改进设计

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** 使项目达到生产就绪状态

**Architecture:** 统一日志工具 + 页面级 Error Boundary + GitHub Actions CI

**Tech Stack:** TypeScript, React, GitHub Actions

---

## 1. 统一日志工具

### 文件
- 创建: `lib/logger.ts`

### 设计

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};
```

### 需要替换的文件（24 处）

- `app/(dashboard)/tickets/page.tsx`
- `app/(dashboard)/tickets/new/page.tsx`
- `app/(dashboard)/tickets/[id]/page.tsx`
- `components/ticket/optimization-history.tsx`
- `app/(dashboard)/admin/users/page.tsx`
- `app/(dashboard)/admin/users/[id]/page.tsx`
- `app/(dashboard)/admin/customers/page.tsx`
- `app/(dashboard)/admin/customers/[id]/page.tsx`
- `app/(dashboard)/admin/projects/page.tsx`
- `app/(dashboard)/admin/projects/new/page.tsx`
- `app/(dashboard)/admin/quotas/page.tsx`
- `app/(dashboard)/optimizer/tickets/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`

---

## 2. Error Boundary

### 文件
- 创建: `components/error-boundary.tsx`

### 设计

```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultFallback />;
    }
    return this.props.children;
  }
}

function DefaultFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
      <h2 className="text-xl font-bold text-red-500 mb-2">出错了</h2>
      <p className="text-muted-foreground mb-4">页面加载失败，请刷新重试</p>
      <button
        onClick={() => location.reload()}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        刷新页面
      </button>
    </div>
  );
}
```

### 需要包裹的页面

- `app/(dashboard)/admin/users/page.tsx`
- `app/(dashboard)/admin/customers/page.tsx`
- `app/(dashboard)/admin/projects/page.tsx`
- `app/(dashboard)/admin/quotas/page.tsx`
- `app/(dashboard)/tickets/page.tsx`
- `app/(dashboard)/tickets/[id]/page.tsx`
- `app/(dashboard)/optimizer/tickets/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`

---

## 3. CI/CD (GitHub Actions)

### 文件
- 创建: `.github/workflows/ci.yml`

### 设计

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
```

---

## 实现顺序

1. Logger 工具 → 替换所有 console.error
2. Error Boundary → 包裹页面组件
3. CI/CD 配置
