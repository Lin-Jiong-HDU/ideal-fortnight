'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card } from '@/components/ui/card';

export default function OptimizerTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.optimizer.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch optimizer tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClaim = async (ticketId: string) => {
    setClaimingId(ticketId);
    try {
      await api.optimizer.claimTicket(ticketId);
      // 重新获取列表
      await fetchTickets();
    } catch (error) {
      console.error('Failed to claim ticket:', error);
      alert('领取失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setClaimingId(null);
    }
  };

  // 只显示 pending 状态的工单
  const pendingTickets = tickets.filter(t => t.status === 'pending');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">工单池</h1>
        <Button
          variant="outline"
          onClick={fetchTickets}
          disabled={isLoading}
        >
          🔄 刷新
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-700">
          当前有 <span className="font-bold">{pendingTickets.length}</span> 个待领取工单
        </p>
      </div>

      {/* 工单列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : pendingTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">🎉 暂无待处理工单</p>
          <p className="text-sm text-gray-400">有新工单时会出现在这里</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingTickets.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    📄 {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    客户：{ticket.customer?.companyName || '未分配'}  |  创建于 {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  {ticket.originalContent && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.originalContent.slice(0, 150)}...
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 items-end ml-4">
                  <Badge status={ticket.status} />
                  <Button
                    onClick={() => handleClaim(ticket.id)}
                    disabled={claimingId === ticket.id}
                    size="sm"
                  >
                    {claimingId === ticket.id ? '领取中...' : '领取'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
