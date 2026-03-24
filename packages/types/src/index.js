"use strict";
/// <reference types="node" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.WidgetType = exports.MenuLocation = exports.ConfigInputType = exports.CommentStatus = exports.ContentStatus = exports.ArticleStatus = void 0;
// ============================================================================
// 枚举定义
// ============================================================================
/**
 * 文章状态
 */
var ArticleStatus;
(function (ArticleStatus) {
    ArticleStatus["DRAFT"] = "draft";
    ArticleStatus["PUBLISHED"] = "published";
    ArticleStatus["ARCHIVED"] = "archived";
})(ArticleStatus || (exports.ArticleStatus = ArticleStatus = {}));
/**
 * 内容状态
 */
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "draft";
    ContentStatus["PUBLISHED"] = "published";
    ContentStatus["ARCHIVED"] = "archived";
    ContentStatus["DELETED"] = "deleted";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
/**
 * 评论状态
 */
var CommentStatus;
(function (CommentStatus) {
    CommentStatus["PENDING"] = "pending";
    CommentStatus["APPROVED"] = "approved";
    CommentStatus["SPAM"] = "spam";
    CommentStatus["TRASH"] = "trash";
})(CommentStatus || (exports.CommentStatus = CommentStatus = {}));
/**
 * 配置输入类型
 */
var ConfigInputType;
(function (ConfigInputType) {
    ConfigInputType["TEXT"] = "text";
    ConfigInputType["TEXTAREA"] = "textarea";
    ConfigInputType["NUMBER"] = "number";
    ConfigInputType["COLOR"] = "color";
    ConfigInputType["IMAGE"] = "image";
    ConfigInputType["SELECT"] = "select";
    ConfigInputType["MULTI_SELECT"] = "multi-select";
    ConfigInputType["SWITCH"] = "switch";
    ConfigInputType["JSON"] = "json";
})(ConfigInputType || (exports.ConfigInputType = ConfigInputType = {}));
/**
 * 菜单位置
 */
var MenuLocation;
(function (MenuLocation) {
    MenuLocation["HEADER"] = "header";
    MenuLocation["FOOTER"] = "footer";
    MenuLocation["SIDEBAR"] = "sidebar";
    MenuLocation["CUSTOM"] = "custom";
})(MenuLocation || (exports.MenuLocation = MenuLocation = {}));
/**
 * 小部件类型
 */
var WidgetType;
(function (WidgetType) {
    WidgetType["RECENT_POSTS"] = "recent_posts";
    WidgetType["CATEGORIES"] = "categories";
    WidgetType["TAGS"] = "tags";
    WidgetType["SEARCH"] = "search";
    WidgetType["CUSTOM_HTML"] = "custom_html";
    WidgetType["ARCHIVE"] = "archive";
    WidgetType["SOCIAL_LINKS"] = "social_links";
    WidgetType["NEWSLETTER"] = "newsletter";
})(WidgetType || (exports.WidgetType = WidgetType = {}));
/**
 * 错误码枚举
 */
var ErrorCode;
(function (ErrorCode) {
    // 通用错误
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    ErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    // 用户相关
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    // 内容相关
    ErrorCode["CONTENT_NOT_FOUND"] = "CONTENT_NOT_FOUND";
    ErrorCode["CONTENT_ALREADY_EXISTS"] = "CONTENT_ALREADY_EXISTS";
    ErrorCode["INVALID_CONTENT_STATUS"] = "INVALID_CONTENT_STATUS";
    // 媒体相关
    ErrorCode["MEDIA_NOT_FOUND"] = "MEDIA_NOT_FOUND";
    ErrorCode["MEDIA_UPLOAD_FAILED"] = "MEDIA_UPLOAD_FAILED";
    ErrorCode["INVALID_MEDIA_TYPE"] = "INVALID_MEDIA_TYPE";
    // 配置相关
    ErrorCode["CONFIG_NOT_FOUND"] = "CONFIG_NOT_FOUND";
    ErrorCode["INVALID_CONFIG_VALUE"] = "INVALID_CONFIG_VALUE";
    // 数据库错误
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["DUPLICATE_ENTRY"] = "DUPLICATE_ENTRY";
    // 验证错误
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// ============================================================================
// 存储相关类型
// ============================================================================
__exportStar(require("./storage"), exports);
//# sourceMappingURL=index.js.map