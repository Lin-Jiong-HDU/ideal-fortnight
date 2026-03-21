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
