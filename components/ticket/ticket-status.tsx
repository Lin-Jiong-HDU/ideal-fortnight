'use client';

import { type TicketStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusConfig: Record<TicketStatus, { color: string; text: string }> = {
  pending: { color: 'bg-muted text-muted-foreground', text: '待领取' },
  assigned: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', text: '已分配' },
  processing: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', text: '处理中' },
  reviewing: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', text: '待审核' },
  completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: '已完成' },
};

export function Badge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
      {config.text}
    </span>
  );
}
