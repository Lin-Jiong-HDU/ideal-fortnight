'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Customer, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/admin/data-table';
import { FormDialog } from '@/components/admin/form-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    companyName: '',
    contactPhone: '',
    industry: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers();
      // 只显示 customer 角色的用户
      setUsers(data.filter(u => u.role === 'customer'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!dialogOpen) {
      setFormData({ userId: '', companyName: '', contactPhone: '', industry: '', notes: '' });
      setSelectedCustomer(null);
    }
  }, [dialogOpen]);

  const handleCreateOrUpdateCustomer = async () => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await api.admin.updateCustomer(selectedCustomer.id, formData);
      } else {
        await api.admin.createCustomer(formData);
      }
      setDialogOpen(false);
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      userId: customer.userId,
      companyName: customer.companyName,
      contactPhone: customer.contactPhone,
      industry: customer.industry,
      notes: customer.notes,
    });
    setDialogOpen(true);
  };

  const handleRecharge = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    router.push(`/admin/quotas?customerId=${customerId}`);
  };

  const columns = [
    { key: 'companyName', label: '公司名称' },
    { key: 'industry', label: '行业' },
    {
      key: 'quota',
      label: '配额',
      render: (customer: Customer) => `${customer.quotaUsed}/${customer.quotaTotal}`,
    },
    {
      key: 'createdAt',
      label: '创建时间',
      render: (customer: Customer) => new Date(customer.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: '操作',
      render: (customer: Customer) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleRecharge(e, customer.id)}
          >
            充值
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">客户管理</h1>
        <Button onClick={() => setDialogOpen(true)}>
          + 创建客户
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>客户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={customers}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(customer) => router.push(`/admin/customers/${customer.id}`)}
          />
        </CardContent>
      </Card>

      <FormDialog
        title={selectedCustomer ? '编辑客户' : '创建客户'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateOrUpdateCustomer}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          {!selectedCustomer && (
            <div>
              <Label htmlFor="userId">关联用户 *</Label>
              <select
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                required
              >
                <option value="">请选择用户</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label htmlFor="companyName">公司名称 *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">联系电话</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="industry">行业</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
