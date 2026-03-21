// app/(dashboard)/help/content/types.ts

export interface QuickStartItem {
  icon: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string; // HTML 内容
  subsections?: { id: string; title: string }[];
}

export interface HelpContent {
  quickStart: QuickStartItem[];
  faq: FAQItem[];
  guide: GuideSection[];
}

export interface Section {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}
