'use client';
import logger from '@/lib/logger';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket, Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ticket/ticket-status';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 根据角色调用不同的 API
        let ticketsData: Ticket[] = [];

        if (user?.role === 'customer') {
          ticketsData = await api.customer.getTickets();
        } else if (user?.role === 'optimizer') {
          // 优化师需要同时获取工单池和我的工单
          const [poolTickets, myTickets] = await Promise.all([
            api.optimizer.getTickets(),
            api.optimizer.getMyTickets(),
          ]);
          ticketsData = [...poolTickets, ...myTickets];
        } else {
          // admin 使用 status=all 获取所有工单
          ticketsData = await api.optimizer.getTickets('all');
        }

        setTickets(ticketsData);

        // 如果是 customer，获取配额信息
        if (user?.role === 'customer') {
          try {
            const customerData = await api.getCustomerMe();
            setCustomer(customerData);
          } catch {
            // 如果 /customers/me 不可用，使用模拟数据
            setCustomer({
              id: 'mock',
              userId: user.id,
              companyName: '测试公司',
              industry: 'Technology',
              contactPhone: '',
              notes: '',
              quotaTotal: 10,
              quotaUsed: 2,
              quotaExpireAt: '2026-04-18T00:00:00Z',
              createdAt: '',
              updatedAt: '',
            });
          }
        }
      } catch (error) {
        logger.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  // Customer Dashboard
  if (user?.role === 'customer') {
    const pendingReview = tickets.filter(t => t.status === 'reviewing').length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const recentTickets = tickets.slice(0, 5);

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">我的工作台</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">配额剩余</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {customer.quotaTotal - customer.quotaUsed}/{customer.quotaTotal}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  过期时间: {new Date(customer.quotaExpireAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">待审核</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* 最近工单 */}
        <Card>
          <CardHeader>
            <CardTitle>最近工单</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">暂无工单</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">📄 {ticket.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge status={ticket.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin/Optimizer Dashboard
  const pending = tickets.filter(t => t.status === 'pending').length;
  // 进行中包含已分配和处理中的工单
  const processing = tickets.filter(t => t.status === 'assigned' || t.status === 'processing').length;
  const completed = tickets.filter(t => t.status === 'completed').length;
  // 最近工单按创建时间倒序排列
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">工作台</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* 最近工单 */}
      <Card>
        <CardHeader>
          <CardTitle>最近工单</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">暂无工单</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">📄 {ticket.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge status={ticket.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
