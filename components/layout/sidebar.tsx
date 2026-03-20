'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

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

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          GEO 优化平台
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
