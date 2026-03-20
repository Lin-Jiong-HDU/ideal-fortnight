'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket, TicketStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card } from '@/components/ui/card';

const statusFilters: { value: 'all' | TicketStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待领取' },
  { value: 'assigned', label: '已分配' },
  { value: 'processing', label: '处理中' },
  { value: 'reviewing', label: '待审核' },
  { value: 'completed', label: '已完成' },
];

export default function TicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // 根据角色调用不同的 API
      let data;
      if (user?.role === 'customer') {
        data = await api.customer.getTickets();
      } else if (user?.role === 'optimizer') {
        // optimizer 使用 getMyTickets 获取已领取的工单
        data = await api.optimizer.getMyTickets();
      } else {
        // admin 使用 getTickets 获取所有工单
        data = await api.optimizer.getTickets();
      }
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === 'customer' || user?.role === 'optimizer' ? '我的工单' : '工单列表'}
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchTickets}
            disabled={isLoading}
          >
            🔄 刷新
          </Button>
          <Button onClick={() => router.push('/tickets/new')}>
            ➕ 创建工单
          </Button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 mb-6">
        {statusFilters.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === item.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 工单列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">暂无工单</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/tickets/${ticket.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    📄 {ticket.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    项目：{ticket.project?.name || '未分配'}  |  创建于 {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  {ticket.originalContent && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.originalContent.slice(0, 150)}...
                    </p>
                  )}
                  {ticket.scoreAfter > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-muted-foreground">优化前：{ticket.scoreBefore}</span>
                      <span className="mx-2">→</span>
                      <span className="text-muted-foreground">优化后：{ticket.scoreAfter}</span>
                      <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                        (+{(ticket.scoreAfter - ticket.scoreBefore).toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
                <Badge status={ticket.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
