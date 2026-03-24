/**
 * CMS 系统共享类型定义
 *
 * 该文件包含系统中所有共享的 TypeScript 类型定义
 * 使用 TypeScript 5.x 特性，启用 strict mode
 *
 * @version 1.0.0
 * @created 2026-03-11
 */
/**
 * 可选属性的递归类型
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * 时间戳类型
 */
export type Timestamp = Date | string | number;
/**
 * 文章状态
 */
export declare enum ArticleStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
/**
 * 内容状态
 */
export declare enum ContentStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    DELETED = "deleted"
}
/**
 * 评论状态
 */
export declare enum CommentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    SPAM = "spam",
    TRASH = "trash"
}
/**
 * 媒体类型（基于 MIME 类型分类）
 */
export type MediaTypeValue = 'image' | 'video' | 'audio' | 'document' | 'other';
/**
 * 配置输入类型
 */
export declare enum ConfigInputType {
    TEXT = "text",
    TEXTAREA = "textarea",
    NUMBER = "number",
    COLOR = "color",
    IMAGE = "image",
    SELECT = "select",
    MULTI_SELECT = "multi-select",
    SWITCH = "switch",
    JSON = "json"
}
/**
 * 菜单位置
 */
export declare enum MenuLocation {
    HEADER = "header",
    FOOTER = "footer",
    SIDEBAR = "sidebar",
    CUSTOM = "custom"
}
/**
 * 小部件类型
 */
export declare enum WidgetType {
    RECENT_POSTS = "recent_posts",
    CATEGORIES = "categories",
    TAGS = "tags",
    SEARCH = "search",
    CUSTOM_HTML = "custom_html",
    ARCHIVE = "archive",
    SOCIAL_LINKS = "social_links",
    NEWSLETTER = "newsletter"
}
/**
 * 用户基本信息
 */
export interface User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
    isActive: boolean;
    metadata: Record<string, any>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt?: Timestamp;
}
/**
 * 角色信息
 */
export interface Role {
    id: number;
    name: string;
    description?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 权限信息
 */
export interface Permission {
    id: number;
    name: string;
    description?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 用户角色关联
 */
export interface UserRole {
    userId: number;
    roleId: number;
}
/**
 * 角色权限关联
 */
export interface RolePermission {
    roleId: number;
    permissionId: number;
}
/**
 * 用户完整信息（包含角色和权限）
 */
export interface UserWithRoles extends User {
    roles: Role[];
    permissions: Permission[];
}
/**
 * 内容基本信息
 */
export interface Content {
    id: number;
    title: string;
    slug: string;
    status: ContentStatus;
    content: Record<string, any>;
    metadata: Record<string, any>;
    authorId: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
    deletedAt?: Timestamp;
}
/**
 * 内容版本信息
 */
export interface ContentVersion {
    id: number;
    contentId: number;
    version: number;
    title: string;
    content: Record<string, any>;
    metadata: Record<string, any>;
    authorId: number;
    createdAt: Timestamp;
    isCurrent: boolean;
    description?: string;
}
/**
 * 内容自定义字段
 */
export interface ContentField {
    id: number;
    contentId: number;
    fieldName: string;
    fieldType: string;
    fieldValue?: string;
    fieldData: Record<string, any>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 文章信息（内容的一种具体形式）
 */
export interface Article extends Content {
    excerpt?: string;
    coverImage?: string;
    categoryId?: number;
    tags: number[];
    viewCount: number;
    likeCount: number;
    commentCount: number;
}
/**
 * 分类信息
 */
export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parentId?: number;
    sortOrder: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 标签信息
 */
export interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 文章标签关联
 */
export interface ArticleTag {
    articleId: number;
    tagId: number;
}
/**
 * 评论信息
 */
export interface Comment {
    id: number;
    content: string;
    postId: number;
    authorId: number;
    parentId?: number;
    status: CommentStatus;
    authorName?: string;
    authorEmail?: string;
    authorIp?: string;
    userAgent?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 媒体文件信息
 */
export interface Media {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    thumbnailPath?: string;
    metadata: MediaMetadata;
    uploaderId: number;
    createdAt: Timestamp;
    deletedAt?: Timestamp;
}
/**
 * 媒体元数据
 */
export interface MediaMetadata {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    quality?: number;
    alt?: string;
    title?: string;
    description?: string;
    [key: string]: any;
}
/**
 * 媒体类型信息（配置）
 */
export interface MediaTypeConfig {
    id: number;
    name: string;
    mimeType: string;
    extensions: string[];
    maxSize: number;
    allowed: boolean;
}
/**
 * 内容媒体关联
 */
export interface ContentMedia {
    contentId: number;
    mediaId: number;
    sortOrder: number;
    position: 'body' | 'header' | 'footer' | 'custom';
}
/**
 * 系统配置项
 */
export interface SystemConfig {
    id: number;
    configGroup: ConfigGroup;
    configKey: string;
    configValue: any;
    displayName: string;
    description?: string;
    inputType: ConfigInputType;
    inputOptions?: Record<string, any>;
    validationRules?: ValidationRules;
    sortOrder: number;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 配置分组
 */
export type ConfigGroup = 'basic' | 'theme' | 'layout' | 'feature' | 'seo' | 'social' | 'notification' | 'custom';
/**
 * 验证规则
 */
export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
}
/**
 * 配置值（分组后的结构）
 */
export interface ConfigValue {
    [key: string]: any;
}
/**
 * 主题信息
 */
export interface Theme {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    previewImage?: string;
    config: ThemeConfig;
    isActive: boolean;
    isBuiltin: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 主题配置
 */
export interface ThemeConfig {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    borderRadius: ThemeBorderRadius;
    shadows: ThemeShadows;
    animations: ThemeAnimations;
}
/**
 * 主题颜色配置
 */
export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    [key: string]: string;
}
/**
 * 主题字体配置
 */
export interface ThemeTypography {
    fontFamily: string;
    fontFamilyMono: string;
    fontSizeBase: number;
    fontWeightBase: number;
    lineHeight: number;
}
/**
 * 主题间距配置
 */
export interface ThemeSpacing {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
}
/**
 * 主题圆角配置
 */
export interface ThemeBorderRadius {
    sm: string;
    md: string;
    lg: string;
    full: string;
    [key: string]: string;
}
/**
 * 主题阴影配置
 */
export interface ThemeShadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
}
/**
 * 主题动画配置
 */
export interface ThemeAnimations {
    enabled: boolean;
    duration: number;
    easing: string;
}
/**
 * 菜单信息
 */
export interface Menu {
    id: number;
    name: string;
    displayName: string;
    location: MenuLocation;
    items: MenuItem[];
    isActive: boolean;
    sortOrder: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 菜单项
 */
export interface MenuItem {
    id: string;
    label: string;
    url: string;
    icon?: string;
    target?: '_self' | '_blank';
    children?: MenuItem[];
    sortOrder?: number;
    isActive?: boolean;
}
/**
 * 页面布局信息
 */
export interface PageLayout {
    id: number;
    pageType: PageType;
    pageName: string;
    layoutConfig: LayoutConfig;
    components: PageComponent[];
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 页面类型
 */
export type PageType = 'home' | 'article' | 'category' | 'tag' | 'search' | 'author' | 'archive' | 'custom';
/**
 * 布局配置
 */
export interface LayoutConfig {
    container: string;
    sidebar: SidebarConfig;
    content: ContentConfig;
    customClasses?: string[];
}
/**
 * 侧边栏配置
 */
export interface SidebarConfig {
    enabled: boolean;
    position: 'left' | 'right' | 'none';
    width: string;
    sticky: boolean;
    widgets: string[];
}
/**
 * 内容区域配置
 */
export interface ContentConfig {
    width: 'full' | 'contained';
    padding: string;
}
/**
 * 页面组件
 */
export interface PageComponent {
    id: string;
    name: string;
    type: string;
    config: Record<string, any>;
    position: number;
    isActive: boolean;
}
/**
 * 小部件信息
 */
export interface Widget {
    id: number;
    name: string;
    displayName: string;
    widgetType: WidgetType;
    config: WidgetConfig;
    showTitle: boolean;
    customClass?: string;
    location: WidgetLocation;
    sortOrder: number;
    visibilityRules: VisibilityRules;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * 小部件位置
 */
export type WidgetLocation = 'sidebar' | 'footer' | 'header' | 'custom';
/**
 * 小部件配置
 */
export interface WidgetConfig {
    [key: string]: any;
}
/**
 * 可见性规则
 */
export interface VisibilityRules {
    showOnPages?: string[];
    hideOnPages?: string[];
    userRoles?: ('all' | 'guest' | 'member' | 'admin')[];
    devices?: ('desktop' | 'tablet' | 'mobile')[];
}
/**
 * API 通用响应
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}
/**
 * 分页响应
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}
/**
 * API 错误信息
 */
export interface ApiError {
    code: ErrorCode | string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
}
/**
 * 错误码枚举
 */
export declare enum ErrorCode {
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    INVALID_REQUEST = "INVALID_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    CONTENT_NOT_FOUND = "CONTENT_NOT_FOUND",
    CONTENT_ALREADY_EXISTS = "CONTENT_ALREADY_EXISTS",
    INVALID_CONTENT_STATUS = "INVALID_CONTENT_STATUS",
    MEDIA_NOT_FOUND = "MEDIA_NOT_FOUND",
    MEDIA_UPLOAD_FAILED = "MEDIA_UPLOAD_FAILED",
    INVALID_MEDIA_TYPE = "INVALID_MEDIA_TYPE",
    CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND",
    INVALID_CONFIG_VALUE = "INVALID_CONFIG_VALUE",
    DATABASE_ERROR = "DATABASE_ERROR",
    DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
/**
 * 响应元数据
 */
export interface ResponseMeta {
    timestamp: Timestamp;
    requestId?: string;
    [key: string]: any;
}
/**
 * 分页元数据
 */
export interface PaginationMeta extends ResponseMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
/**
 * 分页请求参数
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/**
 * 工作流实例
 */
export interface WorkflowInstance {
    id: number;
    contentId: number;
    currentState: string;
    nextState?: string;
    workflowType: string;
    creatorId: number;
    approverId?: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    dueAt?: Timestamp;
}
/**
 * 工作流日志
 */
export interface WorkflowLog {
    id: number;
    workflowInstanceId: number;
    previousState?: string;
    newState: string;
    reason?: string;
    actorId: number;
    createdAt: Timestamp;
}
/**
 * 创建请求类型（不包含 id、时间戳等自动生成字段）
 */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
/**
 * 更新请求类型（所有字段可选）
 */
export type UpdateInput<T> = DeepPartial<CreateInput<T>>;
/**
 * ID 类型（支持 number 或 string）
 */
export type ID = number | string;
/**
 * JSON 类型
 */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
    [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];
export * from './storage';
//# sourceMappingURL=index.d.ts.map