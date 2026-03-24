import { Router, type Response } from 'express'
import multer from 'multer'

import { authenticate, type AuthRequest } from '../middleware/auth.middleware'
import { OSSStorageProvider } from '../storage/oss.provider'

const router: ReturnType<typeof Router> = Router()

// 配置 multer 使用内存存储
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
})

/**
 * @swagger
 * /upload/oss:
 *   post:
 *     summary: 上传文件到 OSS
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件
 *               path:
 *                 type: string
 *                 description: 存储路径前缀（可选）
 *     responses:
 *       200:
 *         description: 上传成功
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
 *                     key:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: number
 *                     mimeType:
 *                       type: string
 *       400:
 *         description: 请求错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/upload/oss', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: '没有上传文件',
        },
      })
      return
    }

    // 初始化 OSS 存储提供者
    const ossProvider = new OSSStorageProvider({
      bucket: process.env['OSS_BUCKET_NAME'] || '',
      region: process.env['OSS_REGION'] || 'cn-hangzhou',
      endpoint: process.env['OSS_ENDPOINT'] || 'oss-cn-hangzhou.aliyuncs.com',
    })

    const result = await ossProvider.upload(req.file.buffer, {
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      maxSize: 100 * 1024 * 1024, // 100MB
      path: req.body['path'] || 'uploads/',
    })

    res.json({
      success: true,
      data: result,
    })
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败'
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message,
      },
    })
    return
  }
})

/**
 * @swagger
 * /upload/oss/url:
 *   post:
 *     summary: 获取 OSS 上传签名 URL
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: 文件存储路径
 *               expiresIn:
 *                 type: number
 *                 description: URL 过期时间（秒），默认 3600
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
 *                     uploadUrl:
 *                       type: string
 *                     key:
 *                       type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/upload/oss/url', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.body['key']
    const expiresIn = req.body['expiresIn'] || 3600

    if (!key) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_KEY',
          message: '缺少文件 key',
        },
      })
      return
    }

    const ossProvider = new OSSStorageProvider({
      bucket: process.env['OSS_BUCKET_NAME'] || '',
      region: process.env['OSS_REGION'] || 'cn-hangzhou',
      endpoint: process.env['OSS_ENDPOINT'] || 'oss-cn-hangzhou.aliyuncs.com',
    })

    const uploadUrl = await ossProvider.getUploadUrl(key, expiresIn)

    res.json({
      success: true,
      data: {
        uploadUrl,
        key,
      },
    })
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取上传 URL 失败'
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_UPLOAD_URL_FAILED',
        message,
      },
    })
    return
  }
})

/**
 * @swagger
 * /upload/oss/multipart/init:
 *   post:
 *     summary: 初始化分片上传
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: 文件存储路径
 *     responses:
 *       200:
 *         description: 初始化成功
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
 *                     uploadId:
 *                       type: string
 *                     key:
 *                       type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/upload/oss/multipart/init', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.body['key']

    if (!key) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_KEY',
          message: '缺少文件 key',
        },
      })
      return
    }

    const ossProvider = new OSSStorageProvider({
      bucket: process.env['OSS_BUCKET_NAME'] || '',
      region: process.env['OSS_REGION'] || 'cn-hangzhou',
      endpoint: process.env['OSS_ENDPOINT'] || 'oss-cn-hangzhou.aliyuncs.com',
    })

    const uploadId = await ossProvider.initMultipartUpload(key)

    res.json({
      success: true,
      data: {
        uploadId,
        key,
      },
    })
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : '初始化分片上传失败'
    res.status(500).json({
      success: false,
      error: {
        code: 'INIT_MULTIPART_FAILED',
        message,
      },
    })
    return
  }
})

/**
 * @swagger
 * /upload/oss/multipart/complete:
 *   post:
 *     summary: 完成分片上传
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - uploadId
 *               - parts
 *             properties:
 *               key:
 *                 type: string
 *                 description: 文件存储路径
 *               uploadId:
 *                 type: string
 *                 description: 上传 ID
 *               parts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     number:
 *                       type: number
 *                     etag:
 *                       type: string
 *     responses:
 *       200:
 *         description: 上传完成
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
 *                     key:
 *                       type: string
 *                     url:
 *                       type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/upload/oss/multipart/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { key, uploadId, parts } = req.body

    if (!key || !uploadId || !parts) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: '缺少必要参数',
        },
      })
      return
    }

    const ossProvider = new OSSStorageProvider({
      bucket: process.env['OSS_BUCKET_NAME'] || '',
      region: process.env['OSS_REGION'] || 'cn-hangzhou',
      endpoint: process.env['OSS_ENDPOINT'] || 'oss-cn-hangzhou.aliyuncs.com',
    })

    const result = await ossProvider.completeMultipartUpload(key, uploadId, parts)

    res.json({
      success: true,
      data: result,
    })
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : '完成分片上传失败'
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_MULTIPART_FAILED',
        message,
      },
    })
    return
  }
})

export default router
