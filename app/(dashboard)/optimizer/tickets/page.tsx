'use client';
import logger from '@/lib/logger';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket, TicketStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card } from '@/components/ui/card';

const statusFilters: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'pending', label: '待领取' },
  { value: 'assigned', label: '已分配' },
  { value: 'processing', label: '处理中' },
  { value: 'reviewing', label: '待审核' },
  { value: 'completed', label: '已完成' },
];

export default function OptimizerTicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('pending');

  const isAdmin = user?.role === 'admin';

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      let data: Ticket[];

      if (isAdmin) {
        // admin 使用 status 参数获取对应状态的工单
        const statusParam = statusFilter === 'all' ? 'all' : statusFilter;
        data = await api.optimizer.getTickets(statusParam);
      } else {
        // optimizer 只能获取 pending 状态的工单
        data = await api.optimizer.getTickets();
      }

      setTickets(data);
    } catch (error) {
      logger.error('Failed to fetch optimizer tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, statusFilter]);

  const handleClaim = async (ticketId: string) => {
    setClaimingId(ticketId);
    try {
      await api.optimizer.claimTicket(ticketId);
      // 重新获取列表
      await fetchTickets();
    } catch (error) {
      logger.error('Failed to claim ticket:', error);
      alert('领取失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setClaimingId(null);
    }
  };

  // 只有 pending 状态的工单可以领取
  const canClaim = (ticket: Ticket) => ticket.status === 'pending';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isAdmin ? '管理员工单池' : '工单池'}</h1>
          {!isAdmin && (
            <p className="text-sm text-muted-foreground mt-1">
              显示待领取的工单
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={fetchTickets}
          disabled={isLoading}
        >
          🔄 刷新
        </Button>
      </div>

      {/* Admin 状态筛选器 */}
      {isAdmin && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            key="all"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-muted'
            }`}
          >
            全部
          </button>
          {statusFilters.map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === item.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              {item.label} ({tickets.filter(t => t.status === item.value).length})
            </button>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div className="mb-6 p-4 bg-primary/10 rounded-lg">
        <p className="text-primary">
          {isAdmin ? (
            <span>
              当前筛选: <span className="font-bold">{statusFilter === 'all' ? '全部' : statusFilters.find(s => s.value === statusFilter)?.label}</span>
              ，共 <span className="font-bold">{tickets.length}</span> 个工单
            </span>
          ) : (
            <span>
              当前有 <span className="font-bold">{tickets.length}</span> 个待领取工单
            </span>
          )}
        </p>
      </div>

      {/* 工单列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">🎉 暂无工单</p>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? '当前筛选条件下没有工单' : '有新工单时会出现在这里'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    📄 {ticket.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    客户：{ticket.customer?.companyName || '未分配'}  |  创建于 {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  {ticket.originalContent && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.originalContent.slice(0, 150)}...
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 items-end ml-4">
                  <Badge status={ticket.status} />
                  {canClaim(ticket) && (
                    <Button
                      onClick={() => handleClaim(ticket.id)}
                      disabled={claimingId === ticket.id}
                      size="sm"
                    >
                      {claimingId === ticket.id ? '领取中...' : '领取'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
