'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ticket/ticket-status';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { OptimizationHistory } from '@/components/ticket/optimization-history';

// 优化策略配置
const optimizationStrategies = [
  { value: 'structure', label: '结构化优化', desc: '添加标题层级、列表、章节划分' },
  { value: 'schema', label: 'Schema 标记', desc: '生成 JSON-LD 结构化数据' },
  { value: 'answer_first', label: '答案优先', desc: '将关键结论移到开头' },
  { value: 'authority', label: '权威性增强', desc: '添加数据支撑和专业元素' },
  { value: 'faq', label: 'FAQ 生成', desc: '生成常见问题章节' },
];

const targetPlatforms = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'google_ai', label: 'Google AI' },
  { value: 'claude', label: 'Claude' },
];

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  // Next.js 16: params is a Promise, unwrap with use()
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // 优化师相关状态
  const [optimizationForm, setOptimizationForm] = useState({
    strategies: [] as string[],
    targetAI: [] as string[],
    keywords: '',
  });
  const [optimizedResult, setOptimizedResult] = useState<{
    content: string;
    scoreBefore: number;
    scoreAfter: number;
  } | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await api.getTicket(id);
        setTicket(data);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        setMessage('获取工单详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleReview = async (approved: boolean) => {
    if (!reviewComment.trim() && !approved) {
      setMessage('请填写打回原因');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await api.reviewTicket(id, approved, reviewComment);

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

  // 优化师操作处理函数
  const handleProcess = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      await api.optimizer.processTicket(id);
      const updated = await api.getTicket(id);
      setTicket(updated);
      setMessage('✓ 已开始处理');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptimize = async () => {
    if (optimizationForm.strategies.length === 0) {
      setMessage('请至少选择一种优化策略');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      const result = await api.optimizer.optimizeTicket(id, {
        strategies: optimizationForm.strategies,
        targetAI: optimizationForm.targetAI,
        keywords: optimizationForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      });

      setOptimizedResult({
        content: result.optimizedContent,
        scoreBefore: result.scoreBefore,
        scoreAfter: result.scoreAfter,
      });

      // 更新工单数据
      const updated = await api.getTicket(id);
      setTicket(updated);

      setMessage('✓ 优化完成！');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '优化失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!optimizedResult) {
      setMessage('请先执行优化');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      await api.optimizer.submitTicketResult(id, {
        optimizedContent: optimizedResult.content,
        scoreBefore: optimizedResult.scoreBefore,
        scoreAfter: optimizedResult.scoreAfter,
      });

      const updated = await api.getTicket(id);
      setTicket(updated);
      setMessage('✓ 结果已保存');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliver = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      await api.optimizer.deliverTicket(id);
      const updated = await api.getTicket(id);
      setTicket(updated);

      if (updated.needReview) {
        setMessage('✓ 已交付，等待客户审核');
        setTimeout(() => router.push('/tickets'), 1500);
      } else {
        setMessage('✓ 工单已完成！');
        setTimeout(() => router.push('/tickets'), 1500);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '交付失败');
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
          <p className="text-muted-foreground">工单不存在</p>
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground mb-1">优化前评分</p>
                <p className="text-3xl font-bold text-foreground">{ticket.scoreBefore}</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">优化后评分</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{ticket.scoreAfter}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">提升</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{(ticket.scoreAfter - ticket.scoreBefore).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 优化历史记录 */}
      {ticket.status !== 'pending' && ticket.status !== 'assigned' && (
        <div className="mb-6">
          <OptimizationHistory ticketId={ticket.id} />
        </div>
      )}

      {/* 优化后内容 */}
      {ticket.optimizedContent && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">优化后内容</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-foreground bg-muted p-4 rounded-lg">
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
            <pre className="whitespace-pre-wrap text-muted-foreground text-sm">
              {ticket.originalContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 优化师操作面板 */}
      {user?.role === 'admin' || user?.role === 'optimizer' ? (
        <div className="space-y-6 mb-6">
          {/* assigned 状态 - 开始处理 */}
          {ticket.status === 'assigned' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">开始处理</h2>
                <p className="text-muted-foreground mb-4">领取后点击下方按钮开始处理工单</p>
                {message && !message.includes('✓') && !message.includes('✅') && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-md mb-4">
                    {message}
                  </div>
                )}
                {message && (message.includes('✓') || message.includes('✅')) && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-md mb-4">
                    {message}
                  </div>
                )}
                <Button onClick={handleProcess} disabled={isSubmitting}>
                  {isSubmitting ? '处理中...' : '开始处理'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* processing 状态 - 执行优化 */}
          {ticket.status === 'processing' && !optimizedResult && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">执行优化</h2>

                {/* 优化策略选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">优化策略 *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {optimizationStrategies.map((strategy) => (
                      <label
                        key={strategy.value}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          optimizationForm.strategies.includes(strategy.value)
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 mr-3"
                          checked={optimizationForm.strategies.includes(strategy.value)}
                          onChange={(e) => {
                            const newStrategies = e.target.checked
                              ? [...optimizationForm.strategies, strategy.value]
                              : optimizationForm.strategies.filter(s => s !== strategy.value);
                            setOptimizationForm({ ...optimizationForm, strategies: newStrategies });
                          }}
                        />
                        <div>
                          <p className="font-medium">{strategy.label}</p>
                          <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 目标平台选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">目标平台</label>
                  <div className="flex flex-wrap gap-2">
                    {targetPlatforms.map((platform) => (
                      <label
                        key={platform.value}
                        className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                          optimizationForm.targetAI.includes(platform.value)
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={optimizationForm.targetAI.includes(platform.value)}
                          onChange={(e) => {
                            const newTargetAI = e.target.checked
                              ? [...optimizationForm.targetAI, platform.value]
                              : optimizationForm.targetAI.filter(a => a !== platform.value);
                            setOptimizationForm({ ...optimizationForm, targetAI: newTargetAI });
                          }}
                        />
                        {platform.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 关键词输入 */}
                <div className="mb-6">
                  <label htmlFor="keywords" className="block text-sm font-medium mb-2">关键词</label>
                  <Input
                    id="keywords"
                    placeholder="用逗号分隔，如：云服务, 云计算, 企业上云"
                    value={optimizationForm.keywords}
                    onChange={(e) => setOptimizationForm({ ...optimizationForm, keywords: e.target.value })}
                  />
                </div>

                {message && !message.includes('✓') && !message.includes('✅') && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-md mb-4">
                    {message}
                  </div>
                )}
                {message && (message.includes('✓') || message.includes('✅')) && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-md mb-4">
                    {message}
                  </div>
                )}

                <Button onClick={handleOptimize} disabled={isSubmitting}>
                  {isSubmitting ? '优化中...' : '执行优化'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 优化结果 */}
          {optimizedResult && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">优化结果</h2>

                <div className="flex items-center gap-8 mb-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">优化前</p>
                    <p className="text-2xl font-bold">{optimizedResult.scoreBefore}</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div>
                    <p className="text-sm text-muted-foreground">优化后</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{optimizedResult.scoreAfter}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">提升</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +{(optimizedResult.scoreAfter - optimizedResult.scoreBefore).toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">优化后内容预览</label>
                  <div className="p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {optimizedResult.content.slice(0, 500)}...
                    </pre>
                  </div>
                </div>

                {message && !message.includes('✓') && !message.includes('✅') && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-md mb-4">
                    {message}
                  </div>
                )}
                {message && (message.includes('✓') || message.includes('✅')) && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-md mb-4">
                    {message}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleSubmitResult} disabled={isSubmitting}>
                    {isSubmitting ? '保存中...' : '保存结果'}
                  </Button>
                  <Button
                    onClick={handleDeliver}
                    disabled={isSubmitting || !ticket.optimizedContent}
                    variant="outline"
                  >
                    {isSubmitting ? '交付中...' : '交付工单'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

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
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {message}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview(true)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  ✅ 通过
                </Button>
                <Button
                  onClick={() => handleReview(false)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
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
