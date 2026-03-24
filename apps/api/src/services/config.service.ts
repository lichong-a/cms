import { createError } from '../middleware/error.middleware';

import { cacheGet, cacheSet, cacheDelPattern } from './cache.service';
import { prisma } from './database.service';

export interface GetConfigInput {
  group?: string;
}

// 核心配置方法
export const getConfigs = async (input?: GetConfigInput) => {
  const { group } = input || {};

  const where: any = { is_active: true };
  if (group) {
    where.config_group = group;
  }

  const configs = await prisma.system_configs.findMany({
    where,
    orderBy: [{ config_group: 'asc' }, { sort_order: 'asc' }],
  });

  // 按组分组
  const groupedConfigs = configs.reduce((acc, config) => {
    const groupName = config.config_group;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(config);
    return acc;
  }, {} as Record<string, typeof configs>);

  return groupedConfigs;
};

export const getConfigByGroup = async (group: string) => {
  const cacheKey = `config:${group}`;
  const cached = await cacheGet<Record<string, any>>(cacheKey);

  if (cached) {
    return cached;
  }

  const configs = await prisma.system_configs.findMany({
    where: {
      config_group: group,
      is_active: true,
    },
    orderBy: { sort_order: 'asc' },
  });

  // 转换为键值对
  const result = configs.reduce((acc, config) => {
    acc[config.config_key] = config.config_value;
    return acc;
  }, {} as Record<string, any>);

  // 缓存 1 小时
  await cacheSet(cacheKey, result, 3600);

  return result;
};

export const getConfigValue = async (group: string, key: string) => {
  const cacheKey = `config:${group}:${key}`;
  const cached = await cacheGet<any>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  const config = await prisma.system_configs.findUnique({
    where: {
      config_group_config_key: {
        config_group: group,
        config_key: key,
      },
    },
  });

  if (!config || !config.is_active) {
    throw createError('Config not found', 404, 'CONFIG_NOT_FOUND');
  }

  // 缓存 1 小时
  await cacheSet(cacheKey, config.config_value, 3600);

  return config.config_value;
};

export const updateConfigValue = async (group: string, key: string, value: any) => {
  const config = await prisma.system_configs.findUnique({
    where: {
      config_group_config_key: {
        config_group: group,
        config_key: key,
      },
    },
  });

  if (!config) {
    throw createError('Config not found', 404, 'CONFIG_NOT_FOUND');
  }

  const updated = await prisma.system_configs.update({
    where: {
      config_group_config_key: {
        config_group: group,
        config_key: key,
      },
    },
    data: {
      config_value: value,
    },
  });

  // 清除缓存
  await cacheDelPattern(`config:${group}*`);

  return updated;
};

export const deleteConfig = async (group: string, key: string) => {
  const config = await prisma.system_configs.findUnique({
    where: {
      config_group_config_key: {
        config_group: group,
        config_key: key,
      },
    },
  });

  if (!config) {
    throw createError('Config not found', 404, 'CONFIG_NOT_FOUND');
  }

  await prisma.system_configs.delete({
    where: {
      config_group_config_key: {
        config_group: group,
        config_key: key,
      },
    },
  });

  // 清除缓存
  await cacheDelPattern(`config:${group}*`);

  return { success: true };
};

// 主题管理方法
export const getThemes = async () => {
  const themes = await prisma.themes.findMany({
    orderBy: [{ is_active: 'desc' }, { name: 'asc' }],
  });
  return themes;
};

export const getActiveTheme = async () => {
  const theme = await prisma.themes.findFirst({
    where: { is_active: true },
  });
  return theme;
};

export const activateTheme = async (themeId: number) => {
  // 先将所有主题设为非活跃
  await prisma.themes.updateMany({
    where: { is_active: true },
    data: { is_active: false },
  });

  // 激活指定主题
  const updatedTheme = await prisma.themes.update({
    where: { id: themeId },
    data: { is_active: true },
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return updatedTheme;
};

export const createTheme = async (themeData: any) => {
  const theme = await prisma.themes.create({
    data: themeData,
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return theme;
};

export const updateTheme = async (themeId: number, themeData: any) => {
  const theme = await prisma.themes.update({
    where: { id: themeId },
    data: themeData,
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return theme;
};

export const deleteTheme = async (themeId: number) => {
  await prisma.themes.delete({
    where: { id: themeId },
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return { success: true };
};

// 菜单管理方法
export const getMenus = async (location?: string) => {
  const where: any = { is_active: true };
  if (location) {
    where.location = location;
  }

  const menus = await prisma.menus.findMany({
    where,
    orderBy: { sort_order: 'asc' },
  });
  return menus;
};

export const saveMenu = async (menuId: number, items: any) => {
  const menu = await prisma.menus.update({
    where: { id: menuId },
    data: { items },
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return menu;
};

export const createMenu = async (menuData: any) => {
  const menu = await prisma.menus.create({
    data: menuData,
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return menu;
};

export const updateMenu = async (menuId: number, menuData: any) => {
  const menu = await prisma.menus.update({
    where: { id: menuId },
    data: menuData,
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return menu;
};

export const deleteMenu = async (menuId: number) => {
  await prisma.menus.delete({
    where: { id: menuId },
  });

  // 清除配置缓存
  await cacheDelPattern('config:*');

  return { success: true };
};

export default {
  getConfigs,
  getConfigByGroup,
  getConfigValue,
  updateConfigValue,
  deleteConfig,
  getThemes,
  getActiveTheme,
  activateTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  getMenus,
  saveMenu,
  createMenu,
  updateMenu,
  deleteMenu,
};
