'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const isItemActive = (item: NavItem): boolean => {
    // 精确匹配或子路径匹配（排除父路径被错误匹配）
    if (pathname === item.href) {
      return true;
    }
    // 只有当 href 不是其他项的子路径时才使用 startsWith
    if (pathname.startsWith(item.href + '/')) {
      // 检查是否有更精确的匹配（更长的 href）
      const allItems = navItems.flatMap((i) => [i, ...(i.subitems || [])]);
      const hasMoreSpecificMatch = allItems.some(
        (other) => other.href !== item.href && other.href.startsWith(item.href + '/') && pathname.startsWith(other.href)
      );
      if (!hasMoreSpecificMatch) {
        return true;
      }
    }
    if (item.subitems) {
      return item.subitems.some((subitem) => pathname === subitem.href || pathname.startsWith(subitem.href + '/'));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedMenus.has(item.href);
    const hasSubitems = item.subitems && item.subitems.length > 0;

    return (
      <li key={item.href}>
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer',
            isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-foreground hover:bg-muted',
            depth > 0 && 'ml-4'
          )}
          onClick={() => {
            if (hasSubitems) {
              toggleMenu(item.href);
            } else {
              router.push(item.href);
            }
          }}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          {hasSubitems && (
            <span
              className={cn(
                'transition-transform',
                isExpanded ? 'rotate-90' : ''
              )}
            >
              ▶
            </span>
          )}
        </div>
        {hasSubitems && isExpanded && (
          <ul className="mt-1 space-y-1">
            {item.subitems!.map((subitem) => renderNavItem(subitem, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">
          GEO 优化平台
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">{navItems.map((item) => renderNavItem(item))}</ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex-1 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </aside>
  );
}
