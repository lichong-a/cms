import crypto from 'crypto'

import type { StorageProvider, UploadOptions, UploadResult, UrlOptions } from '@cms/types'
import OSS from 'ali-oss'

/**
 * STS 临时凭证
 */
export interface STSCredentials {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
  bucket: string
  region: string
  endpoint: string
}

/**
 * OSS 存储提供者配置
 */
export interface OSSStorageConfig {
  accessKeyId?: string
  accessKeySecret?: string
  bucket: string
  region: string
  endpoint: string
  secure?: boolean
  timeout?: string | number
}

/**
 * 阿里云 OSS 存储提供者
 * 
 * 支持两种模式：
 * 1. 使用主账号凭证（不推荐用于前端）
 * 2. 使用 STS 临时凭证（推荐）
 */
export class OSSStorageProvider implements StorageProvider {
  private client: any
  private bucket: string
  private endpoint: string

  constructor(config: OSSStorageConfig | STSCredentials) {
    this.bucket = config.bucket
    this.endpoint = config.endpoint

    // 判断是否为 STS 凭证
    if ('securityToken' in config) {
      this.client = new OSS({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        stsToken: config.securityToken,
        bucket: config.bucket,
        region: config.region,
        secure: true,
      })
    } else {
      // 使用主账号凭证
      this.client = new OSS({
        accessKeyId: config.accessKeyId || process.env['OSS_ACCESS_KEY_ID'] || '',
        accessKeySecret: config.accessKeySecret || process.env['OSS_ACCESS_KEY_SECRET'] || '',
        bucket: config.bucket,
        region: config.region,
        secure: config.secure ?? true,
        timeout: config.timeout || '60s',
      })
    }
  }

  /**
   * 使用 STS 临时凭证创建客户端
   */
  static fromSTS(credentials: STSCredentials): OSSStorageProvider {
    return new OSSStorageProvider(credentials)
  }

  /**
   * 上传文件
   */
  async upload(file: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // 1. 验证文件类型（Magic Number）
      const mimeType = this.detectMimeType(file)
      if (options.allowedTypes && !options.allowedTypes.includes(mimeType)) {
        throw new Error(`不支持的文件类型: ${mimeType}`)
      }

      // 2. 验证文件大小
      if (options.maxSize && file.length > options.maxSize) {
        throw new Error(`文件大小超过限制: ${file.length} > ${options.maxSize}`)
      }

      // 3. 生成文件 key
      const ext = this.getExtension(options.filename || '', mimeType)
      const key = `${options.path || ''}${crypto.randomUUID()}${ext}`

      // 4. 上传到 OSS
      const result = await this.client.put(key, file, {
        headers: {
          'Content-Type': options.mimeType || mimeType,
        },
      })

      return {
        key,
        url: result.url,
        size: file.length,
        mimeType: options.mimeType || mimeType,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败'
      throw new Error(`OSS 上传失败: ${message}`)
    }
  }

  /**
   * 获取文件
   */
  async get(key: string): Promise<Buffer> {
    try {
      const result = await this.client.get(key)
      return result.content
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取文件失败'
      throw new Error(`OSS 获取文件失败: ${message}`)
    }
  }

  /**
   * 删除文件
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.delete(key)
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除文件失败'
      throw new Error(`OSS 删除文件失败: ${message}`)
    }
  }

  /**
   * 获取签名 URL
   * 
   * @param key - 文件 key
   * @param options - URL 选项
   * @returns 签名 URL
   */
  async getUrl(key: string, options?: UrlOptions): Promise<string> {
    try {
      // 如果是公开读的 bucket，直接返回公开 URL
      if (options?.isPublic) {
        return `https://${this.bucket}.${this.endpoint}/${key}`
      }

      // 生成签名 URL
      const expiresIn = options?.expiresIn || 3600 // 默认 1 小时
      const url = this.client.signatureUrl(key, {
        expires: expiresIn,
        method: 'GET',
      })

      return url
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取 URL 失败'
      throw new Error(`OSS 获取签名 URL 失败: ${message}`)
    }
  }

  /**
   * 生成上传用的签名 URL
   * 
   * @param key - 文件 key
   * @param expiresIn - 过期时间（秒）
   * @returns 上传用的签名 URL
   */
  async getUploadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const url = this.client.signatureUrl(key, {
        expires: expiresIn,
        method: 'PUT',
      })
      return url
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取上传 URL 失败'
      throw new Error(`OSS 获取上传签名 URL 失败: ${message}`)
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.client.head(key)
      return true
    } catch {
      return false
    }
  }

  /**
   * 初始化分片上传
   * 
   * @param key - 文件 key
   * @returns uploadId
   */
  async initMultipartUpload(key: string): Promise<string> {
    try {
      const result = await this.client.initMultipartUpload(key)
      return result.uploadId
    } catch (error) {
      const message = error instanceof Error ? error.message : '初始化分片上传失败'
      throw new Error(`OSS 初始化分片上传失败: ${message}`)
    }
  }

  /**
   * 上传分片
   */
  async uploadPart(
    key: string,
    uploadId: string,
    partNumber: number,
    data: Buffer
  ): Promise<{ number: number; etag: string }> {
    try {
      const result = await this.client.uploadPart(key, uploadId, partNumber, data)
      return {
        number: partNumber,
        etag: result.etag,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传分片失败'
      throw new Error(`OSS 上传分片失败: ${message}`)
    }
  }

  /**
   * 完成分片上传
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ number: number; etag: string }>
  ): Promise<UploadResult> {
    try {
      const result = await this.client.completeMultipartUpload(key, uploadId, parts)
      
      return {
        key,
        url: result.url,
        size: 0, // 分片上传无法获取精确大小
        mimeType: 'application/octet-stream',
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '完成分片上传失败'
      throw new Error(`OSS 完成分片上传失败: ${message}`)
    }
  }

  /**
   * 取消分片上传
   */
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    try {
      await this.client.abortMultipartUpload(key, uploadId)
    } catch (error) {
      console.error('取消分片上传失败:', error)
    }
  }

  /**
   * 检测文件的 MIME 类型（Magic Number 检测）
   */
  private detectMimeType(file: Buffer): string {
    if (file.length < 4) return 'application/octet-stream'

    const header = file.slice(0, 16)

    // JPEG: FF D8 FF
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return 'image/jpeg'
    }
    // PNG: 89 50 4E 47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
      return 'image/png'
    }
    // GIF: 47 49 46 38
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) {
      return 'image/gif'
    }
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
      return 'image/webp'
    }
    // PDF: 25 50 44 46
    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
      return 'application/pdf'
    }
    // ZIP: 50 4B 03 04
    if (header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04) {
      return 'application/zip'
    }

    return 'application/octet-stream'
  }

  /**
   * 获取文件扩展名
   */
  private getExtension(filename: string, mimeType: string): string {
    const ext = filename.split('.').pop()
    if (ext && ext !== filename) {
      return `.${ext}`
    }

    // 根据 MIME 类型推断
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
    }

    return mimeToExt[mimeType] || ''
  }
}
