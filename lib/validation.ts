import { z } from 'zod';

/**
 * 登录表单验证
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(6, '密码至少 6 个字符')
    .max(100, '密码不能超过 100 个字符'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * 工单创建验证
 */
export const createTicketSchema = z.object({
  projectId: z.string().min(1, '请选择项目'),
  title: z.string()
    .min(1, '请输入标题')
    .max(200, '标题不能超过 200 字符'),
  content: z.string()
    .min(10, '内容至少 10 个字符')
    .max(10000, '内容不能超过 10000 字符'),
  sourceType: z.string().optional(),
  sourceFileUrl: z.string().url('无效的 URL').optional().or(z.literal('')),
  needReview: z.boolean().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

/**
 * 用户创建验证
 */
export const createUserSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(6, '密码至少 6 个字符')
    .max(100, '密码不能超过 100 个字符'),
  name: z.string()
    .min(1, '请输入姓名')
    .max(50, '姓名不能超过 50 字符'),
  role: z.enum(['admin', 'optimizer', 'customer'], '请选择有效的角色'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * 客户创建验证
 */
export const createCustomerSchema = z.object({
  userId: z.string().min(1, '请选择用户'),
  companyName: z.string()
    .min(1, '请输入公司名称')
    .max(100, '公司名称不能超过 100 字符'),
  contactPhone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码')
    .optional()
    .or(z.literal('')),
  industry: z.string().optional(),
  notes: z.string().max(500, '备注不能超过 500 字符').optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

/**
 * 项目创建验证
 */
export const createProjectSchema = z.object({
  customerId: z.string().min(1, '请选择客户'),
  name: z.string()
    .min(1, '请输入项目名称')
    .max(100, '项目名称不能超过 100 字符'),
  description: z.string().max(500, '描述不能超过 500 字符').optional(),
  enterpriseInfo: z.object({
    name: z.string().min(1, '请输入企业名称'),
    industry: z.string().optional(),
    scale: z.string().optional(),
    targetAudience: z.string().optional(),
    coreProducts: z.array(z.string()).optional(),
  }),
  competitorInfo: z.object({
    name: z.string().optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    strategies: z.array(z.string()).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * 配额包创建验证
 */
export const createQuotaPackageSchema = z.object({
  name: z.string()
    .min(1, '请输入套餐名称')
    .max(50, '套餐名称不能超过 50 字符'),
  articles: z.number()
    .int('文章数必须是整数')
    .min(1, '文章数至少为 1'),
  price: z.number()
    .min(0, '价格不能为负数'),
  validDays: z.number()
    .int('有效期天数必须是整数')
    .min(1, '有效期至少为 1 天'),
});

export type CreateQuotaPackageInput = z.infer<typeof createQuotaPackageSchema>;
