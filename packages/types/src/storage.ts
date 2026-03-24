/**
 * 存储提供者接口和类型定义
 * 
 * @version 1.0.0
 * @created 2026-03-12
 */

/**
 * 存储提供者接口
 */
export interface StorageProvider {
  upload(file: Buffer, options?: UploadOptions): Promise<UploadResult>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getUrl(key: string, options?: UrlOptions): Promise<string>
  exists(key: string): Promise<boolean>
}

/**
 * 上传选项
 */
export interface UploadOptions {
  filename?: string
  mimeType?: string
  maxSize?: number
  allowedTypes?: string[]
  path?: string
}

/**
 * 上传结果
 */
export interface UploadResult {
  key: string
  url: string
  size: number
  mimeType: string
}

/**
 * URL 选项
 */
export interface UrlOptions {
  expiresIn?: number
  isPublic?: boolean
}
