# CMS 系统设计系统

> 📅 创建时间: 2026-03-11
> 🎨 设计理念: 现代、简约、可配置
> 📐 布局系统: 响应式、模块化

---

## 1. 设计理念

### 1.1 核心原则

```
┌─────────────────────────────────────────────────────────────┐
│                        设计原则                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✨ 简约        │  🎯 清晰        │  ⚡ 高效        │  🔧 可配  │
│  少即是多       │  信息层级清晰   │  快速加载      │  灵活定制  │
│  去除冗余       │  易于理解      │  流畅交互      │  主题切换  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ♿ 可访问      │  📱 响应式      │  🎭 一致性     │  🌙 深色  │
│  WCAG 2.1 AA   │  移动端优先     │  统一组件库    │  深色模式  │
│  键盘导航      │  自适应布局     │  设计语言      │  护眼模式  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 视觉风格

| 风格 | 描述 | 使用场景 |
|------|------|----------|
| **Glassmorphism** | 毛玻璃效果 | 导航栏、卡片、弹窗 |
| **Neumorphism** | 新拟物（轻量） | 按钮、输入框 |
| **Flat** | 扁平化 | 图标、标签 |
| **Gradient** | 渐变（克制） | 强调元素、背景 |

---

## 2. 色彩系统

### 2.1 语义色彩

```css
:root {
  /* ===== 品牌色 ===== */
  --color-primary-50: #FFF7ED;
  --color-primary-100: #FFEDD5;
  --color-primary-200: #FED7AA;
  --color-primary-300: #FDBA74;
  --color-primary-400: #FB923C;
  --color-primary-500: #F97316;  /* 主色 */
  --color-primary-600: #EA580C;
  --color-primary-700: #C2410C;
  --color-primary-800: #9A3412;
  --color-primary-900: #7C2D12;

  /* ===== 中性色 ===== */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* ===== 功能色 ===== */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* ===== 语义映射 ===== */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-tertiary: #F3F4F6;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;
}

/* 深色模式 */
.dark {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1F2937;
  --color-bg-tertiary: #374151;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-text-tertiary: #9CA3AF;
  --color-border: #374151;
  --color-border-light: #1F2937;
}
```

### 2.2 渐变色板

```css
:root {
  /* 品牌渐变 */
  --gradient-primary: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  --gradient-secondary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  --gradient-accent: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
  
  /* 背景渐变 */
  --gradient-bg-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-bg-subtle: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
  
  /* 玻璃效果 */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: blur(20px);
}

.dark {
  --glass-bg: rgba(17, 24, 39, 0.7);
  --glass-border: rgba(55, 65, 81, 0.3);
}
```

---

## 3. 字体系统

### 3.1 字体家族

```css
:root {
  /* 主字体 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* 等宽字体（代码） */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  /* 标题字体（可选） */
  --font-display: 'Inter', var(--font-sans);
  
  /* 中文衬线（可选） */
  --font-serif: 'Noto Serif SC', 'Source Han Serif SC', serif;
}
```

### 3.2 字体大小

```css
:root {
  /* 使用 Tailwind 默认 + 扩展 */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  
  /* 文章正文 */
  --text-article: 1.125rem; /* 18px */
  --text-article-lg: 1.25rem; /* 20px */
}

/* 文章排版 */
.article-content {
  font-size: var(--text-article);
  line-height: 1.8;
  letter-spacing: 0.01em;
}

.article-content p {
  margin-bottom: 1.5em;
}
```

### 3.3 字重

```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

---

## 4. 间距系统

### 4.1 基础间距

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### 4.2 组件间距

```css
/* 卡片内边距 */
.card-padding-sm { padding: var(--space-4); }   /* 16px */
.card-padding-md { padding: var(--space-6); }   /* 24px */
.card-padding-lg { padding: var(--space-8); }   /* 32px */

/* 区块间距 */
.section-gap-sm { margin-bottom: var(--space-8); }   /* 32px */
.section-gap-md { margin-bottom: var(--space-12); }  /* 48px */
.section-gap-lg { margin-bottom: var(--space-16); }  /* 64px */
```

---

## 5. 圆角系统

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-base: 0.5rem;   /* 8px */
  --radius-md: 0.75rem;    /* 12px */
  --radius-lg: 1rem;       /* 16px */
  --radius-xl: 1.5rem;     /* 24px */
  --radius-2xl: 2rem;      /* 32px */
  --radius-full: 9999px;
}

/* 使用场景 */
.input-radius { border-radius: var(--radius-base); }
.card-radius { border-radius: var(--radius-lg); }
.modal-radius { border-radius: var(--radius-xl); }
.button-radius { border-radius: var(--radius-base); }
.avatar-radius { border-radius: var(--radius-full); }
```

---

## 6. 阴影系统

```css
:root {
  /* 基础阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
               0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
               0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
               0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* 内阴影 */
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  
  /* 品牌色阴影 */
  --shadow-primary: 0 4px 15px rgba(249, 115, 22, 0.4);
  --shadow-success: 0 4px 15px rgba(16, 185, 129, 0.3);
  --shadow-error: 0 4px 15px rgba(239, 68, 68, 0.3);
  
  /* 玻璃阴影（深色背景用） */
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark {
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## 7. 动画系统

### 7.1 过渡时长

```css
:root {
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}

/* 使用场景 */
.transition-fast { transition: all var(--duration-fast) ease; }
.transition-base { transition: all var(--duration-base) ease; }
.transition-slow { transition: all var(--duration-slow) ease; }
```

### 7.2 缓动函数

```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 7.3 常用动画

```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 从下向上滑入 */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* 从左滑入 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 缩放 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 脉冲 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 弹跳 */
@keyframes bounce {
  0%, 100% { 
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* 闪烁（骨架屏） */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## 8. 布局系统

### 8.1 容器宽度

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
  --container-prose: 768px; /* 文章内容最大宽度 */
}

.container {
  width: 100%;
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container { padding-left: var(--space-6); padding-right: var(--space-6); }
}

@media (min-width: 1024px) {
  .container { padding-left: var(--space-8); padding-right: var(--space-8); }
}
```

### 8.2 栅格系统

```css
/* 12列栅格 */
.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

/* 栅格间距 */
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

/* 文章布局：主内容 + 侧边栏 */
.layout-article {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-8);
}

@media (max-width: 1023px) {
  .layout-article {
    grid-template-columns: 1fr;
  }
}
```

### 8.3 响应式断点

```css
/* 移动端优先 */
/* xs: 0 - 479px (默认) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */

/* Tailwind配置 */
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

---

## 9. 页面布局模板

### 9.1 前台页面布局

#### 首页布局

```
┌─────────────────────────────────────────────────────────────┐
│                       导航栏 (固定)                          │
│  [Logo]     [首页] [分类] [标签] [关于]     [搜索] [主题]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────┬──────────────────┐    │
│  │                                 │                   │    │
│  │      文章列表                    │    侧边栏        │    │
│  │      ┌────┐ ┌────┐ ┌────┐      │    ┌────────┐    │    │
│  │      │卡片│ │卡片│ │卡片│      │    │分类    │    │    │
│  │      └────┘ └────┘ └────┘      │    ├────────┤    │    │
│  │      ┌────┐ ┌────┐ ┌────┐      │    │标签云  │    │    │
│  │      │卡片│ │卡片│ │卡片│      │    ├────────┤    │    │
│  │      └────┘ └────┘ └────┘      │    │最新文章│    │    │
│  │                                 │    └────────┘    │    │
│  │      [加载更多]                  │                   │    │
│  │                                 │                   │    │
│  └─────────────────────────────────┴──────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                       页脚                                   │
│  [关于] [链接] [社交]            © 2024 版权信息            │
└─────────────────────────────────────────────────────────────┘
```

#### 文章详情布局

```
┌─────────────────────────────────────────────────────────────┐
│                       导航栏                                 │
├─────────────────────────────────────────────────────────────┤
│  [阅读进度条 █████████░░░░░░░░░░░░░░░░░░░░░░ 40%]           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────┬──────────────────┐    │
│  │                                 │                   │    │
│  │   文章标题                      │    目录导航      │    │
│  │   作者 · 日期 · 分类            │    ├─ 简介       │    │
│  │   ─────────────                 │    ├─ 安装       │    │
│  │                                 │    ├─ 配置       │    │
│  │   文章内容...                   │    └─ 总结       │    │
│  │                                 │                   │    │
│  │   # 标题                        │    ┌────────┐    │    │
│  │   正文内容...                   │    │作者卡片│    │    │
│  │                                 │    ├────────┤    │    │
│  │   ## 小标题                     │    │相关文章│    │    │
│  │   更多内容...                   │    └────────┘    │    │
│  │                                 │                   │    │
│  │   [点赞] [收藏] [分享]          │                   │    │
│  │                                 │                   │    │
│  │   ── 评论区 ──                  │                   │    │
│  │                                 │                   │    │
│  └─────────────────────────────────┴──────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                       页脚                                   │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 后台页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] CMS后台                         [通知] [用户头像▼]  │
├────────────┬────────────────────────────────────────────────┤
│            │                                                 │
│   导航     │              内容区域                          │
│   ├─仪表盘 │                                                 │
│   ├─文章   │   ┌────────────────────────────────────────┐  │
│   │ ├─全部 │   │  页面标题                              │  │
│   │ ├─写文章│   │  [面包屑导航]                          │  │
│   │ └─分类 │   ├────────────────────────────────────────┤  │
│   ├─媒体   │   │                                        │  │
│   ├─用户   │   │  主要内容...                           │  │
│   ├─评论   │   │                                        │  │
│   └─设置   │   │                                        │  │
│            │   │                                        │  │
│            │   │                                        │  │
│            │   └────────────────────────────────────────┘  │
│            │                                                 │
├────────────┴────────────────────────────────────────────────┤
│  CMS © 2024                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. 组件库规范

### 10.1 核心组件列表

| 组件 | 说明 | 状态 |
|------|------|------|
| Button | 按钮 | 必须 |
| Input | 输入框 | 必须 |
| Select | 下拉选择 | 必须 |
| Switch | 开关 | 必须 |
| Card | 卡片 | 必须 |
| Modal | 弹窗 | 必须 |
| Toast | 提示 | 必须 |
| Dropdown | 下拉菜单 | 必须 |
| Tabs | 标签页 | 必须 |
| Table | 表格 | 必须 |
| Pagination | 分页 | 必须 |
| Skeleton | 骨架屏 | 必须 |
| Empty | 空状态 | 必须 |
| Loading | 加载中 | 必须 |

### 10.2 组件设计原则

```tsx
// 组件Props规范
interface ComponentProps {
  // 1. 核心属性
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  
  // 2. 变体属性
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  
  // 3. 状态属性
  disabled?: boolean;
  loading?: boolean;
  
  // 4. 事件属性
  onClick?: () => void;
  onChange?: (value: any) => void;
  
  // 5. 可访问性
  'aria-label'?: string;
  role?: string;
}
```

---

## 11. 图标系统

### 11.1 图标库

使用 **Lucide React** 作为主要图标库

```tsx
import { 
  Home, Search, User, Settings, 
  Menu, X, ChevronRight, ChevronDown,
  Sun, Moon, Heart, Bookmark, Share2,
  Calendar, Clock, Tag, Folder,
  Edit, Trash2, Plus, Check
} from 'lucide-react';
```

### 11.2 图标规范

```css
/* 图标大小 */
.icon-xs { width: 0.75rem; height: 0.75rem; }  /* 12px */
.icon-sm { width: 1rem; height: 1rem; }        /* 16px */
.icon-md { width: 1.25rem; height: 1.25rem; }  /* 20px */
.icon-lg { width: 1.5rem; height: 1.5rem; }    /* 24px */
.icon-xl { width: 2rem; height: 2rem; }        /* 32px */
```

---

## 12. 表单设计规范

### 12.1 表单布局

```tsx
// 水平布局（后台常用）
<Form horizontal>
  <FormItem label="网站名称">
    <Input />
  </FormItem>
</Form>

// 垂直布局（前台常用）
<Form vertical>
  <FormItem label="邮箱">
    <Input type="email" />
  </FormItem>
  <FormItem label="密码">
    <Input type="password" />
  </FormItem>
</Form>
```

### 12.2 表单验证

```tsx
// 实时验证 + 提交验证
const FormInput = ({ name, rules }) => {
  const [error, setError] = useState('');
  
  const validate = (value) => {
    for (const rule of rules) {
      if (!rule.test(value)) {
        setError(rule.message);
        return false;
      }
    }
    setError('');
    return true;
  };
  
  return (
    <div className="form-item">
      <input 
        onBlur={(e) => validate(e.target.value)}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};
```

---

## 13. 深色模式实现

### 13.1 切换机制

```tsx
// ThemeProvider.tsx
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // 读取系统偏好或用户设置
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setTheme(saved || (prefersDark ? 'dark' : 'light'));
  }, []);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 13.2 CSS变量切换

```css
/* 所有颜色使用CSS变量 */
.component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

/* 深色模式自动生效 */
.dark .component {
  /* 变量已切换，无需额外样式 */
}
```

---

## 14. 性能优化

### 14.1 CSS优化

- 使用 **CSS变量** 实现主题切换，避免重复样式
- **TailwindCSS** 自动清除未使用的样式
- 关键CSS内联，非关键CSS异步加载

### 14.2 动画优化

```css
/* 使用 transform 和 opacity 触发GPU加速 */
.animate-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform;
}

/* 避免动画影响布局 */
.animate-card:hover {
  transform: translateY(-4px); /* 而非 margin-top */
}
```

---

## 15. 可访问性清单

- [ ] 所有图片有 alt 属性
- [ ] 表单元素有 label 关联
- [ ] 按钮有 aria-label
- [ ] 键盘可导航
- [ ] 焦点可见
- [ ] 颜色对比度 >= 4.5:1
- [ ] 字号可缩放
- [ ] 屏幕阅读器友好

---

**文档版本**: 1.0  
**创建时间**: 2026-03-11  
**维护者**: 开发团队

_此设计系统将随项目发展持续更新。_
