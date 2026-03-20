'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/admin/data-table';
import { FormDialog } from '@/components/admin/form-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer' as UserRole,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      await api.admin.createUser(formData);
      setCreateDialogOpen(false);
      setFormData({ email: '', password: '', name: '', role: 'customer' });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('创建失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.admin.deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'email', label: '邮箱' },
    { key: 'name', label: '姓名' },
    {
      key: 'role',
      label: '角色',
      render: (user: User) => {
        const roleLabels: Record<UserRole, string> = {
          admin: '管理员',
          optimizer: '优化师',
          customer: '客户',
        };
        return roleLabels[user.role] || user.role;
      },
    },
    {
      key: 'createdAt',
      label: '创建时间',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: '操作',
      render: (user: User) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
            setDeleteDialogOpen(true);
          }}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          + 创建用户
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
          />
        </CardContent>
      </Card>

      <FormDialog
        title="创建用户"
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              minLength={6}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">至少 6 个字符</p>
          </div>
          <div>
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">角色 *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              required
            >
              <option value="customer">客户</option>
              <option value="optimizer">优化师</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        title="确认删除"
        message={`确定要删除用户 "${selectedUser?.name}" 吗？此操作不可撤销。`}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        variant="destructive"
      />
    </div>
  );
}
