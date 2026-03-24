import { Router, type Request, type Response } from 'express'
import multer from 'multer'

import { LocalStorageProvider } from '../storage/local.provider'

const router: ReturnType<typeof Router> = Router()

// 配置 multer 使用内存存储
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 默认 10MB
  },
})

// 初始化存储提供者
const storage = new LocalStorageProvider(
  process.env['UPLOAD_DIR'] || './uploads',
  process.env['BASE_URL'] || 'http://localhost:3003'
)

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: 上传文件
 *     tags: [Upload]
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
 *       500:
 *         description: 服务器错误
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
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

    const result = await storage.upload(req.file.buffer, {
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      path: 'images/',
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
 * /upload/image:
 *   post:
 *     summary: 上传图片
 *     tags: [Upload]
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
 *                 description: 要上传的图片文件
 *     responses:
 *       200:
 *         description: 上传成功
 */
router.post('/upload/image', upload.single('file'), async (req: Request, res: Response) => {
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

    const result = await storage.upload(req.file.buffer, {
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      maxSize: 5 * 1024 * 1024, // 5MB for images
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      path: 'images/',
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

export default router
