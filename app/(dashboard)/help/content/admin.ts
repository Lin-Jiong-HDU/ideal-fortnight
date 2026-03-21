// app/(dashboard)/help/content/admin.ts

import type { HelpContent } from './types';

export const adminContent: HelpContent = {
  quickStart: [
    {
      icon: '👥',
      title: '创建用户',
      description: '添加新用户并分配角色（管理员/优化师/客户）',
    },
    {
      icon: '🏢',
      title: '管理客户',
      description: '创建客户账户，关联用户，填写企业信息',
    },
    {
      icon: '💎',
      title: '配置配额',
      description: '创建配额包，为客户充值优化次数',
    },
    {
      icon: '📊',
      title: '监控工单',
      description: '查看全平台工单状态，必要时介入处理',
    },
  ],

  faq: [
    {
      question: '如何重置用户密码？',
      answer: '目前需要直接联系用户告知新密码，或通过后端系统重置。',
    },
    {
      question: '客户配额过期了怎么办？',
      answer: '过期配额无法恢复。需要重新购买配额包充值。',
    },
    {
      question: '如何处理客户投诉？',
      answer: '查看相关工单详情，如需要可亲自介入处理，与优化师沟通改进方案。',
    },
    {
      question: '可以批量创建用户吗？',
      answer: '目前需要逐个创建。批量创建功能可联系开发团队。',
    },
  ],

  guide: [
    {
      id: 'intro',
      title: '平台简介',
      content: `
        <p>作为平台管理员，您拥有系统的最高权限，负责：</p>
        <ul>
          <li>用户和权限管理</li>
          <li>客户账户管理</li>
          <li>项目配置</li>
          <li>配额包管理</li>
          <li>全局工单监控</li>
        </ul>
        <h3>权限范围</h3>
        <p>管理员可以访问所有功能和数据，包括其他用户的私密信息。请谨慎使用权限。</p>
      `,
    },
    {
      id: 'users',
      title: '用户管理',
      content: `
        <p>用户管理页面用于管理系统中的所有用户。</p>
        <h3>创建新用户</h3>
        <ol>
          <li>点击「新建用户」按钮</li>
          <li>填写用户信息：
            <ul>
              <li><strong>邮箱</strong>：用户登录邮箱</li>
              <li><strong>密码</strong>：初始密码</li>
              <li><strong>姓名</strong>：用户显示名称</li>
              <li><strong>角色</strong>：选择用户角色</li>
            </ul>
          </li>
          <li>点击「创建」按钮</li>
        </ol>
        <h3>用户角色说明</h3>
        <table>
          <thead>
            <tr><th>角色</th><th>权限范围</th></tr>
          </thead>
          <tbody>
            <tr><td>管理员 (admin)</td><td>全部权限，包括用户管理、系统配置</td></tr>
            <tr><td>优化师 (optimizer)</td><td>处理工单、查看工单池、优化内容</td></tr>
            <tr><td>客户 (customer)</td><td>提交工单、审核结果、查看配额</td></tr>
          </tbody>
        </table>
      `,
    },
    {
      id: 'customers',
      title: '客户管理',
      content: `
        <p>客户管理页面用于管理客户账户和企业信息。</p>
        <h3>创建客户</h3>
        <ol>
          <li>点击「新建客户」按钮</li>
          <li>选择关联用户（必须先创建用户）</li>
          <li>填写客户信息：
            <ul>
              <li><strong>公司名称</strong>：客户公司全称</li>
              <li><strong>联系电话</strong>（可选）</li>
              <li><strong>行业</strong>（可选）</li>
              <li><strong>备注</strong>（可选）</li>
            </ul>
          </li>
          <li>点击「创建」按钮</li>
        </ol>
        <h3>查看配额历史</h3>
        <p>在客户详情页可以查看：</p>
        <ul>
          <li>当前配额余额</li>
          <li>配额到期日期</li>
          <li>充值历史记录</li>
        </ul>
      `,
    },
    {
      id: 'projects',
      title: '项目管理',
      content: `
        <p>项目管理页面用于管理客户项目。</p>
        <h3>创建项目</h3>
        <ol>
          <li>点击「新建项目」按钮</li>
          <li>填写项目信息：
            <ul>
              <li><strong>客户</strong>：选择关联客户</li>
              <li><strong>项目名称</strong>：项目名称</li>
              <li><strong>描述</strong>（可选）：项目描述</li>
            </ul>
          </li>
          <li>填写企业信息（可选）：
            <ul>
              <li>企业名称、行业、规模</li>
              <li>目标受众、核心产品</li>
            </ul>
          </li>
          <li>填写竞争对手信息（可选）</li>
          <li>点击「创建」按钮</li>
        </ol>
        <p><em>企业信息和竞争对手信息有助于优化师更好地理解客户业务，提供更精准的优化服务。</em></p>
      `,
    },
    {
      id: 'quotas',
      title: '配额管理',
      content: `
        <p>配额管理页面用于管理配额包和客户充值。</p>
        <h3>创建配额包</h3>
        <ol>
          <li>点击「新建配额包」按钮</li>
          <li>填写配额包信息：
            <ul>
              <li><strong>套餐名称</strong>：如「基础版」「专业版」</li>
              <li><strong>文章数</strong>：包含的优化次数</li>
              <li><strong>价格</strong>：套餐价格</li>
              <li><strong>有效期</strong>：有效天数</li>
            </ul>
          </li>
          <li>点击「创建」按钮</li>
        </ol>
        <h3>客户充值</h3>
        <ol>
          <li>进入客户详情页</li>
          <li>点击「充值配额」</li>
          <li>选择配额包</li>
          <li>填写备注（可选）</li>
          <li>点击「确认充值」</li>
        </ol>
      `,
    },
    {
      id: 'tickets',
      title: '工单管理',
      content: `
        <p>管理员可以查看和管理全平台所有工单。</p>
        <h3>管理员工单权限</h3>
        <ul>
          <li>查看所有工单详情</li>
          <li>领取和处理任何工单</li>
          <li>监控工单处理进度</li>
          <li>在需要时介入处理</li>
        </ul>
        <h3>使用场景</h3>
        <ul>
          <li><strong>紧急工单</strong>：处理紧急或高优先级的工单</li>
          <li><strong>质量控制</strong>：抽查已完成的工单质量</li>
          <li><strong>工作量平衡</strong>：监控优化师工作量，必要时重新分配</li>
        </ul>
      `,
    },
  ],
};
