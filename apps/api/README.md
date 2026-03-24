# CMS API - 阿里云 OSS 存储提供者

## 概述

实现了阿里云 OSS 存储提供者，支持 STS 临时凭证和签名 URL 上传文件。

## 功能

- ✅ 阿里云 OSS 存储提供者 (`oss.provider.ts`)
- ✅ STS 临时凭证服务 (`sts.service.ts`)
- ✅ API 端点：`/auth/sts` 和 `/upload/oss`
- ✅ 前端集成组件：`UploadButton` 和 `StorageSelector`
- ✅ 分片上传支持
- ✅ 环境变量配置

## 使用方法

1. **配置环境变量**

   复制 `.env.oss.example` 到 `.env` 并填入真实配置：

   ```bash
   cp .env.oss.example .env
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **启动服务**

   ```bash
   pnpm dev
   ```

4. **测试 OSS 功能**

   ```bash
   pnpm test-oss
   ```

## 文件结构

```
apps/api/src/storage/
  - oss.provider.ts        # OSS 存储提供者
  - sts.service.ts         # STS 服务
  - index.ts               # 存储工厂

apps/api/src/routes/
  - sts.routes.ts          # STS 路由
  - oss.routes.ts          # OSS 路由

apps/web-admin/components/
  - upload/UploadButton.tsx # 上传按钮组件
  - upload/StorageSelector.tsx # 存储选择器组件

apps/web-admin/lib/
  - storage/              # 存储相关
```

## 详细文档

查看 [README.oss.md](README.oss.md) 获取完整的使用说明和 API 文档。