-- CreateEnum
CREATE TYPE "article_status" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "comment_status" AS ENUM ('PENDING', 'APPROVED', 'SPAM', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "avatarUrl" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "status" "article_status" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "excerpt" TEXT,
    "thumbnail" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "author_id" INTEGER,
    "category_id" INTEGER,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_versions" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "description" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" INTEGER,

    CONSTRAINT "article_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_fields" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "field_value" TEXT,
    "field_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parent_id" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "article_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "status" "comment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "article_id" INTEGER NOT NULL,
    "author_id" INTEGER,
    "parent_id" INTEGER,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_media" (
    "article_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "position" VARCHAR(50) NOT NULL DEFAULT 'body',

    CONSTRAINT "article_media_pkey" PRIMARY KEY ("article_id","media_id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" SERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "thumbnail_path" VARCHAR(500),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "uploader_id" INTEGER,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "current_state" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "next_state" VARCHAR(50),
    "workflow_type" VARCHAR(50) NOT NULL DEFAULT 'content',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "due_at" TIMESTAMP(3),
    "creator_id" INTEGER,
    "approver_id" INTEGER,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_logs" (
    "id" SERIAL NOT NULL,
    "workflow_instance_id" INTEGER NOT NULL,
    "previous_state" VARCHAR(50),
    "new_state" VARCHAR(50) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_id" INTEGER,

    CONSTRAINT "workflow_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "preview_image" VARCHAR(255),
    "config" JSONB NOT NULL DEFAULT '{"colors": {}, "typography": {}, "spacing": {}, "borderRadius": {}, "shadows": {}, "animations": {}}',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_builtin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(50) NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_layouts" (
    "id" SERIAL NOT NULL,
    "page_type" VARCHAR(50) NOT NULL,
    "page_name" VARCHAR(100) NOT NULL,
    "layout_config" JSONB NOT NULL DEFAULT '{}',
    "components" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "widget_type" VARCHAR(50) NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "show_title" BOOLEAN NOT NULL DEFAULT true,
    "custom_class" VARCHAR(255),
    "location" VARCHAR(50) NOT NULL DEFAULT 'sidebar',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visibility_rules" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_name_idx" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "permissions_name_idx" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");

-- CreateIndex
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "articles_deleted_at_idx" ON "articles"("deleted_at");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "article_versions_article_id_idx" ON "article_versions"("article_id");

-- CreateIndex
CREATE INDEX "article_versions_is_current_idx" ON "article_versions"("is_current");

-- CreateIndex
CREATE INDEX "article_versions_created_at_idx" ON "article_versions"("created_at");

-- CreateIndex
CREATE INDEX "article_fields_article_id_idx" ON "article_fields"("article_id");

-- CreateIndex
CREATE INDEX "article_fields_field_name_idx" ON "article_fields"("field_name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "article_tags_article_id_idx" ON "article_tags"("article_id");

-- CreateIndex
CREATE INDEX "article_tags_tag_id_idx" ON "article_tags"("tag_id");

-- CreateIndex
CREATE INDEX "comments_article_id_idx" ON "comments"("article_id");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "comments"("status");

-- CreateIndex
CREATE INDEX "comments_deleted_at_idx" ON "comments"("deleted_at");

-- CreateIndex
CREATE INDEX "article_media_article_id_idx" ON "article_media"("article_id");

-- CreateIndex
CREATE INDEX "article_media_media_id_idx" ON "article_media"("media_id");

-- CreateIndex
CREATE INDEX "media_files_uploader_id_idx" ON "media_files"("uploader_id");

-- CreateIndex
CREATE INDEX "media_files_created_at_idx" ON "media_files"("created_at");

-- CreateIndex
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");

-- CreateIndex
CREATE INDEX "media_files_mime_type_idx" ON "media_files"("mime_type");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_instances_article_id_key" ON "workflow_instances"("article_id");

-- CreateIndex
CREATE INDEX "workflow_instances_article_id_idx" ON "workflow_instances"("article_id");

-- CreateIndex
CREATE INDEX "workflow_instances_current_state_idx" ON "workflow_instances"("current_state");

-- CreateIndex
CREATE INDEX "workflow_instances_creator_id_idx" ON "workflow_instances"("creator_id");

-- CreateIndex
CREATE INDEX "workflow_instances_approver_id_idx" ON "workflow_instances"("approver_id");

-- CreateIndex
CREATE INDEX "workflow_logs_workflow_instance_id_idx" ON "workflow_logs"("workflow_instance_id");

-- CreateIndex
CREATE INDEX "workflow_logs_actor_id_idx" ON "workflow_logs"("actor_id");

-- CreateIndex
CREATE INDEX "workflow_logs_created_at_idx" ON "workflow_logs"("created_at");

-- CreateIndex
CREATE INDEX "system_configs_config_group_idx" ON "system_configs"("config_group");

-- CreateIndex
CREATE INDEX "system_configs_config_key_idx" ON "system_configs"("config_key");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_config_group_config_key_key" ON "system_configs"("config_group", "config_key");

-- CreateIndex
CREATE UNIQUE INDEX "themes_name_key" ON "themes"("name");

-- CreateIndex
CREATE INDEX "themes_name_idx" ON "themes"("name");

-- CreateIndex
CREATE INDEX "themes_is_active_idx" ON "themes"("is_active");

-- CreateIndex
CREATE INDEX "menus_location_idx" ON "menus"("location");

-- CreateIndex
CREATE INDEX "menus_is_active_idx" ON "menus"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "page_layouts_page_type_key" ON "page_layouts"("page_type");

-- CreateIndex
CREATE INDEX "page_layouts_page_type_idx" ON "page_layouts"("page_type");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_name_key" ON "widgets"("name");

-- CreateIndex
CREATE INDEX "widgets_name_idx" ON "widgets"("name");

-- CreateIndex
CREATE INDEX "widgets_location_idx" ON "widgets"("location");

-- CreateIndex
CREATE INDEX "widgets_is_active_idx" ON "widgets"("is_active");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_fields" ADD CONSTRAINT "article_fields_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_media" ADD CONSTRAINT "article_media_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_media" ADD CONSTRAINT "article_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
