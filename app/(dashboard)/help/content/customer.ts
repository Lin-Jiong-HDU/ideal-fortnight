// app/(dashboard)/help/content/customer.ts

import type { HelpContent } from './types';

export const customerContent: HelpContent = {
  quickStart: [
    {
      icon: '📝',
      title: '提交工单',
      description: '选择项目，填写需要优化的内容，提交优化需求',
    },
    {
      icon: '📊',
      title: '查看进度',
      description: '在工单列表追踪处理状态，了解优化进展',
    },
    {
      icon: '✅',
      title: '审核结果',
      description: '审核优化后的内容，通过或拒绝并提出反馈',
    },
    {
      icon: '💎',
      title: '查看配额',
      description: '了解剩余优化次数和配额有效期',
    },
  ],

  faq: [
    {
      question: '工单提交后多久能完成？',
      answer: '通常 1-3 个工作日内完成。复杂内容可能需要更长时间。',
    },
    {
      question: '对优化结果不满意怎么办？',
      answer: '您可以拒绝优化结果并填写反馈意见，优化师会根据反馈重新优化。',
    },
    {
      question: '配额用完了怎么办？',
      answer: '请联系管理员或客户经理购买新的配额包。',
    },
    {
      question: '可以修改已提交的工单吗？',
      answer: '工单提交后无法直接修改。如需修改，请联系优化师或管理员。',
    },
  ],

  guide: [
    {
      id: 'intro',
      title: '平台简介',
      content: `
        <p>GEO（Generative Engine Optimization）优化平台帮助您的内容在 AI 搜索引擎（如 ChatGPT、Perplexity、Google AI、Claude）中获得更好的引用和曝光。</p>
        <h3>核心功能</h3>
        <ul>
          <li><strong>提交内容优化</strong>：将需要优化的内容提交给专业优化团队</li>
          <li><strong>实时进度追踪</strong>：随时查看优化进度和状态</li>
          <li><strong>结果审核</strong>：审核优化结果，确认满意后交付</li>
          <li><strong>配额管理</strong>：查看剩余优化次数和有效期</li>
        </ul>
      `,
    },
    {
      id: 'login',
      title: '登录与账户',
      content: `
        <h3>登录步骤</h3>
        <ol>
          <li>访问平台登录页面</li>
          <li>输入您的邮箱地址</li>
          <li>输入密码</li>
          <li>点击「登录」按钮</li>
        </ol>
        <p>登录成功后，系统将自动跳转到控制面板。</p>
        <h3>账户信息</h3>
        <p>您的账户由管理员创建。如需修改账户信息，请联系管理员。</p>
      `,
    },
    {
      id: 'dashboard',
      title: '控制面板',
      content: `
        <p>登录后首先看到的是控制面板，这里展示您的账户概览。</p>
        <h3>配额信息</h3>
        <p>控制面板顶部显示您的配额状态：</p>
        <ul>
          <li><strong>剩余配额</strong>：当前可用的优化次数</li>
          <li><strong>总配额</strong>：账户总优化次数</li>
          <li><strong>到期日期</strong>：配额有效期</li>
        </ul>
        <p><em>⚠️ 配额用尽或过期后将无法提交新工单。请联系管理员充值。</em></p>
        <h3>统计数据</h3>
        <ul>
          <li><strong>待审核</strong>：已完成优化，等待您审核的工单数量</li>
          <li><strong>已完成</strong>：已完成的优化工单总数</li>
        </ul>
      `,
    },
    {
      id: 'tickets',
      title: '工单管理',
      subsections: [
        { id: 'tickets-create', title: '创建工单' },
        { id: 'tickets-list', title: '查看工单列表' },
        { id: 'tickets-detail', title: '工单详情' },
      ],
      content: `
        <h3 id="tickets-create">创建新工单</h3>
        <ol>
          <li>点击侧边栏「新建工单」或在工单列表页点击「新建工单」按钮</li>
          <li>填写工单信息：
            <ul>
              <li><strong>选择项目</strong>：从您的项目列表中选择关联项目</li>
              <li><strong>标题</strong>：简短描述优化需求</li>
              <li><strong>内容</strong>：需要优化的完整内容</li>
              <li><strong>来源类型</strong>（可选）：内容来源（如官网、博客等）</li>
              <li><strong>来源链接</strong>（可选）：原始内容 URL</li>
            </ul>
          </li>
          <li>点击「提交」按钮</li>
        </ol>
        <p><em>📝 提交工单会消耗 1 个配额。请确保内容完整后再提交。</em></p>

        <h3 id="tickets-list">查看工单列表</h3>
        <p>在「我的工单」页面可以查看所有提交的工单。</p>
        <h4>状态筛选</h4>
        <ul>
          <li><strong>全部</strong>：显示所有工单</li>
          <li><strong>待处理</strong>：等待优化师领取</li>
          <li><strong>已领取</strong>：已被优化师领取，等待开始处理</li>
          <li><strong>处理中</strong>：正在优化中</li>
          <li><strong>审核中</strong>：优化完成，等待您审核</li>
          <li><strong>已完成</strong>：已完成的工单</li>
        </ul>

        <h3 id="tickets-detail">工单详情</h3>
        <p>工单详情页展示：</p>
        <ul>
          <li><strong>基本信息</strong>：标题、项目、创建时间、当前状态</li>
          <li><strong>原始内容</strong>：您提交的需要优化的内容</li>
          <li><strong>优化结果</strong>：优化师提交的优化后内容（优化完成后显示）</li>
          <li><strong>优化历史</strong>：记录每次优化的分数变化和策略</li>
        </ul>
      `,
    },
    {
      id: 'review',
      title: '工单审核',
      content: `
        <p>当工单状态变为「审核中」时，您需要审核优化结果。</p>
        <h3>审核步骤</h3>
        <ol>
          <li>进入工单详情页</li>
          <li>查看「优化结果」部分：
            <ul>
              <li>优化后的内容</li>
              <li>优化前后的分数对比</li>
              <li>使用的优化策略</li>
              <li>目标 AI 平台</li>
            </ul>
          </li>
          <li>做出决定：
            <ul>
              <li><strong>通过</strong>：确认满意，点击「通过」按钮完成工单</li>
              <li><strong>拒绝</strong>：如不满意，点击「拒绝」并填写反馈意见，优化师将重新优化</li>
            </ul>
          </li>
        </ol>
        <h3>审核建议</h3>
        <ul>
          <li>仔细阅读优化后的内容，确保符合您的品牌调性</li>
          <li>检查关键信息是否准确</li>
          <li>如有修改意见，在拒绝时详细说明</li>
        </ul>
        <p><em>⚠️ 工单通过后将正式完成，无法再次修改。请确认满意后再通过。</em></p>
      `,
    },
    {
      id: 'quota',
      title: '配额管理',
      content: `
        <h3>查看配额</h3>
        <p>在控制面板顶部可以看到当前配额信息。</p>
        <h3>配额规则</h3>
        <ul>
          <li>每提交一个工单消耗 1 个配额</li>
          <li>配额有有效期限制，过期作废</li>
          <li>配额不足时无法提交新工单</li>
        </ul>
        <h3>充值配额</h3>
        <p>如需充值配额，请联系您的客户经理或管理员。</p>
      `,
    },
  ],
};
