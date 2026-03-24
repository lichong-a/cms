-- ============================================================================
-- 多租户迁移 SQL
-- ============================================================================

-- Step 1: 创建租户状态枚举
CREATE TYPE "tenant_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'DISABLED');

-- Step 2: 创建 tenants 表
CREATE TABLE "tenants" (
    "id" VARCHAR(30) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "logo" VARCHAR(500),
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" "tenant_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- Step 3: 创建租户表索引
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- Step 4: 插入默认租户
INSERT INTO "tenants" ("id", "slug", "name", "status", "config", "created_at", "updated_at")
VALUES (
    'default',
    'default',
    'Default Tenant',
    'ACTIVE',
    '{"theme": {"primaryColor": "#1890ff"}, "features": {"enableComments": true, "enableWorkflows": true, "enableMediaLibrary": true, "enableVersioning": true, "maxStorageMB": 10240, "maxArticles": 10000}, "domains": {"subdomain": "default"}, "seo": {"siteName": "CMS"}}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 5: 添加 tenant_id 列到各表
-- Users 表
ALTER TABLE "users" ADD COLUMN "tenant_id" VARCHAR(30);
ALTER TABLE "users" ADD COLUMN "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

-- Articles 表
ALTER TABLE "articles" ADD COLUMN "tenant_id" VARCHAR(30);

-- Article Versions 表
ALTER TABLE "article_versions" ADD COLUMN "tenant_id" VARCHAR(30);

-- Article Fields 表
ALTER TABLE "article_fields" ADD COLUMN "tenant_id" VARCHAR(30);

-- Categories 表
ALTER TABLE "categories" ADD COLUMN "tenant_id" VARCHAR(30);

-- Tags 表
ALTER TABLE "tags" ADD COLUMN "tenant_id" VARCHAR(30);

-- Article Tags 表
ALTER TABLE "article_tags" ADD COLUMN "tenant_id" VARCHAR(30);

-- Comments 表
ALTER TABLE "comments" ADD COLUMN "tenant_id" VARCHAR(30);

-- Article Media 表
ALTER TABLE "article_media" ADD COLUMN "tenant_id" VARCHAR(30);

-- Media Files 表
ALTER TABLE "media_files" ADD COLUMN "tenant_id" VARCHAR(30);

-- Workflow Instances 表
ALTER TABLE "workflow_instances" ADD COLUMN "tenant_id" VARCHAR(30);

-- Workflow Logs 表
ALTER TABLE "workflow_logs" ADD COLUMN "tenant_id" VARCHAR(30);

-- Themes 表
ALTER TABLE "themes" ADD COLUMN "tenant_id" VARCHAR(30);

-- Menus 表
ALTER TABLE "menus" ADD COLUMN "tenant_id" VARCHAR(30);

-- Page Layouts 表
ALTER TABLE "page_layouts" ADD COLUMN "tenant_id" VARCHAR(30);

-- Widgets 表
ALTER TABLE "widgets" ADD COLUMN "tenant_id" VARCHAR(30);

-- Step 6: 迁移现有数据到默认租户
UPDATE "users" SET "tenant_id" = 'default';
UPDATE "articles" SET "tenant_id" = 'default';
UPDATE "article_versions" SET "tenant_id" = 'default';
UPDATE "article_fields" SET "tenant_id" = 'default';
UPDATE "categories" SET "tenant_id" = 'default';
UPDATE "tags" SET "tenant_id" = 'default';
UPDATE "article_tags" SET "tenant_id" = 'default';
UPDATE "comments" SET "tenant_id" = 'default';
UPDATE "article_media" SET "tenant_id" = 'default';
UPDATE "media_files" SET "tenant_id" = 'default';
UPDATE "workflow_instances" SET "tenant_id" = 'default';
UPDATE "workflow_logs" SET "tenant_id" = 'default';
UPDATE "themes" SET "tenant_id" = 'default';
UPDATE "menus" SET "tenant_id" = 'default';
UPDATE "page_layouts" SET "tenant_id" = 'default';
UPDATE "widgets" SET "tenant_id" = 'default';

-- Step 7: 设置 NOT NULL 约束
ALTER TABLE "users" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "articles" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "article_versions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "article_fields" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "tags" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "article_tags" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "comments" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "article_media" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "media_files" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "workflow_instances" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "workflow_logs" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "themes" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "menus" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "page_layouts" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "widgets" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Step 8: 删除旧的全局唯一约束（使用 IF EXISTS 避免错误）
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_key";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_slug_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_name_key";
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_slug_key";
ALTER TABLE "themes" DROP CONSTRAINT IF EXISTS "themes_name_key";
ALTER TABLE "menus" DROP CONSTRAINT IF EXISTS "menus_name_key";
ALTER TABLE "page_layouts" DROP CONSTRAINT IF EXISTS "page_layouts_page_type_key";
ALTER TABLE "widgets" DROP CONSTRAINT IF EXISTS "widgets_name_key";

-- Step 9: 创建租户内唯一约束
-- Users
CREATE UNIQUE INDEX "users_tenant_id_username_key" ON "users"("tenant_id", "username");
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- Articles
CREATE UNIQUE INDEX "articles_tenant_id_slug_key" ON "articles"("tenant_id", "slug");

-- Categories
CREATE UNIQUE INDEX "categories_tenant_id_name_key" ON "categories"("tenant_id", "name");
CREATE UNIQUE INDEX "categories_tenant_id_slug_key" ON "categories"("tenant_id", "slug");

-- Tags
CREATE UNIQUE INDEX "tags_tenant_id_name_key" ON "tags"("tenant_id", "name");
CREATE UNIQUE INDEX "tags_tenant_id_slug_key" ON "tags"("tenant_id", "slug");

-- Article Versions
CREATE UNIQUE INDEX "article_versions_tenant_id_article_id_version_key" ON "article_versions"("tenant_id", "article_id", "version");

-- Article Fields
CREATE UNIQUE INDEX "article_fields_tenant_id_article_id_field_name_key" ON "article_fields"("tenant_id", "article_id", "field_name");

-- Themes
CREATE UNIQUE INDEX "themes_tenant_id_name_key" ON "themes"("tenant_id", "name");

-- Menus
CREATE UNIQUE INDEX "menus_tenant_id_name_key" ON "menus"("tenant_id", "name");

-- Page Layouts
CREATE UNIQUE INDEX "page_layouts_tenant_id_page_type_key" ON "page_layouts"("tenant_id", "page_type");

-- Widgets
CREATE UNIQUE INDEX "widgets_tenant_id_name_key" ON "widgets"("tenant_id", "name");

-- Step 10: 创建 tenant_id 索引
-- Users
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_tenant_id_isActive_idx" ON "users"("tenant_id", "isActive");
CREATE INDEX "users_tenant_id_deleted_at_idx" ON "users"("tenant_id", "deleted_at");

-- Articles
CREATE INDEX "articles_tenant_id_idx" ON "articles"("tenant_id");
CREATE INDEX "articles_tenant_id_status_idx" ON "articles"("tenant_id", "status");
CREATE INDEX "articles_tenant_id_status_published_at_idx" ON "articles"("tenant_id", "status", "published_at");
CREATE INDEX "articles_tenant_id_author_id_idx" ON "articles"("tenant_id", "author_id");
CREATE INDEX "articles_tenant_id_category_id_idx" ON "articles"("tenant_id", "category_id");
CREATE INDEX "articles_tenant_id_deleted_at_idx" ON "articles"("tenant_id", "deleted_at");

-- Article Versions
CREATE INDEX "article_versions_tenant_id_idx" ON "article_versions"("tenant_id");
CREATE INDEX "article_versions_tenant_id_article_id_idx" ON "article_versions"("tenant_id", "article_id");
CREATE INDEX "article_versions_tenant_id_is_current_idx" ON "article_versions"("tenant_id", "is_current");
CREATE INDEX "article_versions_tenant_id_created_at_idx" ON "article_versions"("tenant_id", "created_at");

-- Article Fields
CREATE INDEX "article_fields_tenant_id_idx" ON "article_fields"("tenant_id");
CREATE INDEX "article_fields_tenant_id_article_id_idx" ON "article_fields"("tenant_id", "article_id");
CREATE INDEX "article_fields_tenant_id_field_name_idx" ON "article_fields"("tenant_id", "field_name");

-- Categories
CREATE INDEX "categories_tenant_id_idx" ON "categories"("tenant_id");
CREATE INDEX "categories_tenant_id_parent_id_idx" ON "categories"("tenant_id", "parent_id");

-- Tags
CREATE INDEX "tags_tenant_id_idx" ON "tags"("tenant_id");

-- Article Tags
CREATE INDEX "article_tags_tenant_id_idx" ON "article_tags"("tenant_id");
CREATE INDEX "article_tags_tenant_id_article_id_idx" ON "article_tags"("tenant_id", "article_id");
CREATE INDEX "article_tags_tenant_id_tag_id_idx" ON "article_tags"("tenant_id", "tag_id");

-- Comments
CREATE INDEX "comments_tenant_id_idx" ON "comments"("tenant_id");
CREATE INDEX "comments_tenant_id_article_id_idx" ON "comments"("tenant_id", "article_id");
CREATE INDEX "comments_tenant_id_status_idx" ON "comments"("tenant_id", "status");
CREATE INDEX "comments_tenant_id_deleted_at_idx" ON "comments"("tenant_id", "deleted_at");

-- Article Media
CREATE INDEX "article_media_tenant_id_idx" ON "article_media"("tenant_id");
CREATE INDEX "article_media_tenant_id_article_id_idx" ON "article_media"("tenant_id", "article_id");
CREATE INDEX "article_media_tenant_id_media_id_idx" ON "article_media"("tenant_id", "media_id");

-- Media Files
CREATE INDEX "media_files_tenant_id_idx" ON "media_files"("tenant_id");
CREATE INDEX "media_files_tenant_id_created_at_idx" ON "media_files"("tenant_id", "created_at");
CREATE INDEX "media_files_tenant_id_mime_type_idx" ON "media_files"("tenant_id", "mime_type");
CREATE INDEX "media_files_tenant_id_deleted_at_idx" ON "media_files"("tenant_id", "deleted_at");

-- Workflow Instances
CREATE INDEX "workflow_instances_tenant_id_idx" ON "workflow_instances"("tenant_id");
CREATE INDEX "workflow_instances_tenant_id_article_id_idx" ON "workflow_instances"("tenant_id", "article_id");
CREATE INDEX "workflow_instances_tenant_id_current_state_idx" ON "workflow_instances"("tenant_id", "current_state");
CREATE INDEX "workflow_instances_tenant_id_creator_id_idx" ON "workflow_instances"("tenant_id", "creator_id");
CREATE INDEX "workflow_instances_tenant_id_approver_id_idx" ON "workflow_instances"("tenant_id", "approver_id");

-- Workflow Logs
CREATE INDEX "workflow_logs_tenant_id_idx" ON "workflow_logs"("tenant_id");
CREATE INDEX "workflow_logs_tenant_id_workflow_instance_id_idx" ON "workflow_logs"("tenant_id", "workflow_instance_id");
CREATE INDEX "workflow_logs_tenant_id_actor_id_idx" ON "workflow_logs"("tenant_id", "actor_id");
CREATE INDEX "workflow_logs_tenant_id_created_at_idx" ON "workflow_logs"("tenant_id", "created_at");

-- Themes
CREATE INDEX "themes_tenant_id_idx" ON "themes"("tenant_id");
CREATE INDEX "themes_tenant_id_is_active_idx" ON "themes"("tenant_id", "is_active");

-- Menus
CREATE INDEX "menus_tenant_id_idx" ON "menus"("tenant_id");
CREATE INDEX "menus_tenant_id_location_idx" ON "menus"("tenant_id", "location");
CREATE INDEX "menus_tenant_id_is_active_idx" ON "menus"("tenant_id", "is_active");

-- Page Layouts
CREATE INDEX "page_layouts_tenant_id_idx" ON "page_layouts"("tenant_id");
CREATE INDEX "page_layouts_tenant_id_is_active_idx" ON "page_layouts"("tenant_id", "is_active");

-- Widgets
CREATE INDEX "widgets_tenant_id_idx" ON "widgets"("tenant_id");
CREATE INDEX "widgets_tenant_id_location_idx" ON "widgets"("tenant_id", "location");
CREATE INDEX "widgets_tenant_id_is_active_idx" ON "widgets"("tenant_id", "is_active");

-- Step 11: 添加外键约束
-- Users
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Articles
ALTER TABLE "articles" ADD CONSTRAINT "articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Article Versions
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Article Fields
ALTER TABLE "article_fields" ADD CONSTRAINT "article_fields_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Categories
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Tags
ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Article Tags
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Comments
ALTER TABLE "comments" ADD CONSTRAINT "comments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Article Media
ALTER TABLE "article_media" ADD CONSTRAINT "article_media_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Media Files
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Workflow Instances
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Workflow Logs
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Themes
ALTER TABLE "themes" ADD CONSTRAINT "themes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Menus
ALTER TABLE "menus" ADD CONSTRAINT "menus_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Page Layouts
ALTER TABLE "page_layouts" ADD CONSTRAINT "page_layouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Widgets
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 12: 创建租户配置表
CREATE TABLE "tenant_configs" (
    "id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "config_group" VARCHAR(50) NOT NULL,
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" JSONB NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "input_type" VARCHAR(50) NOT NULL,
    "input_options" JSONB,
    "validation_rules" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_configs_pkey" PRIMARY KEY ("id")
);

-- Step 13: 创建租户配置表索引和约束
CREATE UNIQUE INDEX "tenant_configs_tenant_id_config_group_config_key_key" ON "tenant_configs"("tenant_id", "config_group", "config_key");
CREATE INDEX "tenant_configs_tenant_id_idx" ON "tenant_configs"("tenant_id");
CREATE INDEX "tenant_configs_tenant_id_config_group_idx" ON "tenant_configs"("tenant_id", "config_group");
CREATE INDEX "tenant_configs_tenant_id_config_key_idx" ON "tenant_configs"("tenant_id", "config_key");

ALTER TABLE "tenant_configs" ADD CONSTRAINT "tenant_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 14: 迁移系统配置到默认租户
INSERT INTO "tenant_configs" (
    "tenant_id", "config_group", "config_key", "config_value",
    "display_name", "description", "input_type", "input_options",
    "validation_rules", "sort_order", "is_active", "created_at", "updated_at"
)
SELECT
    'default',
    "config_group", "config_key", "config_value",
    "display_name", "description", "input_type", "input_options",
    "validation_rules", "sort_order", "is_active", "created_at", "updated_at"
FROM "system_configs";

-- Step 15: 创建审计日志表
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(50) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resource_id" INTEGER,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Step 16: 创建审计日志表索引和外键
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_tenant_id_user_id_idx" ON "audit_logs"("tenant_id", "user_id");
CREATE INDEX "audit_logs_tenant_id_action_idx" ON "audit_logs"("tenant_id", "action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
