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
