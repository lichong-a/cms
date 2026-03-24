import { Router, type Response } from 'express'

import { authenticate, type AuthRequest } from '../middleware/auth.middleware'
import { STSService } from '../storage/sts.service'

const router: ReturnType<typeof Router> = Router()

// STS 服务实例（单例）
let stsService: STSService | null = null

function getSTSService(): STSService {
  if (!stsService) {
    const accessKeyId = process.env['OSS_ACCESS_KEY_ID']
    const accessKeySecret = process.env['OSS_ACCESS_KEY_SECRET']
    const roleArn = process.env['OSS_ROLE_ARN']
    const region = process.env['OSS_REGION'] || 'cn-hangzhou'

    if (!accessKeyId || !accessKeySecret || !roleArn) {
      throw new Error('STS 配置缺失：请设置 OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_ROLE_ARN')
    }

    stsService = new STSService({
      accessKeyId,
      accessKeySecret,
      roleArn,
      region,
      durationSeconds: 3600, // 1 小时
    })
  }

  return stsService
}

/**
 * @swagger
 * /auth/sts:
 *   get:
 *     summary: 获取 OSS STS 临时凭证
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [read, write]
 *         description: 凭证类型（read=只读, write=上传）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessKeyId:
 *                       type: string
 *                     accessKeySecret:
 *                       type: string
 *                     securityToken:
 *                       type: string
 *                     expiration:
 *                       type: string
 *                     bucket:
 *                       type: string
 *                     region:
 *                       type: string
 *                     endpoint:
 *                       type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/auth/sts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const type = (req.query['type'] as string) || 'write'
    const bucket = process.env['OSS_BUCKET_NAME']

    if (!bucket) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'OSS_BUCKET_NAME 未配置',
        },
      })
      return
    }

    const service = getSTSService()
    const credentials =
      type === 'read' 
        ? await service.getReadOnlyCredentials(bucket)
        : await service.getUploadCredentials(bucket)

    res.json({
      success: true,
      data: credentials,
    })
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取 STS 凭证失败'
    console.error('STS error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'STS_ERROR',
        message,
      },
    })
    return
  }
})

export default router
