'use client';

import { QuotaPackage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuotaCardProps {
  quota: QuotaPackage;
  onEdit?: (quota: QuotaPackage) => void;
}

export function QuotaCard({ quota, onEdit }: QuotaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{quota.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {quota.articles} 篇章 · {quota.validDays} 天有效
            </p>
          </div>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(quota)}
            >
              编辑
            </Button>
          )}
        </div>
        <div className="text-2xl font-bold text-blue-600">
          ¥{quota.price}
        </div>
      </CardContent>
    </Card>
  );
}
