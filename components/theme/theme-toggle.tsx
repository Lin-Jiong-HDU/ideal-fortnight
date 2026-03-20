'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免服务端渲染不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-full px-4 py-2 text-sm text-muted-foreground rounded-lg opacity-50">
        加载中...
      </button>
    );
  }

  const themes = [
    { value: 'light', label: '浅色', icon: '☀️' },
    { value: 'dark', label: '深色', icon: '🌙' },
    { value: 'system', label: '跟随系统', icon: '💻' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
        aria-label={`当前主题：${currentTheme.label}`}
      >
        <span>{currentTheme.icon}</span>
        <span className="flex-1 text-left">{currentTheme.label}</span>
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner className="z-50">
          <MenuPrimitive.Popup className="min-w-[150px] bg-card border border-border rounded-lg shadow-lg p-1">
            {themes.map((t) => (
              <MenuPrimitive.Item
                key={t.value}
                onClick={() => setTheme(t.value)}
                aria-current={theme === t.value ? 'true' : undefined}
                className={`
                  px-3 py-2 text-sm rounded-md cursor-pointer
                  ${theme === t.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </span>
              </MenuPrimitive.Item>
            ))}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
