import type { STSCredentials } from './types'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3003'

/**
 * STS 客户端
 * 
 * 获取和管理阿里云 OSS 临时凭证
 */
export class STSClient {
  private static instance: STSClient | null = null
  private credentials: STSCredentials | null = null
  private credentialsPromise: Promise<STSCredentials> | null = null

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): STSClient {
    if (!this.instance) {
      this.instance = new STSClient()
    }
    return this.instance
  }

  /**
   * 获取 STS 临时凭证
   * 
   * 自动缓存凭证，在有效期内直接返回缓存的凭证
   */
  async getCredentials(type: 'read' | 'write' = 'write'): Promise<STSCredentials> {
    // 如果有缓存且未过期，直接返回
    if (this.credentials && !this.isExpired(this.credentials)) {
      return this.credentials
    }

    // 如果正在获取凭证，等待获取完成
    if (this.credentialsPromise) {
      return this.credentialsPromise
    }

    // 获取新凭证
    this.credentialsPromise = this.fetchCredentials(type)

    try {
      const credentials = await this.credentialsPromise
      this.credentials = credentials
      return credentials
    } finally {
      this.credentialsPromise = null
    }
  }

  /**
   * 从后端获取凭证
   */
  private async fetchCredentials(type: 'read' | 'write'): Promise<STSCredentials> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/sts?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('获取 STS 凭证失败')
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || '获取 STS 凭证失败')
    }

    return result.data
  }

  /**
   * 检查凭证是否过期
   * 
   * 提前 5 分钟认为过期，避免使用快过期的凭证
   */
  private isExpired(credentials: STSCredentials): boolean {
    const expiration = new Date(credentials.expiration)
    const now = new Date()
    const bufferMs = 5 * 60 * 1000 // 5 分钟缓冲
    return expiration.getTime() - now.getTime() < bufferMs
  }

  /**
   * 清除缓存的凭证
   */
  clearCredentials(): void {
    this.credentials = null
    this.credentialsPromise = null
  }
}

/**
 * 默认 STS 客户端实例
 */
export const stsClient = STSClient.getInstance()
