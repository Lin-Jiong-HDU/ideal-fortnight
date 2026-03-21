'use client';
import logger from '@/lib/logger';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomer = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getCustomer(id);
      setCustomer(data);
    } catch (error) {
      logger.error('Failed to fetch customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-muted-foreground">
          加载中...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-muted-foreground">
          客户不存在
        </div>
      </div>
    );
  }

  const quotaRemaining = customer.quotaTotal - customer.quotaUsed;
  const quotaPercentage = customer.quotaTotal > 0
    ? (customer.quotaUsed / customer.quotaTotal) * 100
    : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">客户详情</h1>
        <Button
          onClick={() => router.push(`/admin/quotas?customerId=${customer.id}`)}
        >
          充值
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">公司名称</div>
                <div className="font-medium">{customer.companyName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">行业</div>
                <div className="font-medium">{customer.industry || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">联系电话</div>
                <div className="font-medium">{customer.contactPhone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">创建时间</div>
                <div className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">备注</div>
                <div className="font-medium">{customer.notes || '-'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quota Card */}
        <Card>
          <CardHeader>
            <CardTitle>配额信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">总配额</span>
                <span className="text-lg font-semibold">{customer.quotaTotal} 篇</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已使用</span>
                <span className="text-lg font-semibold">{customer.quotaUsed} 篇</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">剩余</span>
                <Badge variant={quotaRemaining > 0 ? 'default' : 'destructive'}>
                  {quotaRemaining} 篇
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">到期时间</span>
                <span className="font-medium">
                  {new Date(customer.quotaExpireAt).toLocaleDateString()}
                </span>
              </div>
              {/* Progress bar */}
              <div className="pt-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      quotaPercentage > 80 ? 'bg-red-500' : quotaPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {quotaPercentage.toFixed(1)}% 已使用
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
