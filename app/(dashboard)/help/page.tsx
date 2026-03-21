// app/(dashboard)/help/page.tsx

'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { getHelpContent, getSections } from './content';
import { HelpNav } from './components/HelpNav';
import { QuickStart } from './components/QuickStart';
import { FAQ } from './components/FAQ';
import { GuideContent } from './components/GuideContent';

export default function HelpPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-8">
        <p>请先登录</p>
      </div>
    );
  }

  const content = getHelpContent(user.role);
  const sections = getSections(content);

  return (
    <div className="min-h-screen">
      <div className="p-8 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">帮助中心</h1>
        <p className="text-muted-foreground mt-1">了解如何使用 GEO 优化平台</p>
      </div>

      <div className="flex gap-8 p-8">
        {/* 左侧目录导航 */}
        <HelpNav sections={sections} />

        {/* 右侧内容区 */}
        <div className="flex-1 max-w-4xl">
          {/* 快速入门 */}
          <section id="quickstart" className="scroll-mt-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              快速入门
            </h2>
            <QuickStart items={content.quickStart} />
          </section>

          {/* 常见问题 */}
          <section id="faq" className="scroll-mt-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              常见问题
            </h2>
            <FAQ items={content.faq} />
          </section>

          {/* 完整指南 */}
          <section id="guide" className="scroll-mt-8">
            <GuideContent sections={content.guide} />
          </section>
        </div>
      </div>
    </div>
  );
}
