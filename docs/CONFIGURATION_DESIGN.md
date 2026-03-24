# CMS 系统可配置化设计方案

> 📅 创建时间: 2026-03-11
> 🎯 目标: 实现网站元素的高度可配置化，从后台直接管理

---

## 1. 可配置项总览

### 1.1 配置分类

```
┌─────────────────────────────────────────────────────────────┐
│                     系统配置中心                             │
├─────────────────────────────────────────────────────────────┤
│  📌 基本信息    │  🎨 视觉风格    │  📐 布局设置           │
│  - 网站名称     │  - 主题色       │  - 导航栏样式          │
│  - Logo        │  - 字体         │  - 侧边栏位置          │
│  - Favicon     │  - 圆角         │  - 页脚布局            │
│  - 描述        │  - 阴影         │  - 文章列表样式        │
│  - 关键词      │  - 动画         │  - 卡片样式            │
├─────────────────────────────────────────────────────────────┤
│  🔧 功能开关    │  🌐 SEO配置    │  📧 通知设置           │
│  - 评论系统    │  - Meta标签     │  - 邮件通知            │
│  - 搜索功能    │  - Sitemap     │  - 站内通知            │
│  - 社交分享    │  - Robots.txt  │  - 推送配置            │
│  - RSS订阅     │  - 结构化数据   │                        │
│  - 用户注册    │                │                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据库表设计

### 2.1 系统配置表 (system_configs)

```sql
CREATE TABLE system_configs (
    id SERIAL PRIMARY KEY,
    
    -- 配置分组和键
    config_group VARCHAR(50) NOT NULL,      -- 分组: basic, theme, layout, feature, seo, notification
    config_key VARCHAR(100) NOT NULL,       -- 配置键
    config_value JSONB NOT NULL,            -- 配置值（JSON格式）
    
    -- 元数据
    display_name VARCHAR(100) NOT NULL,     -- 显示名称
    description TEXT,                        -- 描述说明
    input_type VARCHAR(50) NOT NULL,        -- 输入类型: text, textarea, number, color, image, select, switch, json
    input_options JSONB,                     -- 输入选项（select的选项列表等）
    validation_rules JSONB,                  -- 验证规则
    
    -- 排序和状态
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(config_group, config_key)
);

-- 索引
CREATE INDEX idx_system_configs_group ON system_configs(config_group);
CREATE INDEX idx_system_configs_key ON system_configs(config_key);
```

### 2.2 导航菜单表 (menus)

```sql
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    
    -- 基本信息
    name VARCHAR(100) NOT NULL,             -- 菜单名称（内部标识）
    display_name VARCHAR(100) NOT NULL,     -- 显示名称
    location VARCHAR(50) NOT NULL,          -- 位置: header, footer, sidebar
    
    -- 菜单项（JSON数组）
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- items 结构示例:
    -- [
    --   {
    --     "id": "home",
    --     "label": "首页",
    --     "url": "/",
    --     "icon": "home",
    --     "target": "_self",
    --     "children": []
    --   }
    -- ]
    
    -- 状态
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menus_location ON menus(location);
```

### 2.3 主题配置表 (themes)

```sql
CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    
    -- 主题信息
    name VARCHAR(100) UNIQUE NOT NULL,      -- 主题标识
    display_name VARCHAR(100) NOT NULL,     -- 显示名称
    description TEXT,                        -- 主题描述
    preview_image VARCHAR(255),              -- 预览图
    
    -- 主题配置（CSS变量）
    config JSONB NOT NULL DEFAULT '{
        "colors": {},
        "typography": {},
        "spacing": {},
        "borderRadius": {},
        "shadows": {},
        "animations": {}
    }'::jsonb,
    
    -- 是否为当前激活主题
    is_active BOOLEAN DEFAULT false,
    is_builtin BOOLEAN DEFAULT false,       -- 是否内置主题
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 页面布局表 (page_layouts)

```sql
CREATE TABLE page_layouts (
    id SERIAL PRIMARY KEY,
    
    -- 页面信息
    page_type VARCHAR(50) NOT NULL,         -- 页面类型: home, article, category, tag, search, author
    page_name VARCHAR(100) NOT NULL,        -- 页面名称
    
    -- 布局配置
    layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- 示例结构:
    -- {
    --   "container": "max-w-7xl",          // 容器宽度
    --   "sidebar": {
    --     "enabled": true,
    --     "position": "right",             // left, right, none
    --     "width": "300px",
    --     "widgets": ["categories", "tags", "recent"]
    --   },
    --   "content": {
    --     "width": "full",                 // full, contained
    --     "padding": "2rem"
    --   }
    -- }
    
    -- 组件配置
    components JSONB DEFAULT '[]'::jsonb,
    -- 页面组件列表，可排序、开关
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(page_type)
);
```

### 2.5 小部件表 (widgets)

```sql
CREATE TABLE widgets (
    id SERIAL PRIMARY KEY,
    
    -- 小部件信息
    name VARCHAR(100) UNIQUE NOT NULL,      -- 标识
    display_name VARCHAR(100) NOT NULL,     -- 显示名称
    widget_type VARCHAR(50) NOT NULL,       -- 类型: recent_posts, categories, tags, search, custom_html, etc.
    
    -- 配置
    config JSONB DEFAULT '{}'::jsonb,
    -- 不同类型小部件有不同的配置项
    
    -- 显示设置
    show_title BOOLEAN DEFAULT true,
    custom_class VARCHAR(255),              -- 自定义CSS类
    
    -- 位置和排序
    location VARCHAR(50) DEFAULT 'sidebar', // sidebar, footer, header, custom
    sort_order INTEGER DEFAULT 0,
    
    -- 可见性规则
    visibility_rules JSONB DEFAULT '{}'::jsonb,
    -- {
    --   "show_on_pages": ["home", "category"],
    --   "hide_on_pages": [],
    //   "user_roles": ["all"]              // all, guest, member, admin
    // }
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. 配置项详细设计

### 3.1 基本信息配置 (config_group: 'basic')

| config_key | display_name | input_type | 默认值 | 说明 |
|------------|-------------|------------|--------|------|
| site_name | 网站名称 | text | "我的博客" | 顶部显示的网站名称 |
| site_logo | 网站 Logo | image | null | Logo图片URL |
| site_favicon | 网站图标 | image | null | Favicon URL |
| site_description | 网站描述 | textarea | "" | SEO描述 |
| site_keywords | 网站关键词 | text | "" | SEO关键词，逗号分隔 |
| site_author | 网站作者 | text | "" | 作者名称 |
| site_email | 联系邮箱 | text | "" | 联系邮箱 |
| site_url | 网站地址 | text | "" | 网站完整URL |
| icp_number | ICP备案号 | text | "" | 备案号 |
| copyright_text | 版权信息 | text | "" | 页脚版权文字 |

### 3.2 视觉风格配置 (config_group: 'theme')

#### 3.2.1 颜色配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| primary_color | 主色调 | color | "#F97316" |
| secondary_color | 次要色 | color | "#6366F1" |
| accent_color | 强调色 | color | "#EC4899" |
| background_color | 背景色 | color | "#FFFFFF" |
| text_color | 文字颜色 | color | "#1F2937" |
| text_secondary | 次要文字 | color | "#6B7280" |
| border_color | 边框颜色 | color | "#E5E7EB" |
| success_color | 成功色 | color | "#10B981" |
| warning_color | 警告色 | color | "#F59E0B" |
| error_color | 错误色 | color | "#EF4444" |

#### 3.2.2 字体配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| font_family | 主字体 | select | "Inter" |
| font_family_mono | 代码字体 | select | "JetBrains Mono" |
| font_size_base | 基础字号 | number | 16 |
| font_weight_base | 基础字重 | select | 400 |
| line_height | 行高 | number | 1.6 |

#### 3.2.3 样式配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| border_radius | 圆角大小 | select | "0.5rem" |
| shadow_style | 阴影风格 | select | "medium" |
| card_style | 卡片风格 | select | "glass" |
| button_style | 按钮风格 | select | "rounded" |
| animation_enabled | 启用动画 | switch | true |
| animation_duration | 动画时长 | number | 300 |

### 3.3 布局配置 (config_group: 'layout')

#### 3.3.1 导航栏配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| navbar_style | 导航栏样式 | select | "fixed" |
| navbar_background | 导航栏背景 | select | "glass" |
| navbar_height | 导航栏高度 | number | 64 |
| navbar_logo_position | Logo位置 | select | "left" |
| navbar_menu_position | 菜单位置 | select | "center" |
| navbar_show_search | 显示搜索 | switch | true |
| navbar_show_theme_toggle | 显示主题切换 | switch | true |

#### 3.3.2 侧边栏配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| sidebar_enabled | 启用侧边栏 | switch | true |
| sidebar_position | 侧边栏位置 | select | "right" |
| sidebar_width | 侧边栏宽度 | number | 300 |
| sidebar_sticky | 侧边栏固定 | switch | true |
| sidebar_widgets | 侧边栏组件 | multi-select | ["categories", "tags"] |

#### 3.3.3 页脚配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| footer_columns | 页脚列数 | number | 4 |
| footer_show_social | 显示社交图标 | switch | true |
| footer_show_links | 显示链接 | switch | true |
| footer_show_copyright | 显示版权 | switch | true |

#### 3.3.4 文章列表配置

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| article_list_style | 列表样式 | select | "card" |
| article_list_columns | 列数 | number | 3 |
| article_card_show_excerpt | 显示摘要 | switch | true |
| article_card_show_author | 显示作者 | switch | true |
| article_card_show_date | 显示日期 | switch | true |
| article_card_show_category | 显示分类 | switch | true |
| article_card_show_thumbnail | 显示缩略图 | switch | true |
| article_card_image_ratio | 图片比例 | select | "16/9" |

### 3.4 功能开关 (config_group: 'feature')

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| feature_comments | 评论系统 | switch | true |
| feature_search | 搜索功能 | switch | true |
| feature_share | 社交分享 | switch | true |
| feature_rss | RSS订阅 | switch | true |
| feature_register | 用户注册 | switch | true |
| feature_dark_mode | 深色模式 | switch | true |
| feature_reading_progress | 阅读进度条 | switch | true |
| feature_back_to_top | 返回顶部 | switch | true |
| feature_table_of_contents | 文章目录 | switch | true |
| feature_related_posts | 相关文章 | switch | true |
| feature_like | 点赞功能 | switch | true |
| feature_bookmark | 收藏功能 | switch | true |

### 3.5 SEO配置 (config_group: 'seo')

| config_key | display_name | input_type | 默认值 |
|------------|-------------|------------|--------|
| seo_title_template | 标题模板 | text | "{title} - {site_name}" |
| seo_og_image | 默认分享图 | image | null |
| seo_twitter_card | Twitter卡片类型 | select | "summary_large_image" |
| seo_sitemap_enabled | 启用Sitemap | switch | true |
| seo_robots_txt | Robots.txt | textarea | "User-agent: *\nAllow: /" |
| seo_google_verification | Google验证 | text | "" |
| seo_baidu_verification | 百度验证 | text | "" |

### 3.6 社交链接配置 (config_group: 'social')

| config_key | display_name | input_type |
|------------|-------------|------------|
| social_github | GitHub | text |
| social_twitter | Twitter | text |
| social_weibo | 微博 | text |
| social_wechat | 微信 | image |
| social_zhihu | 知乎 | text |
| social_bilibili | B站 | text |
| social_email | 邮箱 | text |
| social_rss | RSS | text |

---

## 4. 后台管理界面设计

### 4.1 配置管理页面结构

```
/ admin/settings
├── /basic          # 基本信息
├── /theme          # 主题设置
│   ├── /colors     # 颜色配置
│   ├── /typography # 字体配置
│   └── /styles     # 样式配置
├── /layout         # 布局设置
│   ├── /navbar     # 导航栏
│   ├── /sidebar    # 侧边栏
│   ├── /footer     # 页脚
│   └── /pages      # 页面布局
├── /features       # 功能开关
├── /seo            # SEO设置
├── /social         # 社交链接
└── /menus          # 菜单管理
```

### 4.2 配置项组件设计

```tsx
// 配置项渲染组件
const ConfigItem = ({ config }) => {
  const renderInput = () => {
    switch (config.input_type) {
      case 'text':
        return <TextInput config={config} />;
      case 'textarea':
        return <TextareaInput config={config} />;
      case 'number':
        return <NumberInput config={config} />;
      case 'color':
        return <ColorPicker config={config} />;
      case 'image':
        return <ImageUploader config={config} />;
      case 'select':
        return <SelectInput config={config} />;
      case 'switch':
        return <SwitchInput config={config} />;
      case 'multi-select':
        return <MultiSelectInput config={config} />;
      case 'json':
        return <JsonEditor config={config} />;
    }
  };

  return (
    <div className="config-item">
      <div className="config-label">
        <Label>{config.display_name}</Label>
        {config.description && (
          <Description>{config.description}</Description>
        )}
      </div>
      <div className="config-input">
        {renderInput()}
      </div>
    </div>
  );
};
```

### 4.3 主题预览功能

```tsx
// 实时预览组件
const ThemePreview = () => {
  const { config } = useThemeConfig();
  
  return (
    <div className="theme-preview">
      {/* 模拟预览 */}
      <div 
        className="preview-navbar"
        style={{
          backgroundColor: config.navbar_background === 'glass' 
            ? `${config.primary_color}20`
            : config.primary_color,
          backdropFilter: config.navbar_background === 'glass' 
            ? 'blur(10px)' 
            : 'none'
        }}
      >
        <Logo src={config.site_logo} />
        <Menu items={config.nav_menu} />
      </div>
      
      <div className="preview-content">
        <ArticleCard style={{
          borderRadius: config.border_radius,
          boxShadow: config.shadow_style
        }} />
      </div>
      
      {/* CSS变量输出 */}
      <style>{`
        :root {
          --primary: ${config.primary_color};
          --secondary: ${config.secondary_color};
          --background: ${config.background_color};
          --text: ${config.text_color};
          --radius: ${config.border_radius};
        }
      `}</style>
    </div>
  );
};
```

---

## 5. 前端配置加载机制

### 5.1 配置上下文

```tsx
// ConfigProvider.tsx
interface SiteConfig {
  basic: BasicConfig;
  theme: ThemeConfig;
  layout: LayoutConfig;
  features: FeatureConfig;
  seo: SEOConfig;
  social: SocialConfig;
}

const ConfigContext = createContext<SiteConfig | null>(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  
  useEffect(() => {
    // 从API加载配置
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig);
  }, []);
  
  // 生成CSS变量
  const cssVariables = useMemo(() => {
    if (!config) return '';
    
    return Object.entries(config.theme.colors)
      .map(([key, value]) => `--${key}: ${value};`)
      .join('\n');
  }, [config]);
  
  return (
    <ConfigContext.Provider value={config}>
      <style>{`:root { ${cssVariables} }`}</style>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
```

### 5.2 配置缓存策略

```typescript
// 配置缓存中间件
export const configCacheMiddleware = async (req, res, next) => {
  const cacheKey = 'site:config';
  
  // 1. 尝试从Redis获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    res.locals.config = JSON.parse(cached);
    return next();
  }
  
  // 2. 从数据库获取
  const configs = await db.systemConfigs.findAll({
    where: { is_active: true }
  });
  
  // 3. 转换为结构化配置
  const config = groupConfigs(configs);
  
  // 4. 缓存5分钟
  await redis.set(cacheKey, JSON.stringify(config), 'EX', 300);
  
  res.locals.config = config;
  next();
};
```

---

## 6. 预设主题方案

### 6.1 内置主题

| 主题名称 | 描述 | 特点 |
|---------|------|------|
| **default** | 默认橙色主题 | 活力、现代 |
| **ocean** | 海洋蓝主题 | 清爽、专业 |
| **forest** | 森林绿主题 | 自然、清新 |
| **sunset** | 日落红主题 | 温暖、热情 |
| **midnight** | 深夜紫主题 | 神秘、优雅 |
| **minimal** | 极简白主题 | 简洁、专注 |

### 6.2 主题配置示例

```json
{
  "name": "ocean",
  "display_name": "海洋蓝",
  "config": {
    "colors": {
      "primary": "#0EA5E9",
      "secondary": "#06B6D4",
      "accent": "#8B5CF6",
      "background": "#F0F9FF",
      "text": "#0F172A"
    },
    "typography": {
      "font_family": "Inter",
      "font_size_base": 16
    },
    "styles": {
      "border_radius": "0.75rem",
      "shadow_style": "soft",
      "card_style": "glass"
    }
  }
}
```

---

## 7. 实施优先级

### P0 - 核心配置（必须实现）

1. **基本信息配置**
   - 网站名称、Logo、Favicon
   - 网站描述、关键词

2. **主题颜色配置**
   - 主色调、次要色
   - 背景色、文字色

3. **布局配置**
   - 导航栏样式
   - 侧边栏开关
   - 文章列表样式

4. **功能开关**
   - 评论、搜索、分享
   - RSS、用户注册

### P1 - 重要配置

5. **SEO配置**
   - Meta标签模板
   - Sitemap设置

6. **社交链接**
   - 主要社交平台链接

7. **菜单管理**
   - 导航菜单自定义

### P2 - 高级配置

8. **页面布局编辑器**
   - 拖拽式布局编辑

9. **主题导入导出**
   - 主题JSON导入导出

10. **自定义CSS/JS**
    - 高级用户自定义

---

## 8. API设计

### 8.1 获取配置

```
GET /api/config
GET /api/config/:group
GET /api/config/:group/:key
```

### 8.2 更新配置

```
PUT /api/admin/config/:group/:key
POST /api/admin/config/batch
```

### 8.3 主题管理

```
GET /api/themes
POST /api/admin/themes
PUT /api/admin/themes/:id/activate
DELETE /api/admin/themes/:id
```

### 8.4 菜单管理

```
GET /api/menus/:location
POST /api/admin/menus
PUT /api/admin/menus/:id
DELETE /api/admin/menus/:id
```

---

## 9. 数据迁移

### 9.1 初始化配置数据

```typescript
// seeds/configs.ts
export const initialConfigs = [
  // 基本信息
  {
    config_group: 'basic',
    config_key: 'site_name',
    display_name: '网站名称',
    input_type: 'text',
    config_value: '我的博客',
    sort_order: 1
  },
  {
    config_group: 'basic',
    config_key: 'site_logo',
    display_name: '网站Logo',
    input_type: 'image',
    config_value: null,
    sort_order: 2
  },
  // ... 更多配置
];
```

---

**文档版本**: 1.0  
**创建时间**: 2026-03-11  
**维护者**: 开发团队
