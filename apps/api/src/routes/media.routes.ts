import fs from 'fs';
import path from 'path';

import { Router } from 'express';
import multer from 'multer';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';
import { prisma } from '../services/database.service';
import { success } from '../utils/response';

const router: ReturnType<typeof Router> = Router();

// 配置 multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env['UPLOAD_DIR'] || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
  },
});

// 上传文件（需要认证）
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400, 'NO_FILE');
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 保存文件信息到数据库
    const media = await prisma.media_files.create({
      data: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        size: req.file.size,
        storage_path: req.file.path,
        uploader_id: req.user.userId,
        tenant_id: req.tenantId ?? 'default',
        metadata: {},
      },
    });

    success(res, media, 201);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 获取媒体列表（需要认证）
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
    const limit = parseInt((req.query['limit'] as string) ?? '20', 10) || 20;
    const skip = (page - 1) * limit;
    const tenantId = req.tenantId ?? 'default';

    const [media, total] = await Promise.all([
      prisma.media_files.findMany({
        where: { deleted_at: null, tenant_id: tenantId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.media_files.count({ where: { deleted_at: null, tenant_id: tenantId } }),
    ]);

    success(res, { media, total, page, limit });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 删除媒体（需要认证）
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const mediaId = parseInt(req.params['id'] ?? '', 10);
    const media = await prisma.media_files.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw createError('Media not found', 404, 'MEDIA_NOT_FOUND');
    }

    // 软删除
    await prisma.media_files.update({
      where: { id: mediaId },
      data: { deleted_at: new Date() },
    });

    // 删除文件
    if (fs.existsSync(media.storage_path)) {
      fs.unlinkSync(media.storage_path);
    }

    success(res, { id: media.id });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

export default router;
