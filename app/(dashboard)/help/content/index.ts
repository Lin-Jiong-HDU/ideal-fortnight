// app/(dashboard)/help/content/index.ts

import type { HelpContent, Section } from './types';
import { customerContent } from './customer';
import { optimizerContent } from './optimizer';
import { adminContent } from './admin';

export type { HelpContent, QuickStartItem, FAQItem, GuideSection, Section } from './types';

const contentByRole: Record<string, HelpContent> = {
  customer: customerContent,
  optimizer: optimizerContent,
  admin: adminContent,
};

export function getHelpContent(role: string): HelpContent {
  return contentByRole[role] || customerContent;
}

export function getSections(content: HelpContent): Section[] {
  const sections: Section[] = [
    { id: 'quickstart', title: '快速入门' },
    { id: 'faq', title: '常见问题' },
  ];

  // 添加指南章节
  if (content.guide.length > 0) {
    const guideSection: Section = {
      id: 'guide',
      title: '完整指南',
      subsections: content.guide.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    };
    sections.push(guideSection);
  }

  return sections;
}
