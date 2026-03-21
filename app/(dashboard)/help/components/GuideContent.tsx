// app/(dashboard)/help/components/GuideContent.tsx

'use client';

import type { GuideSection } from '../content/types';

interface GuideContentProps {
  sections: GuideSection[];
}

export function GuideContent({ sections }: GuideContentProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
            {section.title}
          </h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none
              [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3
              [&>h4]:text-base [&>h4]:font-medium [&>h4]:mt-4 [&>h4]:mb-2
              [&>p]:text-muted-foreground [&>p]:mb-4
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:text-muted-foreground
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:text-muted-foreground
              [&>ul>li]:mb-1 [&>ol>li]:mb-1
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:text-muted-foreground
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:text-muted-foreground
              [&_li]:mb-1
              [&>table]:w-full [&>table]:border-collapse [&>table]:mb-4
              [&>table>thead>tr]:border-b [&>table>thead>tr]:border-border
              [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:px-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-medium
              [&>table>tbody>tr]:border-b [&>table>tbody>tr]:border-border
              [&>table>tbody>tr>td]:py-2 [&>table>tbody>tr>td]:px-3
              [&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
              [&_strong]:font-semibold [&_strong]:text-foreground
              [&_em]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </section>
      ))}
    </div>
  );
}
