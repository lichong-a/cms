# CMS 存储抽象层设计文档

## 目录
- [概述](#概述)
- [设计目标](#设计目标)
- [核心接口定义](#核心接口定义)
- [配置系统](#配置系统)
- [安全策略](#安全策略)
- [上传流程](#上传流程)
- [Provider 实现指南](#provider-实现指南)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [扩展性考虑](#扩展性考虑)

---

## 概述

存储抽象层为 CMS 系统提供统一的文件存储接口，支持多种存储后端（本地文件系统、阿里云 OSS、AWS S3、腾讯云 COS 等），通过配置切换存储方式，无需修改业务代码。

## 设计目标

### 核心目标
1. **统一接口**：屏蔽底层存储差异
2. **易于扩展**：新增存储类型只需实现标准接口
3. **安全可靠**：内置安全验证和错误处理
4. **高性能**：支持流式传输、并发上传
5. **配置驱动**：通过环境变量灵活配置

### 技术栈
- TypeScript 5.x
- Node.js 18+
- 流式处理 (Stream API)
- Magic Number 验证

---

## 核心接口定义

### 1. StorageProvider 接口

```typescript
// packages/types/src/storage.ts

/**
 * 存储提供者接口 - 所有存储实现必须遵循此接口
 */
export interface StorageProvider {
  /**
   * 上传文件
   * @param file 文件内容（Buffer 或 Stream）
   * @param options 上传选项
   * @returns 上传结果
   */
  upload(file: Buffer | NodeJS.ReadableStream, options: UploadOptions): Promise<UploadResult>

  /**
   * 获取文件内容
   * @param key 文件存储键
   * @returns 文件内容（Buffer 或 Stream）
   */
  get(key: string): Promise<Buffer | NodeJS.ReadableStream>

  /**
   * 删除文件
   * @param key 文件存储键
   */
  delete(key: string): Promise<void>

  /**
   * 获取文件访问 URL
   * @param key 文件存储键
   * @param options URL 选项（过期时间、访问权限等）
   * @returns 访问 URL
   */
  getUrl(key: string, options?: UrlOptions): Promise<string>

  /**
   * 检查文件是否存在
   * @param key 文件存储键
   * @returns 是否存在
   */
  exists(key: string): Promise<boolean>

  /**
   * 批量删除文件（可选实现）
   * @param keys 文件存储键数组
   */
  deleteMany?(keys: string[]): Promise<DeleteManyResult>

  /**
   * 获取文件元信息（可选实现）
   * @param key 文件存储键
   */
  getMetadata?(key: string): Promise<FileMetadata>

  /**
   * 初始化存储提供者
   */
  initialize(): Promise<void>

  /**
   * 健康检查
   */
  healthCheck(): Promise<boolean>
}

/**
 * 上传选项
 */
export interface UploadOptions {
  /** 原始文件名（用于生成友好的存储键） */
  filename?: string
  
  /** MIME 类型 */
  mimeType?: string
  
  /** 最大文件大小（字节），覆盖全局配置 */
  maxSize?: number
  
  /** 允许的 MIME 类型列表，覆盖全局配置 */
  allowedTypes?: string[]
  
  /** 存储路径前缀，如 'uploads/images/2024' */
  path?: string
  
  /** 自定义元数据 */
  metadata?: Record<string, string>
  
  /** 是否公开访问 */
  isPublic?: boolean
  
  /** 自定义存储键（如果不提供则自动生成） */
  key?: string
  
  /** 内容编码（如 gzip） */
  contentEncoding?: string
  
  /** 缓存控制（如 'max-age=31536000'） */
  cacheControl?: string
}

/**
 * 上传结果
 */
export interface UploadResult {
  /** 存储键（唯一标识） */
  key: string
  
  /** 访问 URL */
  url: string
  
  /** 文件大小（字节） */
  size: number
  
  /** MIME 类型 */
  mimeType: string
  
  /** ETag（用于版本控制） */
  etag?: string
  
  /** 上传时间 */
  uploadedAt: Date
  
  /** 自定义元数据 */
  metadata?: Record<string, string>
}

/**
 * URL 选项
 */
export interface UrlOptions {
  /** URL 过期时间（秒），默认 3600 */
  expiresIn?: number
  
  /** 是否公开访问（返回公开 URL） */
  isPublic?: boolean
  
  /** 响应内容类型 */
  responseType?: 'inline' | 'attachment'
  
  /** 自定义文件名（用于下载） */
  downloadFilename?: string
}

/**
 * 批量删除结果
 */
export interface DeleteManyResult {
  /** 成功删除的键 */
  deleted: string[]
  
  /** 删除失败的键及错误信息 */
  failed: Array<{ key: string; error: Error }>
}

/**
 * 文件元数据
 */
export interface FileMetadata {
  /** 文件大小 */
  size: number
  
  /** MIME 类型 */
  mimeType: string
  
  /** 最后修改时间 */
  lastModified: Date
  
  /** ETag */
  etag?: string
  
  /** 自定义元数据 */
  metadata?: Record<string, string>
}

/**
 * 存储配置
 */
export interface StorageConfig {
  /** 存储类型 */
  type: 'local' | 'oss' | 's3' | 'cos'
  
  /** 最大文件大小（字节） */
  maxSize: number
  
  /** 允许的 MIME 类型 */
  allowedTypes: string[]
  
  /** 是否启用病毒扫描 */
  enableVirusScan?: boolean
  
  /** 本地存储配置 */
  local?: {
    uploadDir: string
    baseUrl: string
  }
  
  /** 阿里云 OSS 配置 */
  oss?: {
    region: string
    bucket: string
    accessKeyId: string
    accessKeySecret: string
    endpoint?: string
    secure?: boolean
  }
  
  /** AWS S3 配置 */
  s3?: {
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }
  
  /** 腾讯云 COS 配置 */
  cos?: {
    region: string
    bucket: string
    secretId: string
    secretKey: string
  }
}
```

### 2. 错误类型定义

```typescript
// packages/types/src/errors.ts

/**
 * 存储错误基类
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * 文件过大错误
 */
export class FileTooLargeError extends StorageError {
  constructor(maxSize: number, actualSize: number) {
    super(
      `文件大小超出限制：最大 ${maxSize} 字节，实际 ${actualSize} 字节`,
      'FILE_TOO_LARGE',
      413
    )
  }
}

/**
 * 文件类型不允许错误
 */
export class FileTypeNotAllowedError extends StorageError {
  constructor(mimeType: string, allowedTypes: string[]) {
    super(
      `不支持的文件类型：${mimeType}。允许的类型：${allowedTypes.join(', ')}`,
      'FILE_TYPE_NOT_ALLOWED',
      415
    )
  }
}

/**
 * 文件不存在错误
 */
export class FileNotFoundError extends StorageError {
  constructor(key: string) {
    super(`文件不存在：${key}`, 'FILE_NOT_FOUND', 404)
  }
}

/**
 * 上传失败错误
 */
export class UploadFailedError extends StorageError {
  constructor(reason: string, originalError?: Error) {
    super(`上传失败：${reason}`, 'UPLOAD_FAILED', 500)
    this.cause = originalError
  }
}

/**
 * Magic Number 验证失败错误
 */
export class MagicNumberValidationError extends StorageError {
  constructor(expected: string, actual: string) {
    super(
      `文件内容验证失败：期望 ${expected}，实际 ${actual}`,
      'MAGIC_NUMBER_MISMATCH',
      400
    )
  }
}
```

---

## 配置系统

### 1. 环境变量配置

```bash
# .env.example

# ==================== 存储配置 ====================

# 存储类型（local | oss | s3 | cos）
STORAGE_TYPE=local

# 全局限制
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,audio/mpeg

# ==================== 本地存储配置 ====================
UPLOAD_DIR=/var/www/cms/uploads
UPLOAD_BASE_URL=http://localhost:3000/uploads

# ==================== 阿里云 OSS 配置 ====================
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=cms-production
OSS_ACCESS_KEY_ID=LTAI5t...
OSS_ACCESS_KEY_SECRET=AbCdEf...
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_SECURE=true

# ==================== AWS S3 配置 ====================
S3_REGION=us-east-1
S3_BUCKET=cms-production
S3_ACCESS_KEY_ID=AKIAIOSF...
S3_SECRET_ACCESS_KEY=wJalrX...
S3_ENDPOINT=https://s3.amazonaws.com

# ==================== 腾讯云 COS 配置 ====================
COS_REGION=ap-shanghai
COS_BUCKET=cms-production-1234567890
COS_SECRET_ID=AKIDz...
COS_SECRET_KEY=GuTzE...

# ==================== 安全配置 ====================
ENABLE_VIRUS_SCAN=false
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

# ==================== 性能配置 ====================
UPLOAD_TIMEOUT=300000  # 5分钟
MAX_CONCURRENT_UPLOADS=10
CHUNK_SIZE=5242880  # 5MB（用于分片上传）
```

### 2. 配置加载器

```typescript
// packages/config/src/storage.ts

import { z } from 'zod'
import { StorageConfig } from '@cms/types'

/**
 * 存储配置 Schema
 */
const StorageConfigSchema = z.object({
  type: z.enum(['local', 'oss', 's3', 'cos']).default('local'),
  maxSize: z.number().int().positive().default(10485760), // 10MB
  allowedTypes: z.array(z.string()).default([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
  ]),
  enableVirusScan: z.boolean().default(false),
  local: z.object({
    uploadDir: z.string().default('./uploads'),
    baseUrl: z.string().url().optional(),
  }).optional(),
  oss: z.object({
    region: z.string(),
    bucket: z.string(),
    accessKeyId: z.string(),
    accessKeySecret: z.string(),
    endpoint: z.string().url().optional(),
    secure: z.boolean().default(true),
  }).optional(),
  s3: z.object({
    region: z.string(),
    bucket: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    endpoint: z.string().url().optional(),
  }).optional(),
  cos: z.object({
    region: z.string(),
    bucket: z.string(),
    secretId: z.string(),
    secretKey: z.string(),
  }).optional(),
})

/**
 * 从环境变量加载存储配置
 */
export function loadStorageConfig(): StorageConfig {
  const config: StorageConfig = {
    type: (process.env.STORAGE_TYPE as any) || 'local',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedTypes: (process.env.ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,image/webp,video/mp4').split(','),
    enableVirusScan: process.env.ENABLE_VIRUS_SCAN === 'true',
  }

  // 本地存储配置
  if (config.type === 'local') {
    config.local = {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      baseUrl: process.env.UPLOAD_BASE_URL,
    }
  }

  // OSS 配置
  if (config.type === 'oss') {
    config.oss = {
      region: process.env.OSS_REGION!,
      bucket: process.env.OSS_BUCKET!,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
      endpoint: process.env.OSS_ENDPOINT,
      secure: process.env.OSS_SECURE !== 'false',
    }
  }

  // S3 配置
  if (config.type === 's3') {
    config.s3 = {
      region: process.env.S3_REGION!,
      bucket: process.env.S3_BUCKET!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      endpoint: process.env.S3_ENDPOINT,
    }
  }

  // COS 配置
  if (config.type === 'cos') {
    config.cos = {
      region: process.env.COS_REGION!,
      bucket: process.env.COS_BUCKET!,
      secretId: process.env.COS_SECRET_ID!,
      secretKey: process.env.COS_SECRET_KEY!,
    }
  }

  // 验证配置
  return StorageConfigSchema.parse(config)
}
```

---

## 安全策略

### 1. 多层验证机制

```typescript
// packages/storage/src/security/validator.ts

import { createHash } from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { MagicNumberValidationError, FileTypeNotAllowedError, FileTooLargeError } from '@cms/types'

/**
 * 文件验证器
 */
export class FileValidator {
  private readonly allowedTypes: Set<string>
  private readonly maxSize: number
  private readonly magicNumberMap: Map<string, Buffer>

  constructor(allowedTypes: string[], maxSize: number) {
    this.allowedTypes = new Set(allowedTypes)
    this.maxSize = maxSize
    this.magicNumberMap = this.initMagicNumbers()
  }

  /**
   * 初始化 Magic Number 映射
   */
  private initMagicNumbers(): Map<string, Buffer> {
    return new Map([
      // 图片
      ['image/jpeg', Buffer.from([0xFF, 0xD8, 0xFF])],
      ['image/png', Buffer.from([0x89, 0x50, 0x4E, 0x47])],
      ['image/gif', Buffer.from([0x47, 0x49, 0x46, 0x38])],
      ['image/webp', Buffer.from([0x52, 0x49, 0x46, 0x46])],
      ['image/bmp', Buffer.from([0x42, 0x4D])],
      
      // 视频
      ['video/mp4', Buffer.from([0x00, 0x00, 0x00])], // ftyp
      ['video/webm', Buffer.from([0x1A, 0x45, 0xDF, 0xA3])],
      
      // 音频
      ['audio/mpeg', Buffer.from([0xFF, 0xFB])],
      ['audio/wav', Buffer.from([0x52, 0x49, 0x46, 0x46])],
      
      // 文档
      ['application/pdf', Buffer.from([0x25, 0x50, 0x44, 0x46])],
      ['application/zip', Buffer.from([0x50, 0x4B, 0x03, 0x04])],
    ])
  }

  /**
   * 验证文件大小
   */
  validateSize(size: number): void {
    if (size > this.maxSize) {
      throw new FileTooLargeError(this.maxSize, size)
    }
  }

  /**
   * 验证 MIME 类型
   */
  validateMimeType(mimeType: string): void {
    if (!this.allowedTypes.has(mimeType)) {
      throw new FileTypeNotAllowedError(mimeType, Array.from(this.allowedTypes))
    }
  }

  /**
   * 验证 Magic Number（文件实际内容）
   */
  async validateMagicNumber(buffer: Buffer, expectedMimeType: string): Promise<void> {
    const magicNumber = this.magicNumberMap.get(expectedMimeType)
    
    if (!magicNumber) {
      // 如果没有定义 Magic Number，跳过验证
      return
    }

    const header = buffer.slice(0, magicNumber.length)
    
    // 特殊处理：WebP 需要检查 RIFF + WEBP
    if (expectedMimeType === 'image/webp') {
      const riff = buffer.slice(0, 4).toString('ascii')
      const webp = buffer.slice(8, 12).toString('ascii')
      if (riff !== 'RIFF' || webp !== 'WEBP') {
        throw new MagicNumberValidationError('RIFF...WEBP', `${riff}...${webp}`)
      }
      return
    }

    // 特殊处理：MP4 需要检查 ftyp
    if (expectedMimeType === 'video/mp4') {
      const ftyp = buffer.slice(4, 8).toString('ascii')
      if (ftyp !== 'ftyp') {
        throw new MagicNumberValidationError('ftyp', ftyp)
      }
      return
    }

    if (!header.equals(magicNumber)) {
      const expected = magicNumber.toString('hex')
      const actual = header.toString('hex')
      throw new MagicNumberValidationError(expected, actual)
    }
  }

  /**
   * 综合验证
   */
  async validate(buffer: Buffer, mimeType: string, size: number): Promise<void> {
    // 1. 验证大小
    this.validateSize(size)

    // 2. 验证 MIME 类型
    this.validateMimeType(mimeType)

    // 3. 验证 Magic Number
    await this.validateMagicNumber(buffer, mimeType)
  }

  /**
   * 使用 file-type 库检测真实类型
   */
  async detectMimeType(buffer: Buffer): Promise<string | undefined> {
    const fileType = await fileTypeFromBuffer(buffer)
    return fileType?.mime
  }
}
```

### 2. 文件名安全策略

```typescript
// packages/storage/src/security/filename.ts

import { randomUUID } from 'crypto'
import { extname } from 'path'

/**
 * 生成安全的随机文件名
 */
export function generateSafeFilename(originalFilename: string, options?: {
  prefix?: string
  suffix?: string
  preserveExtension?: boolean
}): string {
  const uuid = randomUUID()
  const timestamp = Date.now()
  
  let extension = ''
  if (options?.preserveExtension !== false) {
    extension = extname(originalFilename).toLowerCase()
    // 只保留常见扩展名
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mp3', '.pdf']
    if (!allowedExtensions.includes(extension)) {
      extension = ''
    }
  }

  const parts = [
    options?.prefix,
    timestamp.toString(36),
    uuid.split('-').join(''),
    options?.suffix,
  ].filter(Boolean)

  return `${parts.join('-')}${extension}`
}

/**
 * 清理文件名中的危险字符
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // 移除非法字符
    .replace(/\.{2,}/g, '.') // 防止目录遍历
    .replace(/^\.+/, '') // 移除开头的点
    .slice(0, 255) // 限制长度
}

/**
 * 构建存储键
 */
export function buildStorageKey(filename: string, path?: string): string {
  const safeName = sanitizeFilename(filename)
  const randomName = generateSafeFilename(safeName)
  
  if (path) {
    return `${path.replace(/^\/|\/$/g, '')}/${randomName}`
  }
  
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  return `uploads/${year}/${month}/${randomName}`
}
```

### 3. 病毒扫描集成

```typescript
// packages/storage/src/security/scanner.ts

import NodeClam from 'clamscan'

/**
 * 病毒扫描器（可选）
 */
export class VirusScanner {
  private clamscan: NodeClam | null = null

  async initialize(): Promise<void> {
    if (process.env.ENABLE_VIRUS_SCAN !== 'true') {
      return
    }

    this.clamscan = await new NodeClam().init({
      removeInfected: false,
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      fileList: null,
      scanRecursively: true,
      clamscan: {
        path: '/usr/bin/clamscan',
        db: null,
        scanArchives: true,
        active: true,
      },
      clamdscan: {
        socket: false,
        host: process.env.CLAMAV_HOST || 'localhost',
        port: parseInt(process.env.CLAMAV_PORT || '3310'),
        timeout: 60000,
        localFallback: true,
        path: '/usr/bin/clamdscan',
        configFile: null,
        multiscan: true,
        reloadDb: false,
        active: true,
        bypassTest: false,
      },
      preference: 'clamdscan',
    })
  }

  async scan(buffer: Buffer): Promise<{
    isInfected: boolean
    viruses?: string[]
  }> {
    if (!this.clamscan) {
      return { isInfected: false }
    }

    const { isInfected, viruses } = await this.clamscan.scanBuffer(buffer)
    return { isInfected, viruses }
  }
}
```

---

## 上传流程

### 1. 完整流程图

```mermaid
graph TD
    A[客户端上传请求] --> B{认证检查}
    B -->|未授权| C[返回 401]
    B -->|已授权| D[接收文件数据]
    
    D --> E{检查文件大小}
    E -->|超出限制| F[返回 413 File Too Large]
    E -->|符合限制| G[读取文件头部]
    
    G --> H{验证 Magic Number}
    H -->|不匹配| I[返回 400 Invalid File]
    H -->|匹配| J{验证 MIME 类型}
    
    J -->|不允许| K[返回 415 Unsupported Media Type]
    J -->|允许| L[生成安全文件名]
    
    L --> M{病毒扫描}
    M -->|感染| N[返回 400 Infected File]
    M -->|清洁| O[调用 Provider 上传]
    
    O --> P{上传成功?}
    P -->|失败| Q[返回 500 Upload Failed]
    P -->|成功| R[保存文件记录到数据库]
    
    R --> S[生成访问 URL]
    S --> T[返回 200 UploadResult]
    
    style A fill:#e1f5ff
    style T fill:#c8e6c9
    style C fill:#ffcdd2
    style F fill:#ffcdd2
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style N fill:#ffcdd2
    style Q fill:#ffcdd2
```

### 2. 上传处理器实现

```typescript
// packages/api/src/handlers/upload.ts

import { Router } from 'express'
import formidable from 'formidable'
import { injectable, inject } from 'inversify'
import { 
  StorageProvider, 
  UploadOptions, 
  FileValidator, 
  VirusScanner,
  buildStorageKey,
  UploadFailedError 
} from '@cms/storage'
import { FileRepository } from '@cms/domain'
import { authenticate } from '../middleware/auth'

@injectable()
export class UploadHandler {
  constructor(
    @inject('StorageProvider') private storage: StorageProvider,
    @inject('FileValidator') private validator: FileValidator,
    @inject('VirusScanner') private scanner: VirusScanner,
    @inject('FileRepository') private fileRepo: FileRepository
  ) {}

  register(router: Router) {
    router.post('/upload', authenticate(), this.upload.bind(this))
    router.post('/upload/batch', authenticate(), this.batchUpload.bind(this))
  }

  /**
   * 单文件上传
   */
  private async upload(req: any, res: any, next: any) {
    try {
      const form = formidable({
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
        allowEmptyFiles: false,
      })

      const [fields, files] = await form.parse(req)
      const file = files.file?.[0]

      if (!file) {
        return res.status(400).json({ error: '未找到上传文件' })
      }

      // 读取文件内容
      const buffer = await fs.readFile(file.filepath)
      const mimeType = file.mimetype || 'application/octet-stream'

      // 验证文件
      await this.validator.validate(buffer, mimeType, file.size)

      // 病毒扫描（可选）
      const scanResult = await this.scanner.scan(buffer)
      if (scanResult.isInfected) {
        return res.status(400).json({ 
          error: '检测到病毒', 
          viruses: scanResult.viruses 
        })
      }

      // 构建存储键
      const key = buildStorageKey(
        file.originalFilename || 'unknown',
        fields.path?.toString()
      )

      // 上传到存储
      const result = await this.storage.upload(buffer, {
        filename: file.originalFilename,
        mimeType,
        key,
        path: fields.path?.toString(),
        metadata: {
          uploadedBy: req.user.id,
          originalFilename: file.originalFilename,
        },
      })

      // 保存文件记录到数据库
      await this.fileRepo.create({
        key: result.key,
        url: result.url,
        size: result.size,
        mimeType: result.mimeType,
        etag: result.etag,
        uploadedBy: req.user.id,
        metadata: result.metadata,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 批量上传
   */
  private async batchUpload(req: any, res: any, next: any) {
    try {
      const form = formidable({
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
        maxFiles: 10,
        allowEmptyFiles: false,
      })

      const [fields, files] = await form.parse(req)
      const fileList = files.files || []

      const results = []
      const errors = []

      for (const file of fileList) {
        try {
          const buffer = await fs.readFile(file.filepath)
          const mimeType = file.mimetype || 'application/octet-stream'

          await this.validator.validate(buffer, mimeType, file.size)

          const scanResult = await this.scanner.scan(buffer)
          if (scanResult.isInfected) {
            errors.push({
              filename: file.originalFilename,
              error: '检测到病毒',
              viruses: scanResult.viruses,
            })
            continue
          }

          const key = buildStorageKey(file.originalFilename || 'unknown')
          const result = await this.storage.upload(buffer, {
            filename: file.originalFilename,
            mimeType,
            key,
          })

          await this.fileRepo.create({
            key: result.key,
            url: result.url,
            size: result.size,
            mimeType: result.mimeType,
            uploadedBy: req.user.id,
          })

          results.push(result)
        } catch (error: any) {
          errors.push({
            filename: file.originalFilename,
            error: error.message,
          })
        }
      }

      res.json({
        success: true,
        data: {
          uploaded: results,
          errors,
          total: fileList.length,
          succeeded: results.length,
          failed: errors.length,
        },
      })
    } catch (error) {
      next(error)
    }
  }
}
```

### 3. 下载/访问流程

```typescript
// packages/api/src/handlers/download.ts

import { Router } from 'express'
import { injectable, inject } from 'inversify'
import { StorageProvider, FileNotFoundError } from '@cms/storage'
import { FileRepository } from '@cms/domain'
import { authenticate, optionalAuth } from '../middleware/auth'

@injectable()
export class DownloadHandler {
  constructor(
    @inject('StorageProvider') private storage: StorageProvider,
    @inject('FileRepository') private fileRepo: FileRepository
  ) {}

  register(router: Router) {
    // 获取文件信息
    router.get('/files/:key/info', optionalAuth(), this.getInfo.bind(this))
    
    // 获取访问 URL
    router.get('/files/:key/url', authenticate(), this.getUrl.bind(this))
    
    // 下载文件
    router.get('/files/:key/download', optionalAuth(), this.download.bind(this))
    
    // 删除文件
    router.delete('/files/:key', authenticate(), this.delete.bind(this))
  }

  /**
   * 获取文件信息
   */
  private async getInfo(req: any, res: any, next: any) {
    try {
      const { key } = req.params
      
      // 从数据库获取元信息
      const fileRecord = await this.fileRepo.findByKey(key)
      if (!fileRecord) {
        throw new FileNotFoundError(key)
      }

      // 检查权限
      if (!fileRecord.isPublic && !req.user) {
        return res.status(401).json({ error: '未授权' })
      }

      res.json({
        success: true,
        data: {
          key: fileRecord.key,
          size: fileRecord.size,
          mimeType: fileRecord.mimeType,
          uploadedAt: fileRecord.createdAt,
          uploadedBy: fileRecord.uploadedBy,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取临时访问 URL
   */
  private async getUrl(req: any, res: any, next: any) {
    try {
      const { key } = req.params
      const { expiresIn = 3600 } = req.query

      // 检查文件是否存在
      const exists = await this.storage.exists(key)
      if (!exists) {
        throw new FileNotFoundError(key)
      }

      // 生成临时 URL
      const url = await this.storage.getUrl(key, {
        expiresIn: parseInt(expiresIn as string),
        isPublic: false,
      })

      res.json({
        success: true,
        data: { url, expiresIn },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 下载文件
   */
  private async download(req: any, res: any, next: any) {
    try {
      const { key } = req.params

      // 检查权限
      const fileRecord = await this.fileRepo.findByKey(key)
      if (!fileRecord) {
        throw new FileNotFoundError(key)
      }

      if (!fileRecord.isPublic && !req.user) {
        return res.status(401).json({ error: '未授权' })
      }

      // 获取文件内容
      const buffer = await this.storage.get(key)

      // 设置响应头
      res.setHeader('Content-Type', fileRecord.mimeType)
      res.setHeader('Content-Length', fileRecord.size)
      res.setHeader('Content-Disposition', `inline; filename="${key}"`)

      // 发送文件
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除文件
   */
  private async delete(req: any, res: any, next: any) {
    try {
      const { key } = req.params

      // 检查权限
      const fileRecord = await this.fileRepo.findByKey(key)
      if (!fileRecord) {
        throw new FileNotFoundError(key)
      }

      // 只有上传者或管理员可以删除
      if (fileRecord.uploadedBy !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: '无权限删除' })
      }

      // 从存储中删除
      await this.storage.delete(key)

      // 从数据库中删除记录
      await this.fileRepo.delete(key)

      res.json({
        success: true,
        message: '文件已删除',
      })
    } catch (error) {
      next(error)
    }
  }
}
```

---

## Provider 实现指南

### 1. LocalStorageProvider

```typescript
// packages/storage/src/providers/local.ts

import { createWriteStream, createReadStream, statSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { pipeline } from 'stream/promises'
import { 
  StorageProvider, 
  UploadOptions, 
  UploadResult, 
  UrlOptions,
  FileNotFoundError 
} from '@cms/types'

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string
  private baseUrl: string

  constructor(config: { uploadDir: string; baseUrl: string }) {
    this.uploadDir = resolve(config.uploadDir)
    this.baseUrl = config.baseUrl

    // 确保上传目录存在
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async upload(
    file: Buffer | NodeJS.ReadableStream,
    options: UploadOptions
  ): Promise<UploadResult> {
    const key = options.key || this.generateKey(options.filename)
    const filePath = join(this.uploadDir, key)

    // 确保目录存在
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    let size: number

    if (Buffer.isBuffer(file)) {
      await writeFile(filePath, file)
      size = file.length
    } else {
      // 流式写入
      const writeStream = createWriteStream(filePath)
      await pipeline(file, writeStream)
      size = statSync(filePath).size
    }

    const url = `${this.baseUrl}/${key}`

    return {
      key,
      url,
      size,
      mimeType: options.mimeType || 'application/octet-stream',
      uploadedAt: new Date(),
      metadata: options.metadata,
    }
  }

  async get(key: string): Promise<Buffer | NodeJS.ReadableStream> {
    const filePath = join(this.uploadDir, key)
    
    if (!existsSync(filePath)) {
      throw new FileNotFoundError(key)
    }

    // 返回 Stream 以支持大文件
    return createReadStream(filePath)
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.uploadDir, key)
    
    if (!existsSync(filePath)) {
      throw new FileNotFoundError(key)
    }

    unlinkSync(filePath)
  }

  async getUrl(key: string, options?: UrlOptions): Promise<string> {
    const exists = await this.exists(key)
    if (!exists) {
      throw new FileNotFoundError(key)
    }

    // 本地存储直接返回静态 URL
    return `${this.baseUrl}/${key}`
  }

  async exists(key: string): Promise<boolean> {
    const filePath = join(this.uploadDir, key)
    return existsSync(filePath)
  }

  async initialize(): Promise<void> {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async healthCheck(): Promise<boolean> {
    return existsSync(this.uploadDir)
  }

  private generateKey(originalFilename?: string): string {
    return buildStorageKey(originalFilename || 'unknown')
  }
}
```

### 2. OSSStorageProvider（阿里云 OSS）

```typescript
// packages/storage/src/providers/oss.ts

import OSS from 'ali-oss'
import { 
  StorageProvider, 
  UploadOptions, 
  UploadResult, 
  UrlOptions,
  FileNotFoundError 
} from '@cms/types'

export class OSSStorageProvider implements StorageProvider {
  private client: OSS
  private bucket: string

  constructor(config: {
    region: string
    bucket: string
    accessKeyId: string
    accessKeySecret: string
    endpoint?: string
    secure?: boolean
  }) {
    this.bucket = config.bucket
    this.client = new OSS({
      region: config.region,
      bucket: config.bucket,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: config.endpoint,
      secure: config.secure ?? true,
    })
  }

  async upload(
    file: Buffer | NodeJS.ReadableStream,
    options: UploadOptions
  ): Promise<UploadResult> {
    const key = options.key || this.generateKey(options.filename)

    const result = await this.client.put(key, file, {
      headers: {
        'Content-Type': options.mimeType || 'application/octet-stream',
        'Cache-Control': options.cacheControl || 'max-age=31536000',
        ...(options.contentEncoding && { 'Content-Encoding': options.contentEncoding }),
      },
      meta: options.metadata,
    })

    return {
      key,
      url: result.url,
      size: result.res.size,
      mimeType: options.mimeType || 'application/octet-stream',
      etag: result.etag,
      uploadedAt: new Date(),
      metadata: options.metadata,
    }
  }

  async get(key: string): Promise<Buffer | NodeJS.ReadableStream> {
    try {
      const result = await this.client.get(key)
      return result.content
    } catch (error: any) {
      if (error.status === 404) {
        throw new FileNotFoundError(key)
      }
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.delete(key)
    } catch (error: any) {
      if (error.status === 404) {
        throw new FileNotFoundError(key)
      }
      throw error
    }
  }

  async getUrl(key: string, options?: UrlOptions): Promise<string> {
    const exists = await this.exists(key)
    if (!exists) {
      throw new FileNotFoundError(key)
    }

    // 公开文件直接返回 URL
    if (options?.isPublic) {
      return `https://${this.bucket}.oss-${this.client.options.region}.aliyuncs.com/${key}`
    }

    // 私有文件生成签名 URL
    return this.client.signatureUrl(key, {
      expires: options?.expiresIn || 3600,
      response: options?.downloadFilename ? {
        'content-disposition': `attachment; filename="${options.downloadFilename}"`,
      } : undefined,
    })
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.head(key)
      return true
    } catch (error: any) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
  }

  async deleteMany(keys: string[]): Promise<DeleteManyResult> {
    const result = await this.client.deleteMulti(keys)
    
    return {
      deleted: result.deleted || keys,
      failed: [], // OSS 批量删除不返回失败信息
    }
  }

  async initialize(): Promise<void> {
    // 检查 Bucket 是否存在
    try {
      await this.client.getBucketInfo(this.bucket)
    } catch (error: any) {
      throw new Error(`无法连接到 OSS Bucket: ${this.bucket}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getBucketInfo(this.bucket)
      return true
    } catch {
      return false
    }
  }

  private generateKey(originalFilename?: string): string {
    return buildStorageKey(originalFilename || 'unknown')
  }
}
```

### 3. S3StorageProvider（AWS S3）

```typescript
// packages/storage/src/providers/s3.ts

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { 
  StorageProvider, 
  UploadOptions, 
  UploadResult, 
  UrlOptions,
  FileNotFoundError,
  DeleteManyResult 
} from '@cms/types'
import { Readable } from 'stream'

export class S3StorageProvider implements StorageProvider {
  private client: S3Client
  private bucket: string

  constructor(config: {
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }) {
    this.bucket = config.bucket
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
    })
  }

  async upload(
    file: Buffer | NodeJS.ReadableStream,
    options: UploadOptions
  ): Promise<UploadResult> {
    const key = options.key || this.generateKey(options.filename)

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: options.mimeType || 'application/octet-stream',
      Metadata: options.metadata,
      CacheControl: options.cacheControl || 'max-age=31536000',
      ...(options.contentEncoding && { ContentEncoding: options.contentEncoding }),
      ...(options.isPublic !== false && { ACL: 'public-read' }),
    })

    const result = await this.client.send(command)

    const url = options.isPublic !== false
      ? `https://${this.bucket}.s3.amazonaws.com/${key}`
      : await this.getUrl(key)

    return {
      key,
      url,
      size: 0, // S3 不直接返回大小，需要额外查询
      mimeType: options.mimeType || 'application/octet-stream',
      etag: result.ETag,
      uploadedAt: new Date(),
      metadata: options.metadata,
    }
  }

  async get(key: string): Promise<Buffer | NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    try {
      const result = await this.client.send(command)
      return result.Body as Readable
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw new FileNotFoundError(key)
      }
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    try {
      await this.client.send(command)
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw new FileNotFoundError(key)
      }
      throw error
    }
  }

  async getUrl(key: string, options?: UrlOptions): Promise<string> {
    const exists = await this.exists(key)
    if (!exists) {
      throw new FileNotFoundError(key)
    }

    // 公开文件
    if (options?.isPublic) {
      return `https://${this.bucket}.s3.amazonaws.com/${key}`
    }

    // 生成预签名 URL
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(options?.downloadFilename && {
        ResponseContentDisposition: `attachment; filename="${options.downloadFilename}"`,
      }),
    })

    return getSignedUrl(this.client, command, {
      expiresIn: options?.expiresIn || 3600,
    })
  }

  async exists(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    try {
      await this.client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return false
      }
      throw error
    }
  }

  async deleteMany(keys: string[]): Promise<DeleteManyResult> {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    })

    const result = await this.client.send(command)

    return {
      deleted: result.Deleted?.map(d => d.Key!) || [],
      failed: result.Errors?.map(e => ({
        key: e.Key!,
        error: new Error(e.Message),
      })) || [],
    }
  }

  async initialize(): Promise<void> {
    // S3 客户端懒加载，无需初始化
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: '__health_check__',
      }))
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return true // Bucket 存在
      }
      return false
    }
  }

  private generateKey(originalFilename?: string): string {
    return buildStorageKey(originalFilename || 'unknown')
  }
}
```

### 4. COSStorageProvider（腾讯云 COS）

```typescript
// packages/storage/src/providers/cos.ts

import COS from 'cos-nodejs-sdk-v5'
import { 
  StorageProvider, 
  UploadOptions, 
  UploadResult, 
  UrlOptions,
  FileNotFoundError 
} from '@cms/types'

export class COSStorageProvider implements StorageProvider {
  private client: COS
  private bucket: string
  private region: string

  constructor(config: {
    region: string
    bucket: string
    secretId: string
    secretKey: string
  }) {
    this.bucket = config.bucket
    this.region = config.region
    this.client = new COS({
      SecretId: config.secretId,
      SecretKey: config.secretKey,
    })
  }

  async upload(
    file: Buffer | NodeJS.ReadableStream,
    options: UploadOptions
  ): Promise<UploadResult> {
    const key = options.key || this.generateKey(options.filename)

    return new Promise((resolve, reject) => {
      this.client.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Body: file,
        ContentType: options.mimeType || 'application/octet-stream',
        Metadata: options.metadata,
        CacheControl: options.cacheControl || 'max-age=31536000',
        Headers: {
          'x-cos-acl': options.isPublic !== false ? 'public-read' : 'private',
        },
      }, (err, data) => {
        if (err) return reject(err)

        const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`

        resolve({
          key,
          url,
          size: 0, // COS 不直接返回大小
          mimeType: options.mimeType || 'application/octet-stream',
          etag: data.ETag,
          uploadedAt: new Date(),
          metadata: options.metadata,
        })
      })
    })
  }

  async get(key: string): Promise<Buffer | NodeJS.ReadableStream> {
    return new Promise((resolve, reject) => {
      this.client.getObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err, data) => {
        if (err) {
          if (err.statusCode === 404) {
            return reject(new FileNotFoundError(key))
          }
          return reject(err)
        }
        resolve(data.Body as Buffer)
      })
    })
  }

  async delete(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err) => {
        if (err) {
          if (err.statusCode === 404) {
            return reject(new FileNotFoundError(key))
          }
          return reject(err)
        }
        resolve()
      })
    })
  }

  async getUrl(key: string, options?: UrlOptions): Promise<string> {
    const exists = await this.exists(key)
    if (!exists) {
      throw new FileNotFoundError(key)
    }

    // 公开文件
    if (options?.isPublic) {
      return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`
    }

    // 生成临时签名 URL
    return new Promise((resolve, reject) => {
      this.client.getObjectUrl({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Sign: true,
        Expires: options?.expiresIn || 3600,
        Query: options?.downloadFilename ? {
          'response-content-disposition': `attachment; filename="${options.downloadFilename}"`,
        } : undefined,
      }, (err, data) => {
        if (err) return reject(err)
        resolve(data.Url)
      })
    })
  }

  async exists(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.headObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err) => {
        if (err) {
          if (err.statusCode === 404) {
            return resolve(false)
          }
          return reject(err)
        }
        resolve(true)
      })
    })
  }

  async initialize(): Promise<void> {
    // COS 客户端懒加载，无需初始化
  }

  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.getService((err) => {
        resolve(!err)
      })
    })
  }

  private generateKey(originalFilename?: string): string {
    return buildStorageKey(originalFilename || 'unknown')
  }
}
```

---

## 使用示例

### 1. 初始化和配置

```typescript
// packages/api/src/app.ts

import { Container } from 'inversify'
import { loadStorageConfig } from '@cms/config'
import { 
  StorageProvider, 
  LocalStorageProvider, 
  OSSStorageProvider,
  S3StorageProvider,
  COSStorageProvider,
  FileValidator,
  VirusScanner,
} from '@cms/storage'

const container = new Container()

// 加载配置
const storageConfig = loadStorageConfig()

// 绑定 StorageProvider
switch (storageConfig.type) {
  case 'local':
    container.bind<StorageProvider>('StorageProvider').toConstantValue(
      new LocalStorageProvider(storageConfig.local!)
    )
    break
  case 'oss':
    container.bind<StorageProvider>('StorageProvider').toConstantValue(
      new OSSStorageProvider(storageConfig.oss!)
    )
    break
  case 's3':
    container.bind<StorageProvider>('StorageProvider').toConstantValue(
      new S3StorageProvider(storageConfig.s3!)
    )
    break
  case 'cos':
    container.bind<StorageProvider>('StorageProvider').toConstantValue(
      new COSStorageProvider(storageConfig.cos!)
    )
    break
}

// 绑定验证器和扫描器
container.bind<FileValidator>('FileValidator').toConstantValue(
  new FileValidator(storageConfig.allowedTypes, storageConfig.maxSize)
)

container.bind<VirusScanner>('VirusScanner').toConstantValue(
  new VirusScanner()
)

// 初始化
async function initialize() {
  const storage = container.get<StorageProvider>('StorageProvider')
  const scanner = container.get<VirusScanner>('VirusScanner')

  await storage.initialize()
  await scanner.initialize()

  console.log(`✅ 存储初始化完成: ${storageConfig.type}`)
}
```

### 2. 在业务中使用

```typescript
// packages/domain/src/services/avatar.service.ts

import { inject, injectable } from 'inversify'
import { StorageProvider, UploadResult } from '@cms/types'

@injectable()
export class AvatarService {
  constructor(
    @inject('StorageProvider') private storage: StorageProvider
  ) {}

  async uploadAvatar(
    userId: string,
    file: Buffer,
    mimeType: string
  ): Promise<UploadResult> {
    // 上传头像到特定路径
    const result = await this.storage.upload(file, {
      filename: `avatar-${userId}`,
      mimeType,
      path: 'avatars',
      isPublic: true,
      cacheControl: 'max-age=86400',
      metadata: {
        userId,
        type: 'avatar',
      },
    })

    // 更新用户头像 URL
    // await this.userRepo.updateAvatar(userId, result.url)

    return result
  }

  async deleteAvatar(userId: string): Promise<void> {
    // 构建可能的键
    const pattern = `avatars/avatar-${userId}*`
    
    // 删除头像（需要先查询数据库获取准确键）
    // const avatar = await this.userRepo.getAvatar(userId)
    // await this.storage.delete(avatar.key)
  }
}
```

---

## 最佳实践

### 1. 性能优化

- **流式处理**：大文件使用 Stream 而非 Buffer
- **并发限制**：批量上传时限制并发数
- **CDN 加速**：云存储配置 CDN 域名
- **分片上传**：超大文件使用分片上传（OSS/S3 支持）

### 2. 错误处理

```typescript
// 统一错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof StorageError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
  }
  next(err)
})
```

### 3. 监控和日志

```typescript
// 上传成功日志
logger.info('文件上传成功', {
  key: result.key,
  size: result.size,
  mimeType: result.mimeType,
  uploadedBy: userId,
  duration: Date.now() - startTime,
})

// 存储健康检查
setInterval(async () => {
  const healthy = await storage.healthCheck()
  if (!healthy) {
    logger.error('存储服务不健康')
    // 发送告警
  }
}, 60000) // 每分钟检查一次
```

### 4. 安全建议

1. **最小权限原则**：OSS/S3 使用 STS 临时凭证
2. **白名单机制**：只允许特定 MIME 类型
3. **内容验证**：必须验证 Magic Number
4. **访问控制**：私有文件使用签名 URL
5. **审计日志**：记录所有上传/删除操作

---

## 扩展性考虑

### 1. 新增存储类型

只需实现 `StorageProvider` 接口：

```typescript
// packages/storage/src/providers/minio.ts

export class MinIOStorageProvider implements StorageProvider {
  // 实现所有接口方法
}
```

### 2. 存储迁移工具

```typescript
// packages/storage/src/migration.ts

export class StorageMigrator {
  constructor(
    private source: StorageProvider,
    private target: StorageProvider
  ) {}

  async migrate(key: string): Promise<void> {
    const file = await this.source.get(key)
    const metadata = await this.source.getMetadata?.(key)
    
    await this.target.upload(file as Buffer, {
      key,
      mimeType: metadata?.mimeType,
      metadata: metadata?.metadata,
    })
  }
}
```

### 3. 存储适配器模式

支持多种存储类型共存：

```typescript
// 同时使用本地存储和云存储
const localStorage = new LocalStorageProvider(...)
const cloudStorage = new OSSStorageProvider(...)

// 小文件本地，大文件云端
const router = createStorageRouter({
  small: localStorage,    // < 5MB
  large: cloudStorage,    // >= 5MB
})
```

---

## 附录

### A. Magic Number 参考

| 文件类型 | Magic Number (Hex) | 说明 |
|---------|-------------------|------|
| JPEG | FF D8 FF | 开头3字节 |
| PNG | 89 50 4E 47 0D 0A 1A 0A | 开头8字节 |
| GIF | 47 49 46 38 | "GIF8" |
| WebP | 52 49 46 46 ... 57 45 42 50 | RIFF...WEBP |
| MP4 | xx xx xx xx 66 74 79 70 | ...ftyp |
| PDF | 25 50 44 46 | "%PDF" |
| ZIP | 50 4B 03 04 | PK.. |

### B. 常见 MIME 类型

```
image/jpeg          .jpg, .jpeg
image/png           .png
image/gif           .gif
image/webp          .webp
image/svg+xml       .svg
video/mp4           .mp4
video/webm          .webm
audio/mpeg          .mp3
audio/wav           .wav
application/pdf     .pdf
application/zip     .zip
```

### C. 参考资料

- [阿里云 OSS 文档](https://help.aliyun.com/product/31815.html)
- [AWS S3 文档](https://docs.aws.amazon.com/s3/)
- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)
- [file-type 库](https://github.com/sindresorhus/file-type)
- [OWASP 文件上传安全指南](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-12  
**维护者**: CMS Team
