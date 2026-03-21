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
