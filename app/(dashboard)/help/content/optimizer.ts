// app/(dashboard)/help/content/optimizer.ts

import type { HelpContent } from './types';

export const optimizerContent: HelpContent = {
  quickStart: [
    {
      icon: '📥',
      title: '领取工单',
      description: '从工单池选择感兴趣的工单领取',
    },
    {
      icon: '⚡',
      title: '执行优化',
      description: '阅读原始内容，使用 AI 工具执行优化',
    },
    {
      icon: '📤',
      title: '提交结果',
      description: '查看优化结果和分数对比，提交供客户审核',
    },
    {
      icon: '🔄',
      title: '处理反馈',
      description: '根据客户反馈重新优化，直到满意',
    },
  ],

  faq: [
    {
      question: '可以同时领取多个工单吗？',
      answer: '可以，但建议根据处理能力合理领取，避免积压。',
    },
    {
      question: '客户拒绝优化结果怎么办？',
      answer: '仔细阅读客户反馈，针对性地修改内容，重新提交。',
    },
    {
      question: '优化策略应该怎么选择？',
      answer: '根据内容类型和客户需求选择。不确定时可以多选，系统会综合应用。',
    },
    {
      question: '分数提升多少算正常？',
      answer: '通常提升 10-30% 是正常的。具体取决于原始内容质量。',
    },
    {
      question: '可以手动修改 AI 优化结果吗？',
      answer: '可以。优化完成后，您可以在提交前手动调整内容。',
    },
  ],

  guide: [
    {
      id: 'intro',
      title: '平台简介',
      content: `
        <p>作为 GEO 优化师，您的主要职责是处理客户提交的内容优化工单，运用专业知识和 AI 辅助工具，提升内容在 AI 搜索引擎中的引用率。</p>
        <h3>核心职责</h3>
        <ul>
          <li>从工单池领取待处理工单</li>
          <li>分析客户内容和需求</li>
          <li>执行内容优化</li>
          <li>提交优化结果供客户审核</li>
        </ul>
      `,
    },
    {
      id: 'ticket-pool',
      title: '工单池',
      content: `
        <p>工单池展示所有待领取的工单。</p>
        <h3>查看工单池</h3>
        <ol>
          <li>点击侧边栏「工单池」</li>
          <li>浏览待处理工单列表</li>
        </ol>
        <p><em>📝 优化师只能看到「待处理」状态的工单。</em></p>
        <h3>领取工单</h3>
        <ol>
          <li>在工单池中选择感兴趣的工单</li>
          <li>点击工单查看详情</li>
          <li>点击「领取工单」按钮</li>
          <li>工单将移至「我的工单」</li>
        </ol>
        <h3>领取建议</h3>
        <ul>
          <li>优先处理紧急或高优先级的工单</li>
          <li>选择您擅长领域的内容</li>
          <li>避免一次领取过多工单</li>
        </ul>
      `,
    },
    {
      id: 'workflow',
      title: '工单处理流程',
      content: `
        <h3>完整流程</h3>
        <p><code>领取工单 → 开始处理 → 执行优化 → 提交结果 → 交付工单</code></p>

        <h4>1. 领取工单</h4>
        <p>从工单池选择工单并领取。</p>

        <h4>2. 开始处理</h4>
        <ol>
          <li>进入工单详情页</li>
          <li>点击「开始处理」按钮</li>
          <li>工单状态变为「处理中」</li>
        </ol>

        <h4>3. 执行优化</h4>
        <ol>
          <li>阅读原始内容和客户需求</li>
          <li>点击「执行优化」按钮</li>
          <li>配置优化参数：
            <ul>
              <li><strong>优化策略</strong>：选择适用的优化策略</li>
              <li><strong>目标平台</strong>：选择目标 AI 搜索引擎</li>
              <li><strong>关键词</strong>：输入需要覆盖的关键词</li>
            </ul>
          </li>
          <li>点击「执行」按钮</li>
          <li>系统将自动执行 AI 优化</li>
        </ol>

        <h4>4. 提交结果</h4>
        <ol>
          <li>查看优化结果和分数对比</li>
          <li>如满意，点击「提交结果」</li>
          <li>如不满意，可重新执行优化</li>
        </ol>

        <h4>5. 交付工单</h4>
        <ol>
          <li>提交结果后，工单状态变为「审核中」</li>
          <li>客户审核通过后，工单完成</li>
          <li>如客户拒绝，您需要根据反馈重新优化</li>
        </ol>
      `,
    },
    {
      id: 'optimization',
      title: '内容优化指南',
      subsections: [
        { id: 'opt-strategy', title: '优化策略' },
        { id: 'opt-tips', title: '优化建议' },
      ],
      content: `
        <h3 id="opt-strategy">优化策略说明</h3>
        <table>
          <thead>
            <tr>
              <th>策略</th>
              <th>说明</th>
              <th>适用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>structure</td><td>结构化内容</td><td>需要清晰层次结构的内容</td></tr>
            <tr><td>schema</td><td>添加结构化数据</td><td>需要搜索引擎更好理解的内容</td></tr>
            <tr><td>answer_first</td><td>答案优先</td><td>问答类内容</td></tr>
            <tr><td>authority</td><td>权威性增强</td><td>需要建立专业权威的内容</td></tr>
            <tr><td>faq</td><td>FAQ 优化</td><td>常见问题类内容</td></tr>
          </tbody>
        </table>

        <h3 id="opt-tips">优化建议</h3>
        <h4>内容结构</h4>
        <ul>
          <li>使用清晰的标题层次（H1-H4）</li>
          <li>段落简洁，每段 2-3 句话</li>
          <li>使用列表和表格提高可读性</li>
        </ul>
        <h4>关键词</h4>
        <ul>
          <li>覆盖用户可能搜索的关键词</li>
          <li>自然融入关键词，避免堆砌</li>
          <li>包含同义词和相关词</li>
        </ul>
        <h4>AI 友好</h4>
        <ul>
          <li>提供明确的答案和结论</li>
          <li>使用数据和事实支撑观点</li>
          <li>避免模糊和不确定的表述</li>
        </ul>
      `,
    },
  ],
};
