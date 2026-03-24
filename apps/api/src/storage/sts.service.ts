import ROAClient from '@alicloud/pop-core'

import type { STSCredentials } from './oss.provider'

interface AssumeRoleResult {
  Credentials: {
    AccessKeyId: string
    AccessKeySecret: string
    SecurityToken: string
    Expiration: string
  }
}

/**
 * STS 临时凭证服务
 * 
 * 用于获取阿里云 OSS 的临时访问凭证
 */
export class STSService {
  private client: ROAClient
  private roleArn: string
  private roleSessionName: string
  private durationSeconds: number

  constructor(config: {
    accessKeyId: string
    accessKeySecret: string
    roleArn: string
    region?: string
    roleSessionName?: string
    durationSeconds?: number
  }) {
    this.client = new ROAClient({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: `https://sts.${config.region || 'cn-hangzhou'}.aliyuncs.com`,
      apiVersion: '2015-04-01',
    })
    this.roleArn = config.roleArn
    this.roleSessionName = config.roleSessionName || 'cms-oss-session'
    this.durationSeconds = config.durationSeconds || 3600 // 默认 1 小时
  }

  /**
   * 获取 STS 临时凭证
   * 
   * @param policy - 可选的权限策略，默认为 OSS 完整权限
   * @returns STS 临时凭证
   */
  async getCredentials(policy?: object): Promise<STSCredentials> {
    try {
      const params = {
        RoleArn: this.roleArn,
        RoleSessionName: this.roleSessionName,
        DurationSeconds: this.durationSeconds,
        Policy: policy ? JSON.stringify(policy) : undefined,
      }

      const result = (await this.client.request('AssumeRole', params, 'POST')) as AssumeRoleResult

      return {
        accessKeyId: result.Credentials.AccessKeyId,
        accessKeySecret: result.Credentials.AccessKeySecret,
        securityToken: result.Credentials.SecurityToken,
        expiration: result.Credentials.Expiration,
        bucket: process.env['OSS_BUCKET_NAME'] || '',
        region: process.env['OSS_REGION'] || 'cn-hangzhou',
        endpoint: process.env['OSS_ENDPOINT'] || 'oss-cn-hangzhou.aliyuncs.com',
      }
    } catch (error) {
      console.error('Failed to get STS credentials:', error)
      throw new Error('获取 STS 临时凭证失败')
    }
  }

  /**
   * 获取只读权限的临时凭证
   */
  async getReadOnlyCredentials(bucket: string): Promise<STSCredentials> {
    const policy = {
      Version: '1',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['oss:GetObject', 'oss:GetObjectAcl'],
          Resource: [`acs:oss:*:*:${bucket}/*`],
        },
      ],
    }

    return this.getCredentials(policy)
  }

  /**
   * 获取上传权限的临时凭证
   */
  async getUploadCredentials(bucket: string): Promise<STSCredentials> {
    const policy = {
      Version: '1',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'oss:PutObject',
            'oss:GetObject',
            'oss:DeleteObject',
            'oss:ListParts',
            'oss:AbortMultipartUpload',
            'oss:ListMultipartUploads',
          ],
          Resource: [`acs:oss:*:*:${bucket}/*`],
        },
        {
          Effect: 'Allow',
          Action: ['oss:ListBucket'],
          Resource: [`acs:oss:*:*:${bucket}`],
        },
      ],
    }

    return this.getCredentials(policy)
  }
}
