import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as configService from '../services/config.service';
import { success } from '../utils/response';

const router: ReturnType<typeof Router> = Router();

// 验证 schemas
const updateConfigSchema = z.object({
  body: z.object({
    value: z.any(),
  }),
});

const themeSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  previewImage: z.string().optional(),
  config: z.object({
    colors: z.object({}).optional(),
    typography: z.object({}).optional(),
    spacing: z.object({}).optional(),
    borderRadius: z.object({}).optional(),
    shadows: z.object({}).optional(),
    animations: z.object({}).optional(),
  }).optional(),
  isBuiltin: z.boolean().optional(),
});

const menuSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  location: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    path: z.string().min(1),
    icon: z.string().optional(),
    children: z.array(z.object({
      label: z.string().min(1),
      path: z.string().min(1),
      icon: z.string().optional(),
    })).optional(),
  })),
  sortOrder: z.number().optional(),
});

// 系统配置
router.get('/', async (req, res, next) => {
  try {
    const { group } = req.query;
    const configs = await configService.getConfigs(group ? { group: group as string } : undefined);
    success(res, configs);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 根据分组获取配置（公开）
router.get('/group/:group', async (req, res, next) => {
  try {
    const configs = await configService.getConfigByGroup(req.params['group'] ?? '');
    success(res, configs);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 获取单个配置值（公开）
router.get('/:group/:key', async (req, res, next) => {
  try {
    const value = await configService.getConfigValue(req.params['group'] ?? '', req.params['key'] ?? '');
    success(res, { value });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 更新配置（需要认证）
router.put('/:group/:key', authenticate, validate(updateConfigSchema), async (req, res, next) => {
  try {
    const config = await configService.updateConfigValue(
      req.params['group'] ?? '',
      req.params['key'] ?? '',
      req.body.value
    );
    success(res, config);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 删除配置（需要认证）
router.delete('/:group/:key', authenticate, async (req, res, next) => {
  try {
    const result = await configService.deleteConfig(req.params['group'] ?? '', req.params['key'] ?? '');
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 批量更新配置（需要认证）
router.post('/batch', authenticate, async (req, res, next) => {
  try {
    const { configs } = req.body as { configs: Array<{ group: string; key: string; value: unknown }> };
    const results: Awaited<ReturnType<typeof configService.updateConfigValue>>[] = [];

    for (const config of configs) {
      const result = await configService.updateConfigValue(
        config.group,
        config.key,
        config.value
      );
      results.push(result);
    }

    success(res, { results });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 主题管理
router.get('/themes', async (_req, res, next) => {
  try {
    const themes = await configService.getThemes();
    success(res, themes);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 获取当前激活主题
router.get('/themes/active', async (_req, res, next) => {
  try {
    const theme = await configService.getActiveTheme();
    success(res, theme);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 创建主题（需要认证）
router.post('/themes', authenticate, validate(themeSchema), async (req, res, next) => {
  try {
    const theme = await configService.createTheme(req.body);
    success(res, theme);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 更新主题（需要认证）
router.put('/themes/:id', authenticate, validate(themeSchema), async (req, res, next) => {
  try {
    const theme = await configService.updateTheme(parseInt(req.params['id'] ?? '', 10), req.body);
    success(res, theme);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 删除主题（需要认证）
router.delete('/themes/:id', authenticate, async (req, res, next) => {
  try {
    const result = await configService.deleteTheme(parseInt(req.params['id'] ?? '', 10));
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 激活主题（需要认证）
router.put('/themes/:id/activate', authenticate, async (req, res, next) => {
  try {
    const theme = await configService.activateTheme(parseInt(req.params['id'] ?? '', 10));
    success(res, theme);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 菜单管理
router.get('/menus', async (req, res, next) => {
  try {
    const location = req.query['location'];
    const menus = await configService.getMenus(location as string | undefined);
    success(res, menus);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 获取特定位置的菜单
router.get('/menus/:location', async (req, res, next) => {
  try {
    const menus = await configService.getMenus(req.params['location'] ?? '');
    success(res, menus);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 创建菜单（需要认证）
router.post('/menus', authenticate, validate(menuSchema), async (req, res, next) => {
  try {
    const menu = await configService.createMenu(req.body);
    success(res, menu);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 更新菜单（需要认证）
router.put('/menus/:id', authenticate, validate(menuSchema), async (req, res, next) => {
  try {
    const menu = await configService.updateMenu(parseInt(req.params['id'] ?? '', 10), req.body);
    success(res, menu);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 保存菜单项（需要认证）
router.put('/menus/:id/items', authenticate, async (req, res, next) => {
  try {
    const { items } = req.body;
    const menu = await configService.saveMenu(parseInt(req.params['id'] ?? '', 10), items);
    success(res, menu);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 删除菜单（需要认证）
router.delete('/menus/:id', authenticate, async (req, res, next) => {
  try {
    const result = await configService.deleteMenu(parseInt(req.params['id'] ?? '', 10));
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

export default router;
