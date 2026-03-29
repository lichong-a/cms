import { getApiOrigin, getApiV1BaseUrl } from '../api-base-url'
import { getAccessToken } from '../session'
import { OSSStorageProvider } from './oss-provider'
import type { StorageProvider, UploadOptions, UploadResult } from './types'

/**
 * 存储类型
 */
export type StorageType = 'local' | 'oss'

/**
 * 存储提供者工厂
 * 
 * 根据配置创建对应的存储提供者
 */
export class StorageFactory {
  private static providers: Map<StorageType, StorageProvider> = new Map()

  /**
   * 获取存储提供者
   */
  static getProvider(type: StorageType = 'oss'): StorageProvider {
    // 如果已创建，直接返回
    if (this.providers.has(type)) {
      return this.providers.get(type)!
    }

    // 创建新实例
    let provider: StorageProvider

    switch (type) {
      case 'oss':
        provider = new OSSStorageProvider()
        break

      case 'local':
        // 本地存储使用后端 API 上传
        provider = new LocalStorageProviderAPI()
        break

      default:
        throw new Error(`不支持的存储类型: ${type}`)
    }

    this.providers.set(type, provider)
    return provider
  }

  /**
   * 清除缓存的提供者
   */
  static reset(): void {
    this.providers.clear()
  }
}

/**
 * 本地存储提供者（通过后端 API）
 * 
 * 文件实际上传到后端，由后端保存到本地文件系统
 */
class LocalStorageProviderAPI implements StorageProvider {
  private apiBaseUrl = getApiV1BaseUrl()
  private apiOrigin = getApiOrigin()

  async upload(file: File, _options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    const token = getAccessToken()

    const response = await fetch(`${this.apiBaseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('上传失败')
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || '上传失败')
    }

    return result.data
  }

  async getUrl(key: string): Promise<string> {
    return `${this.apiOrigin}/uploads/${key}`
  }
}

/**
 * 获取默认存储提供者
 */
export function getDefaultStorage(type: StorageType = 'oss'): StorageProvider {
  return StorageFactory.getProvider(type)
}

// 导出类型和提供者
export * from './types'
export { OSSStorageProvider } from './oss-provider'
export { stsClient } from './sts-client'
