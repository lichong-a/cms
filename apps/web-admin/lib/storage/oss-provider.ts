import OSS from 'ali-oss'

import { stsClient } from './sts-client'
import type { StorageProvider, UploadOptions, UploadResult, STSCredentials } from './types'

/**
 * OSS 存储提供者（前端）
 * 
 * 使用 STS 临时凭证上传文件到阿里云 OSS
 */
export class OSSStorageProvider implements StorageProvider {
  private client: OSS | null = null
  private credentials: STSCredentials | null = null

  /**
   * 初始化 OSS 客户端
   * 
   * 使用 STS 临时凭证
   */
  private async initClient(): Promise<OSS> {
    // 如果已有客户端且凭证未过期，直接返回
    if (this.client && this.credentials) {
      return this.client
    }

    // 获取 STS 凭证
    this.credentials = await stsClient.getCredentials('write')

    // 创建 OSS 客户端
    this.client = new OSS({
      accessKeyId: this.credentials.accessKeyId,
      accessKeySecret: this.credentials.accessKeySecret,
      stsToken: this.credentials.securityToken,
      bucket: this.credentials.bucket,
      region: this.credentials.region,
      secure: true,
    })

    return this.client
  }

  /**
   * 上传文件
   */
  async upload(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const client = await this.initClient()

      // 验证文件类型
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`不支持的文件类型: ${file.type}`)
      }

      // 验证文件大小
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`文件大小超过限制: ${file.size} > ${options.maxSize}`)
      }

      // 生成文件 key
      const key = this.generateKey(file, options.path)

      // 上传文件
      const result = await client.put(key, file, {
        headers: {
          'Content-Type': file.type,
        },
      })

      return {
        key,
        url: result.url,
        size: file.size,
        mimeType: file.type,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败'
      throw new Error(`OSS 上传失败: ${message}`)
    }
  }

  /**
   * 获取文件访问 URL
   */
  async getUrl(key: string): Promise<string> {
    try {
      const client = await this.initClient()
      const url = client.signatureUrl(key, {
        expires: 3600, // 1 小时
        method: 'GET',
      })
      return url
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取 URL 失败'
      throw new Error(`获取签名 URL 失败: ${message}`)
    }
  }

  /**
   * 生成文件 key
   */
  private generateKey(file: File, path?: string): string {
    const ext = file.name.split('.').pop() || ''
    const randomId = crypto.randomUUID()
    return `${path || 'uploads/'}${randomId}.${ext}`
  }

  /**
   * 大文件分片上传（可选）
   */
  async multipartUpload(
    file: File,
    options: UploadOptions = {},
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    try {
      const client = await this.initClient()

      // 验证
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`不支持的文件类型: ${file.type}`)
      }

      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`文件大小超过限制: ${file.size} > ${options.maxSize}`)
      }

      // 生成文件 key
      const key = this.generateKey(file, options.path)

      // 分片上传
      const result = await client.multipartUpload(key, file, {
        progress: (_p: number, _checkpoint: any, res: any) => {
          if (onProgress && res) {
            const percent = Math.floor(res.percent * 100)
            onProgress(percent)
          }
        },
      })

      return {
        key: result.name,
        url: (result.res as any).requestUrls?.[0]?.split('?')[0] || `https://${process.env['OSS_BUCKET']}.${process.env['OSS_REGION']}.aliyuncs.com/${result.name}`,
        size: file.size,
        mimeType: file.type,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '分片上传失败'
      throw new Error(`OSS 分片上传失败: ${message}`)
    }
  }
}

/**
 * 默认 OSS 存储提供者实例
 */
export const ossStorageProvider = new OSSStorageProvider()
