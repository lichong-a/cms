import type { StorageProvider } from '@cms/types'

import { LocalStorageProvider } from './local.provider'
import { OSSStorageProvider, type OSSStorageConfig } from './oss.provider'

/**
 * 存储类型
 */
export type StorageType = 'local' | 'oss'

/**
 * 存储配置
 */
export interface StorageConfig {
  type: StorageType
  local?: {
    uploadDir: string
    baseUrl: string
  }
  oss?: OSSStorageConfig
}

/**
 * 存储提供者工厂
 * 
 * 根据配置创建对应的存储提供者
 */
export class StorageFactory {
  private static instance: StorageProvider | null = null
  private static currentType: StorageType | null = null

  /**
   * 获取存储提供者实例（单例）
   */
  static getProvider(config: StorageConfig): StorageProvider {
    if (this.instance && this.currentType === config.type) {
      return this.instance
    }

    this.instance = this.createProvider(config)
    this.currentType = config.type
    return this.instance
  }

  /**
   * 创建存储提供者
   */
  static createProvider(config: StorageConfig): StorageProvider {
    switch (config.type) {
      case 'local':
        if (!config.local) {
          throw new Error('本地存储配置缺失')
        }
        return new LocalStorageProvider(config.local.uploadDir, config.local.baseUrl)

      case 'oss':
        if (!config.oss) {
          throw new Error('OSS 存储配置缺失')
        }
        return new OSSStorageProvider(config.oss)

      default:
        throw new Error(`不支持的存储类型: ${config.type}`)
    }
  }

  /**
   * 从环境变量创建配置
   */
  static createConfigFromEnv(): StorageConfig {
    const storageType = (process.env['STORAGE_TYPE'] || 'local') as StorageType

    const config: StorageConfig = {
      type: storageType,
    }

    if (storageType === 'local') {
      config.local = {
        uploadDir: process.env['UPLOAD_DIR'] || './uploads',
        baseUrl: process.env['BASE_URL'] || 'http://localhost:3003',
      }
    } else if (storageType === 'oss') {
      const accessKeyId = process.env['OSS_ACCESS_KEY_ID']
      const accessKeySecret = process.env['OSS_ACCESS_KEY_SECRET']

      if (!accessKeyId || !accessKeySecret) {
        throw new Error('OSS 访问凭证缺失')
      }

      config.oss = {
        accessKeyId,
        accessKeySecret,
        bucket: process.env['OSS_BUCKET_NAME'] || '',
        region: process.env['OSS_REGION'] || 'cn-hangzhou',
        endpoint: process.env['OSS_ENDPOINT'] || 'oss-cn-hangzhou.aliyuncs.com',
      }
    }

    return config
  }

  /**
   * 重置实例（用于测试或切换存储类型）
   */
  static reset(): void {
    this.instance = null
    this.currentType = null
  }
}

/**
 * 获取默认存储提供者
 */
export function getDefaultStorage(): StorageProvider {
  const config = StorageFactory.createConfigFromEnv()
  return StorageFactory.getProvider(config)
}

export { LocalStorageProvider } from './local.provider'
export { OSSStorageProvider, type OSSStorageConfig, type STSCredentials } from './oss.provider'
export { STSService } from './sts.service'
