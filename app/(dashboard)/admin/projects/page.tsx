'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Project, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, customersData] = await Promise.all([
        api.admin.getProjects(),
        api.admin.getCustomers(),
      ]);
      setProjects(projectsData);
      const customersMap: Record<string, Customer> = {};
      customersData.forEach((customer) => {
        customersMap[customer.id] = customer;
      });
      setCustomers(customersMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await api.admin.deleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers[customerId]?.companyName || '未知客户';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <Button onClick={() => router.push('/admin/projects/new')}>
          + 创建项目
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">暂无项目</p>
            <Button onClick={() => router.push('/admin/projects/new')}>
              创建第一个项目
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/admin/projects/${project.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <span className="font-medium mr-2">客户:</span>
                    <span>{getCustomerName(project.customerId)}</span>
                  </div>
                  {project.description && (
                    <div className="text-muted-foreground line-clamp-2">
                      {project.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    创建于 {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project);
                    }}
                  >
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        title="确认删除项目"
        message={`确定要删除项目 "${projectToDelete?.name}" 吗？此操作不可恢复。`}
        confirmLabel="删除"
        cancelLabel="取消"
        variant="destructive"
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
