#!/usr/bin/env tsx

/**
 * OSS 上传测试脚本
 * 
 * 用于验证阿里云 OSS 存储提供者功能
 * 
 * 使用方法：
 * 1. 复制 .env.oss.example 到 .env 并填入真实的 OSS 配置
 * 2. 运行: pnpm tsx scripts/test-oss.ts
 */

import { OSSStorageProvider } from '../storage/oss.provider'
import { STSService } from '../storage/sts.service'
import { loadEnv } from '../utils/load-env'

loadEnv()

async function testOSSUpload() {
  console.log('🧪 开始测试 OSS 上传功能...\n')

  // 1. 检查环境变量
  console.log('1️⃣  检查环境变量...')
  const requiredEnvVars = [
    'OSS_ACCESS_KEY_ID',
    'OSS_ACCESS_KEY_SECRET',
    'OSS_ENDPOINT',
    'OSS_BUCKET_NAME',
    'OSS_REGION',
  ]

  const missingVars = requiredEnvVars.filter((v) => !process.env[v])
  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:', missingVars.join(', '))
    console.log('\n请复制 .env.oss.example 到 .env 并填入真实配置')
    process.exit(1)
  }
  console.log('✅ 环境变量检查通过\n')

  // 2. 测试基本上传
  console.log('2️⃣  测试基本文件上传...')
  try {
    const accessKeyId = process.env['OSS_ACCESS_KEY_ID']
    const accessKeySecret = process.env['OSS_ACCESS_KEY_SECRET']

    if (!accessKeyId || !accessKeySecret) {
      throw new Error('OSS_ACCESS_KEY_ID 或 OSS_ACCESS_KEY_SECRET 未配置')
    }

    const ossProvider = new OSSStorageProvider({
      accessKeyId,
      accessKeySecret,
      bucket: process.env['OSS_BUCKET_NAME']!,
      region: process.env['OSS_REGION']!,
      endpoint: process.env['OSS_ENDPOINT']!,
    })

    // 创建一个测试图片文件（1x1 像素 PNG）
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    const result = await ossProvider.upload(testImageBuffer, {
      filename: 'test-image.png',
      mimeType: 'image/png',
      maxSize: 1 * 1024 * 1024, // 1MB
      path: 'test/',
    })

    console.log('✅ 上传成功:')
    console.log('   - Key:', result.key)
    console.log('   - URL:', result.url)
    console.log('   - Size:', result.size, 'bytes')
    console.log('   - MIME Type:', result.mimeType)

    // 测试获取 URL
    const signedUrl = await ossProvider.getUrl(result.key)
    console.log('   - 签名 URL:', signedUrl)

    // 测试文件存在性检查
    const exists = await ossProvider.exists(result.key)
    console.log('   - 文件存在:', exists)

    // 测试删除文件
    await ossProvider.delete(result.key)
    console.log('   - 文件已删除')

    const existsAfterDelete = await ossProvider.exists(result.key)
    console.log('   - 删除后文件存在:', existsAfterDelete, '\n')
  } catch (error) {
    console.error('❌ 基本上传测试失败:', error)
    process.exit(1)
  }

  // 3. 测试 STS 临时凭证（如果配置了 RAM 角色）
  console.log('3️⃣  测试 STS 临时凭证...')
  if (process.env['OSS_ROLE_ARN']) {
    try {
      const stsService = new STSService({
        accessKeyId: process.env['OSS_ACCESS_KEY_ID']!,
        accessKeySecret: process.env['OSS_ACCESS_KEY_SECRET']!,
        roleArn: process.env['OSS_ROLE_ARN']!,
        ...(process.env['OSS_REGION'] ? { region: process.env['OSS_REGION'] } : {}),
        durationSeconds: 3600,
      })

      const credentials = await stsService.getCredentials()
      console.log('✅ STS 凭证获取成功:')
      console.log('   - Access Key ID:', credentials.accessKeyId.substring(0, 8) + '...')
      console.log('   - 过期时间:', credentials.expiration, '\n')

      // 使用 STS 凭证上传
      console.log('4️⃣  测试使用 STS 凭证上传...')
      const ossProviderWithSTS = OSSStorageProvider.fromSTS(credentials)

      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      )

      const result = await ossProviderWithSTS.upload(testImageBuffer, {
        filename: 'test-sts-image.png',
        mimeType: 'image/png',
        path: 'test/',
      })

      console.log('✅ STS 上传成功:')
      console.log('   - Key:', result.key)
      console.log('   - URL:', result.url, '\n')

      // 清理测试文件
      await ossProviderWithSTS.delete(result.key)
    } catch (error) {
      console.error('❌ STS 测试失败:', error)
      console.log('   提示: 请确保已正确配置 OSS_ROLE_ARN')
    }
  } else {
    console.log('⚠️  跳过 STS 测试（未配置 OSS_ROLE_ARN）\n')
  }

  console.log('🎉 所有测试完成！')
}

// 运行测试
testOSSUpload().catch((error) => {
  console.error('测试失败:', error)
  process.exit(1)
})
