// CMS 共享配置

export const APP_NAME = 'CMS 内容管理系统';

export const APP_VERSION = '1.0.0';

export const API_VERSION = 'v1';

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// 文件上传配置
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  UPLOAD_DIR: './uploads',
} as const;

// JWT 配置
export const JWT = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
} as const;

// 缓存配置
export const CACHE = {
  TTL_SHORT: 60, // 1 分钟
  TTL_MEDIUM: 300, // 5 分钟
  TTL_LONG: 3600, // 1 小时
} as const;

// 文章状态
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// 评论状态
export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SPAM: 'spam',
} as const;

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  USER: 'user',
} as const;

// 环境变量验证
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`环境变量 ${key} 未设置`);
  }
  return value ?? defaultValue!;
}

export function getEnvInt(key: string, defaultValue?: number): number {
  const value = getEnv(key, defaultValue?.toString());
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`环境变量 ${key} 不是有效的整数`);
  }
  return parsed;
}

export function getEnvBool(key: string, defaultValue?: boolean): boolean {
  const value = getEnv(key, defaultValue?.toString());
  return value === 'true' || value === '1';
}

// 判断是否为生产环境
export const isProduction = process.env['NODE_ENV'] === 'production';
export const isDevelopment = process.env['NODE_ENV'] === 'development';
export const isTest = process.env['NODE_ENV'] === 'test';
