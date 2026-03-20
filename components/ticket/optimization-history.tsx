'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { OptimizationRecord } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OptimizationHistoryProps {
  ticketId: string;
}

export function OptimizationHistory({ ticketId }: OptimizationHistoryProps) {
  const [optimizations, setOptimizations] = useState<OptimizationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const fetchOptimizations = async () => {
      try {
        const data = await api.optimizer.getTicketOptimizations(ticketId);
        setOptimizations(data);
      } catch (error) {
        console.error('Failed to fetch optimizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptimizations();
  }, [ticketId]);

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">加载中...</div>;
  }

  if (optimizations.length === 0) {
    return null;
  }

  // 按时间倒序排列
  const sortedOptimizations = [...optimizations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📑 优化历史 (共 {optimizations.length} 次优化)</h2>
          {optimizations.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompare(!showCompare)}
            >
              {showCompare ? '隐藏对比' : '查看对比'}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {sortedOptimizations.map((opt, index) => {
            const isLatest = index === 0;
            const versionNumber = optimizations.length - index;

            return (
              <div
                key={opt.id}
              >
                <div className={`p-4 rounded-lg border-2 ${
                  isLatest
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">
                        v{versionNumber} {isLatest && '(当前)'}
                      </span>
                      <span className="text-gray-500 ml-3">
                        {new Date(opt.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        评分：<span className="font-medium">{opt.scoreAfter}</span>
                      </span>
                      {opt.scoreAfter > opt.scoreBefore && (
                        <span className="text-sm text-green-600 font-medium">
                          (+{(opt.scoreAfter - opt.scoreBefore).toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    策略：{opt.strategies.join(', ') || '无'}
                  </div>

                  {showCompare && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-gray-500 hover:text-gray-700">
                          查看完整内容
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">
                            {opt.optimizedContent}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
