/**
 * 类型定义测试文件
 * 用于验证类型定义的正确性
 */

import {
  type User,
  type Article,
  ContentStatus,
  type SystemConfig,
  type Theme,
  type Menu,
  type Widget,
  type ApiResponse,
  type PaginatedResponse,
  type CreateInput,
  type UpdateInput,
  ConfigInputType,
  MenuLocation,
  WidgetType,
} from './index';

// 测试用户类型
const user: User = {
  id: 1,
  username: 'test',
  email: 'test@example.com',
  passwordHash: 'hash',
  isActive: true,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 测试文章类型
const article: Article = {
  id: 1,
  title: '测试文章',
  slug: 'test-article',
  status: ContentStatus.PUBLISHED,
  content: { body: '内容' },
  metadata: {},
  authorId: 1,
  categoryId: 1,
  tags: [1, 2],
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 测试创建输入类型
const createInput: CreateInput<Article> = {
  title: '新文章',
  slug: 'new-article',
  status: ContentStatus.DRAFT,
  content: {},
  metadata: {},
  authorId: 1,
  categoryId: 1,
  tags: [],
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
};

// 测试更新输入类型
const updateInput: UpdateInput<Article> = {
  title: '更新标题',
};

// 测试 API 响应类型
const response: ApiResponse<Article> = {
  success: true,
  data: article,
  meta: {
    timestamp: new Date(),
  },
};

// 测试分页响应类型
const paginatedResponse: PaginatedResponse<Article> = {
  success: true,
  data: [article],
  meta: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
    timestamp: new Date(),
  },
};

// 测试系统配置类型
const config: SystemConfig = {
  id: 1,
  configGroup: 'basic',
  configKey: 'site_name',
  configValue: '测试网站',
  displayName: '网站名称',
  inputType: ConfigInputType.TEXT,
  sortOrder: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 测试主题类型
const theme: Theme = {
  id: 1,
  name: 'default',
  displayName: '默认主题',
  config: {
    colors: {
      primary: '#F97316',
      secondary: '#6366F1',
      accent: '#EC4899',
      background: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      fontFamily: 'Inter',
      fontFamilyMono: 'JetBrains Mono',
      fontSizeBase: 16,
      fontWeightBase: 400,
      lineHeight: 1.6,
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
    },
  },
  isActive: true,
  isBuiltin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 测试菜单类型
const menu: Menu = {
  id: 1,
  name: 'main-nav',
  displayName: '主导航',
  location: MenuLocation.HEADER,
  items: [
    {
      id: 'home',
      label: '首页',
      url: '/',
      icon: 'home',
    },
    {
      id: 'about',
      label: '关于',
      url: '/about',
      children: [
        {
          id: 'team',
          label: '团队',
          url: '/about/team',
        },
      ],
    },
  ],
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 测试小部件类型
const widget: Widget = {
  id: 1,
  name: 'recent-posts',
  displayName: '最新文章',
  widgetType: WidgetType.RECENT_POSTS,
  config: {
    limit: 5,
    showExcerpt: true,
  },
  showTitle: true,
  location: 'sidebar',
  sortOrder: 1,
  visibilityRules: {
    showOnPages: ['home', 'category'],
    userRoles: ['all'],
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('类型测试通过！');
