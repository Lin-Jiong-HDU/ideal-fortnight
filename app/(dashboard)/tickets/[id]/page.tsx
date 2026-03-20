'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await api.getTicket(params.id);
        setTicket(data);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        setMessage('获取工单详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  const handleReview = async (approved: boolean) => {
    if (!reviewComment.trim() && !approved) {
      setMessage('请填写打回原因');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await api.reviewTicket(params.id, approved, reviewComment);

      if (approved) {
        setMessage('✅ 审核通过！');
        setTimeout(() => {
          router.push('/tickets');
        }, 1500);
      } else {
        setMessage('✓ 已打回，优化师将重新处理');
        setTimeout(() => {
          router.push('/tickets');
        }, 1500);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '审核失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">工单不存在</p>
          <Button onClick={() => router.push('/tickets')} className="mt-4">
            返回列表
          </Button>
        </Card>
      </div>
    );
  }

  const isReviewing = ticket.status === 'reviewing' && user?.role === 'customer';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>
      </div>

      {/* 工单标题和状态 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">📄 {ticket.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>状态：<Badge status={ticket.status} /></span>
          <span>创建于 {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* 评分对比 */}
      {ticket.scoreAfter > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">优化前评分</p>
                <p className="text-3xl font-bold text-gray-700">{ticket.scoreBefore}</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">优化后评分</p>
                <p className="text-3xl font-bold text-green-600">{ticket.scoreAfter}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">提升</p>
                <p className="text-2xl font-bold text-green-600">
                  +{(ticket.scoreAfter - ticket.scoreBefore).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 优化后内容 */}
      {ticket.optimizedContent && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">优化后内容</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                {ticket.optimizedContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 原始内容 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">原始内容</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-600 text-sm">
              {ticket.originalContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 审核操作 */}
      {isReviewing && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">审核工单</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="审核意见（可选）"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
              {message && (
                <div className={`text-sm p-3 rounded-md ${
                  message.includes('✅') || message.includes('✓')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview(true)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✅ 通过
                </Button>
                <Button
                  onClick={() => handleReview(false)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  ❌ 打回
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
