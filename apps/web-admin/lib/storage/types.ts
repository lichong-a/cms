/**
 * 存储提供者类型定义
 */

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
 * 上传结果
 */
export interface UploadResult {
  key: string
  url: string
  size: number
  mimeType: string
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
 * 存储提供者接口
 */
export interface StorageProvider {
  upload(file: File, options?: UploadOptions): Promise<UploadResult>
  getUrl(key: string): Promise<string>
}

/**
 * 分片上传信息
 */
export interface MultipartUpload {
  key: string
  uploadId: string
  parts: Array<{
    number: number
    etag: string
  }>
}
