'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Customer, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepWizard, Step } from '@/components/admin/step-wizard';

export default function NewProjectPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<{
    customerId: string;
    name: string;
    description: string;
    companyWebsite: string;
    productUrl: string;
    productDescription: string;
    productFeatures: string;
    usp: string;
    brandVoice: string;
    targetAudience: string;
    competitors: Array<{ name: string; website: string; weaknesses: string; commonObjections: string }>;
  }>({
    customerId: '',
    name: '',
    description: '',
    companyWebsite: '',
    productUrl: '',
    productDescription: '',
    productFeatures: '',
    usp: '',
    brandVoice: '',
    targetAudience: '',
    competitors: [{ name: '', website: '', weaknesses: '', commonObjections: '' }],
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await api.admin.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !formData.customerId) {
      alert('请选择客户');
      return;
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.customerId || !formData.name) {
      alert('请填写必填项');
      return;
    }

    setIsSubmitting(true);
    try {
      const customer = customers.find((c) => c.id === formData.customerId);
      if (!customer) {
        throw new Error('未找到客户');
      }

      await api.admin.createProject({
        customerId: formData.customerId,
        name: formData.name,
        description: formData.description || undefined,
        enterpriseInfo: {
          companyName: customer.companyName,
          companyWebsite: formData.companyWebsite,
          companyDescription: '', // Could add to form
          productName: formData.name,
          productUrl: formData.productUrl,
          productDescription: formData.productDescription,
          productFeatures: formData.productFeatures.split('\n').filter((f) => f.trim()),
          usp: formData.usp.split('\n').filter((u) => u.trim()),
          brandVoice: formData.brandVoice,
          targetAudience: formData.targetAudience,
          certifications: [],
          awards: [],
        },
        competitorInfo: formData.competitors
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name,
            website: c.website,
            weaknesses: c.weaknesses.split('\n').filter((w) => w.trim()),
            commonObjections: c.commonObjections.split('\n').filter((o) => o.trim()),
          })),
      });

      router.push('/admin/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('创建失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCompetitor = () => {
    setFormData({
      ...formData,
      competitors: [...formData.competitors, { name: '', website: '', weaknesses: '', commonObjections: '' }],
    });
  };

  const removeCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  const updateCompetitor = (index: number, field: string, value: string) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = { ...newCompetitors[index], [field]: value };
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const steps: Step[] = [
    {
      title: '基本信息',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerId">客户 *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value: string | null) => {
                if (value) {
                  setFormData({ ...formData, customerId: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择客户" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.customerId && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                客户: {customers.find((c) => c.id === formData.customerId)?.companyName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                行业: {customers.find((c) => c.id === formData.customerId)?.industry || '未设置'}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '产品信息',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">项目名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如: 官网内容优化"
            />
          </div>
          <div>
            <Label htmlFor="description">项目描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="简要描述项目目标"
            />
          </div>
          <div>
            <Label htmlFor="companyWebsite">公司官网</Label>
            <Input
              id="companyWebsite"
              value={formData.companyWebsite}
              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label htmlFor="productUrl">产品页面URL</Label>
            <Input
              id="productUrl"
              value={formData.productUrl}
              onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
              placeholder="https://example.com/product"
            />
          </div>
          <div>
            <Label htmlFor="productDescription">产品描述</Label>
            <Textarea
              id="productDescription"
              value={formData.productDescription}
              onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              rows={3}
              placeholder="详细描述产品功能和特点"
            />
          </div>
          <div>
            <Label htmlFor="productFeatures">产品特点 (每行一个)</Label>
            <Textarea
              id="productFeatures"
              value={formData.productFeatures}
              onChange={(e) => setFormData({ ...formData, productFeatures: e.target.value })}
              rows={3}
              placeholder="特点1&#10;特点2&#10;特点3"
            />
          </div>
          <div>
            <Label htmlFor="usp">独特卖点 (每行一个)</Label>
            <Textarea
              id="usp"
              value={formData.usp}
              onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
              rows={3}
              placeholder="卖点1&#10;卖点2&#10;卖点3"
            />
          </div>
          <div>
            <Label htmlFor="brandVoice">品牌调性</Label>
            <Textarea
              id="brandVoice"
              value={formData.brandVoice}
              onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
              rows={2}
              placeholder="例如: 专业、友好、创新"
            />
          </div>
          <div>
            <Label htmlFor="targetAudience">目标受众</Label>
            <Textarea
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              rows={2}
              placeholder="例如: 25-35岁城市白领，关注健康生活"
            />
          </div>
        </div>
      ),
    },
    {
      title: '竞争对手',
      content: (
        <div className="space-y-4">
          {formData.competitors.map((competitor, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">竞争对手 {index + 1}</h4>
                {formData.competitors.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCompetitor(index)}
                  >
                    删除
                  </Button>
                )}
              </div>
              <div>
                <Label>竞争对手名称</Label>
                <Input
                  value={competitor.name}
                  onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                  placeholder="竞争对手名称"
                />
              </div>
              <div>
                <Label>网站</Label>
                <Input
                  value={competitor.website}
                  onChange={(e) => updateCompetitor(index, 'website', e.target.value)}
                  placeholder="https://competitor.com"
                />
              </div>
              <div>
                <Label>弱点分析 (每行一个)</Label>
                <Textarea
                  value={competitor.weaknesses}
                  onChange={(e) => updateCompetitor(index, 'weaknesses', e.target.value)}
                  rows={2}
                  placeholder="弱点1&#10;弱点2"
                />
              </div>
              <div>
                <Label>常见异议 (每行一个)</Label>
                <Textarea
                  value={competitor.commonObjections}
                  onChange={(e) => updateCompetitor(index, 'commonObjections', e.target.value)}
                  rows={2}
                  placeholder="异议1&#10;异议2"
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCompetitor}>
            + 添加竞争对手
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">创建新项目</h1>
        <StepWizard
          steps={steps}
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
