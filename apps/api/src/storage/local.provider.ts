import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

import type { StorageProvider, UploadOptions, UploadResult, UrlOptions } from '@cms/types'

/**
 * 本地存储提供者
 * 
 * 实现基于本地文件系统的存储功能
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string
  private baseUrl: string

  constructor(uploadDir: string, baseUrl: string) {
    this.uploadDir = uploadDir
    this.baseUrl = baseUrl
  }

  async upload(file: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    // 1. 验证文件类型（Magic Number）
    const mimeType = this.detectMimeType(file)
    if (options.allowedTypes && !options.allowedTypes.includes(mimeType)) {
      throw new Error(`不支持的文件类型: ${mimeType}`)
    }

    // 2. 验证文件大小
    if (options.maxSize && file.length > options.maxSize) {
      throw new Error(`文件大小超过限制: ${file.length} > ${options.maxSize}`)
    }

    // 3. 生成随机文件名
    const ext = path.extname(options.filename || '')
    const key = `${options.path || ''}${crypto.randomUUID()}${ext}`

    // 4. 确保目录存在
    const fullPath = path.join(this.uploadDir, key)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })

    // 5. 写入文件
    await fs.writeFile(fullPath, file)

    return {
      key,
      url: `${this.baseUrl}/uploads/${key}`,
      size: file.length,
      mimeType,
    }
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(path.join(this.uploadDir, key))
  }

  async delete(key: string): Promise<void> {
    await fs.unlink(path.join(this.uploadDir, key))
  }

  async getUrl(key: string, _options?: UrlOptions): Promise<string> {
    return `${this.baseUrl}/uploads/${key}`
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.uploadDir, key))
      return true
    } catch {
      return false
    }
  }

  /**
   * 检测文件的 MIME 类型（Magic Number 检测）
   */
  private detectMimeType(file: Buffer): string {
    // Magic Number 检测
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
}
