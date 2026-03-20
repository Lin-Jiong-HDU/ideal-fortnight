'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewTicketPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    content: '',
    needReview: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 加载项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.customer.getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.projectId || !formData.title || !formData.content) {
      setError('请填写所有必填项');
      return;
    }

    setIsLoading(true);

    try {
      await api.customer.createTicket({
        projectId: formData.projectId,
        title: formData.title,
        content: formData.content,
        needReview: formData.needReview,
      });

      router.push('/tickets');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建工单失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📝 创建工单</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 选择项目 */}
            <div className="space-y-2">
              <Label htmlFor="project">选择项目 *</Label>
              <select
                id="project"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                required
                disabled={isLoadingProjects}
              >
                <option value="">
                  {isLoadingProjects ? '加载中...' : '请选择项目'}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {projects.length === 0 && !isLoadingProjects && (
                <p className="text-sm text-muted-foreground">
                  暂无可用项目，请先联系管理员创建项目
                </p>
              )}
            </div>

            {/* 工单标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">工单标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：如何选择云服务提供商"
                required
              />
            </div>

            {/* 原始内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">原始内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="粘贴或输入要优化的文章内容..."
                rows={12}
                required
                className="resize-none"
              />
            </div>

            {/* 是否需要审核 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="needReview"
                checked={formData.needReview}
                onChange={(e) => setFormData({ ...formData, needReview: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <Label htmlFor="needReview" className="cursor-pointer">
                需要审核（交付后需要你审核通过才完成）
              </Label>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '提交中...' : '提交'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
