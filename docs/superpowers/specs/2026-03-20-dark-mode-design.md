# 深色模式支持设计文档

**日期**: 2026-03-20
**状态**: 设计阶段

## 概述

为 GEO 优化平台添加完整的深色模式支持，让用户可以切换浅色/深色主题，提升使用体验。

## 需求

1. 支持浅色、深色、跟随系统三种模式
2. 主题选择持久化保存
3. 切换时有平滑的过渡效果
4. 不修改核心业务逻辑，仅修改样式
5. 切换按钮位于侧边栏底部用户区域

## 架构

```
用户点击切换按钮 → next-themes setTheme() → localStorage → html class 变化 → CSS 变量切换 → 全站颜色变化
```

### 核心组件

1. **ThemeProvider** (next-themes) - 管理主题状态，处理 SSR 闪烁，持久化
2. **CSS 变量系统** - 语义化颜色变量，浅色/深色两套
3. **ThemeToggle 组件** - 切换按钮，位于侧边栏用户区域

## CSS 变量系统

在 `app/globals.css` 中定义完整的颜色变量：

### 浅色模式 (:root)

```css
--background: 0 0% 100%;           /* white */
--foreground: 0 0% 3.9%;           /* near black */
--card: 0 0% 100%;
--card-foreground: 0 0% 3.9%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;
--border: 0 0% 89.8%;
--input: 0 0% 89.8%;
--ring: 0 0% 3.9%;
--primary: 221.2 83.2% 53.3%;       /* blue-600 */
--primary-foreground: 0 0% 98%;
--secondary: 0 0% 96.1%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
```

### 深色模式 (.dark)

```css
--background: 0 0% 3.9%;           /* near black */
--foreground: 0 0% 98%;            /* near white */
--card: 0 0% 3.9%;
--card-foreground: 0 0% 98%;
--muted: 0 0% 14.9%;
--muted-foreground: 0 0% 63.9%;
--border: 0 0% 14.9%;
--input: 0 0% 14.9%;
--ring: 0 0% 83.1%;
--primary: 217.2 91.2% 59.8%;
--primary-foreground: 0 0% 98%;
--secondary: 0 0% 14.9%;
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 0 0% 98%;
```

## 组件修改策略

### UI 组件 (components/ui/)

这些组件已使用语义化类名（如 `bg-card`, `text-card-foreground`），修改最小。

### 业务组件

替换硬编码颜色为语义化类名：

| 原代码 | 修改为 |
|--------|--------|
| `bg-white` | `bg-card` |
| `text-gray-700` | `text-foreground` 或 `text-muted-foreground` |
| `bg-gray-50` | `bg-muted` |
| `bg-blue-50 text-blue-600` | `bg-primary/10 text-primary` |
| `border-gray-200` | `border-border` |
| `hover:bg-gray-100` | `hover:bg-muted` |

### 需要修改的文件

```
app/
└── globals.css                    # 添加 CSS 变量系统
└── layout.tsx                     # 添加 ThemeProvider

components/
├── layout/
│   └── sidebar.tsx                # 添加主题切换按钮
└── theme/
    └── theme-toggle.tsx           # 新增：主题切换组件

lib/
└── providers.tsx                  # 添加 ThemeProvider（如不存在则创建）
```

## 主题切换组件

**位置**: 侧边栏底部用户区域，用户信息和退出登录之间

**功能**:
- 下拉菜单展示三个选项：☀️ 浅色 / 🌙 深色 / 💻 跟随系统
- 显示当前选中的选项
- 使用 base-ui 的 Menu 组件

## 平滑过渡

```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

## 依赖

```bash
pnpm add next-themes
```

## 测试

1. 验证浅色/深色/跟随系统三种模式切换正常
2. 刷新页面后主题选择保持
3. 所有组件在深色模式下对比度良好
4. 过渡动画平滑流畅
