'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { QuotaPackage, Customer, QuotaHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuotaCard } from '@/components/quota/quota-card';
import { FormDialog } from '@/components/admin/form-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/data-table';

type RechargeStep = 'select-customer' | 'select-package' | 'confirm';

export default function QuotasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [packages, setPackages] = useState<QuotaPackage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotaHistory, setQuotaHistory] = useState<QuotaHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Package dialog
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<QuotaPackage | null>(null);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  const [packageFormData, setPackageFormData] = useState({
    name: '',
    articles: '',
    price: '',
  });

  // Recharge dialog
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [rechargeStep, setRechargeStep] = useState<RechargeStep>('select-customer');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPackageForRecharge, setSelectedPackageForRecharge] = useState<QuotaPackage | null>(null);
  const [rechargeRemark, setRechargeRemark] = useState('');
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState(false);

  const fetchPackages = async () => {
    try {
      const data = await api.admin.getQuotaPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to fetch quota packages:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.admin.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchQuotaHistory = async (customerId: string) => {
    try {
      const data = await api.admin.getQuotaHistory(customerId);
      setQuotaHistory(data);
    } catch (error) {
      console.error('Failed to fetch quota history:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPackages(), fetchCustomers()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Open recharge dialog with preselected customer
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === preselectedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
        setRechargeStep('select-package');
        setRechargeDialogOpen(true);
      }
    }
  }, [preselectedCustomerId, customers]);

  const handleCreateOrUpdatePackage = async () => {
    setIsSubmittingPackage(true);
    try {
      const data = {
        name: packageFormData.name,
        articles: parseInt(packageFormData.articles),
        price: parseFloat(packageFormData.price),
      };

      if (selectedPackage) {
        await api.admin.updateQuotaPackage(selectedPackage.id, data);
      } else {
        await api.admin.createQuotaPackage(data);
      }
      setPackageDialogOpen(false);
      resetPackageForm();
      await fetchPackages();
    } catch (error) {
      console.error('Failed to save package:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  const handleEditPackage = (pkg: QuotaPackage) => {
    setSelectedPackage(pkg);
    setPackageFormData({
      name: pkg.name,
      articles: pkg.articles.toString(),
      price: pkg.price.toString(),
    });
    setPackageDialogOpen(true);
  };

  const resetPackageForm = () => {
    setPackageFormData({ name: '', articles: '', price: '' });
    setSelectedPackage(null);
  };

  const handleRecharge = () => {
    setRechargeStep('select-customer');
    setSelectedCustomer(null);
    setSelectedPackageForRecharge(null);
    setRechargeRemark('');
    setRechargeDialogOpen(true);
  };

  const handleRechargeCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setRechargeStep('select-package');
  };

  const handleRechargePackageSelect = (pkg: QuotaPackage) => {
    setSelectedPackageForRecharge(pkg);
    setRechargeStep('confirm');
  };

  const handleRechargeBack = () => {
    if (rechargeStep === 'confirm') {
      setRechargeStep('select-package');
      setSelectedPackageForRecharge(null);
    } else if (rechargeStep === 'select-package') {
      setRechargeStep('select-customer');
      setSelectedCustomer(null);
    }
  };

  const handleConfirmRecharge = async () => {
    if (!selectedCustomer || !selectedPackageForRecharge) return;

    setIsSubmittingRecharge(true);
    try {
      await api.admin.rechargeQuota(selectedCustomer.id, {
        packageId: selectedPackageForRecharge.id,
        remark: rechargeRemark,
      });
      setRechargeDialogOpen(false);
      await fetchCustomers();
      if (selectedCustomer.id) {
        await fetchQuotaHistory(selectedCustomer.id);
      }
      alert('充值成功！');
    } catch (error) {
      console.error('Failed to recharge:', error);
      alert('充值失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmittingRecharge(false);
    }
  };

  const historyColumns = [
    { key: 'packageName', label: '套餐名称' },
    { key: 'amount', label: '充值数量（篇）' },
    { key: 'remark', label: '备注' },
    {
      key: 'operatedAt',
      label: '充值时间',
      render: (item: QuotaHistory) => new Date(item.operatedAt).toLocaleString(),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">配额管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPackageDialogOpen(true)}>
            + 创建套餐
          </Button>
          <Button onClick={handleRecharge}>
            充值
          </Button>
        </div>
      </div>

      {/* Quota Packages Grid */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>配额套餐</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              加载中...
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无套餐
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <QuotaCard
                  key={pkg.id}
                  quota={pkg}
                  onEdit={handleEditPackage}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quota History (if customer selected) */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCustomer.companyName} - 充值记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quotaHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无充值记录
              </div>
            ) : (
              <DataTable
                data={quotaHistory}
                columns={historyColumns}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Package Create/Edit Dialog */}
      <FormDialog
        title={selectedPackage ? '编辑套餐' : '创建套餐'}
        open={packageDialogOpen}
        onClose={() => {
          setPackageDialogOpen(false);
          resetPackageForm();
        }}
        onSubmit={handleCreateOrUpdatePackage}
        isSubmitting={isSubmittingPackage}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="packageName">套餐名称 *</Label>
            <Input
              id="packageName"
              value={packageFormData.name}
              onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="articles">篇章数 *</Label>
            <Input
              id="articles"
              type="number"
              min="1"
              value={packageFormData.articles}
              onChange={(e) => setPackageFormData({ ...packageFormData, articles: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">价格（元）*</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={packageFormData.price}
              onChange={(e) => setPackageFormData({ ...packageFormData, price: e.target.value })}
              required
            />
          </div>
        </div>
      </FormDialog>

      {/* Recharge Dialog - 3 Steps */}
      <ConfirmDialog
        title={
          rechargeStep === 'select-customer'
            ? '选择客户'
            : rechargeStep === 'select-package'
            ? '选择套餐'
            : '确认充值'
        }
        open={rechargeDialogOpen}
        onClose={() => setRechargeDialogOpen(false)}
        onConfirm={
          rechargeStep === 'confirm'
            ? handleConfirmRecharge
            : () => {}
        }
        confirmLabel={rechargeStep === 'confirm' ? '确认充值' : '下一步'}
        cancelLabel={rechargeStep === 'select-customer' ? '取消' : '上一步'}
        variant="default"
      >
        {rechargeStep === 'select-customer' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleRechargeCustomerSelect(customer)}
                className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">{customer.companyName}</div>
                <div className="text-sm text-gray-500">
                  当前配额: {customer.quotaUsed}/{customer.quotaTotal} 篇
                </div>
              </button>
            ))}
          </div>
        )}

        {rechargeStep === 'select-package' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleRechargePackageSelect(pkg)}
                className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">{pkg.name}</div>
                <div className="text-sm text-gray-500">
                  {pkg.articles} 篇 - ¥{pkg.price}
                </div>
              </button>
            ))}
          </div>
        )}

        {rechargeStep === 'confirm' && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">客户</div>
              <div className="font-medium">{selectedCustomer?.companyName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">套餐</div>
              <div className="font-medium">
                {selectedPackageForRecharge?.name} - {selectedPackageForRecharge?.articles} 篇
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">价格</div>
              <div className="font-medium text-lg text-blue-600">
                ¥{selectedPackageForRecharge?.price}
              </div>
            </div>
            <div>
              <Label htmlFor="remark">备注</Label>
              <Input
                id="remark"
                value={rechargeRemark}
                onChange={(e) => setRechargeRemark(e.target.value)}
                placeholder="选填"
              />
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
              确认要为 {selectedCustomer?.companyName} 充值 {selectedPackageForRecharge?.articles} 篇吗？
            </div>
          </div>
        )}

        {rechargeStep !== 'select-customer' && (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleRechargeBack}
              className="w-full"
            >
              上一步
            </Button>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
