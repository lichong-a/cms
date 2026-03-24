import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { loadEnv } from '../src/utils/load-env';

loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种基础数据...');

  // 1. 创建权限
  console.log('📋 创建权限...');
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'article:create' },
      update: {},
      create: { name: 'article:create', description: '创建文章' },
    }),
    prisma.permission.upsert({
      where: { name: 'article:read' },
      update: {},
      create: { name: 'article:read', description: '查看文章' },
    }),
    prisma.permission.upsert({
      where: { name: 'article:update' },
      update: {},
      create: { name: 'article:update', description: '更新文章' },
    }),
    prisma.permission.upsert({
      where: { name: 'article:delete' },
      update: {},
      create: { name: 'article:delete', description: '删除文章' },
    }),
    prisma.permission.upsert({
      where: { name: 'user:manage' },
      update: {},
      create: { name: 'user:manage', description: '管理用户' },
    }),
    prisma.permission.upsert({
      where: { name: 'config:manage' },
      update: {},
      create: { name: 'config:manage', description: '管理配置' },
    }),
  ]);
  console.log(`✅ 创建了 ${permissions.length} 个权限`);

  // 2. 创建角色
  console.log('👥 创建角色...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: '管理员' },
  });
  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: { name: 'editor', description: '编辑' },
  });
  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: { name: 'author', description: '作者' },
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: '普通用户' },
  });
  console.log('✅ 创建了 4 个角色');

  // 3. 创建管理员用户
  console.log('👤 创建管理员用户...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log('✅ 管理员用户创建完成 (admin@example.com / admin123)');

  // 4. 创建默认分类
  console.log('📁 创建默认分类...');
  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: {
      name: '技术',
      slug: 'tech',
      description: '技术相关文章',
      sortOrder: 1,
    },
  });
  const lifeCategory = await prisma.category.upsert({
    where: { slug: 'life' },
    update: {},
    create: {
      name: '生活',
      slug: 'life',
      description: '生活相关文章',
      sortOrder: 2,
    },
  });
  console.log('✅ 创建了 2 个默认分类');

  // 5. 创建默认标签
  console.log('🏷️  创建默认标签...');
  const jsTag = await prisma.tag.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: { name: 'JavaScript', slug: 'javascript' },
  });
  const tsTag = await prisma.tag.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: { name: 'TypeScript', slug: 'typescript' },
  });
  const reactTag = await prisma.tag.upsert({
    where: { slug: 'react' },
    update: {},
    create: { name: 'React', slug: 'react' },
  });
  console.log('✅ 创建了 3 个默认标签');

  // 6. 创建系统配置
  console.log('⚙️  创建系统配置...');
  const siteName = await prisma.systemConfig.upsert({
    where: {
      configGroup_configKey: {
        configGroup: 'basic',
        configKey: 'site_name',
      },
    },
    update: {},
    create: {
      configGroup: 'basic',
      configKey: 'site_name',
      configValue: '我的博客',
      displayName: '网站名称',
      inputType: 'text',
      sortOrder: 1,
      isActive: true,
    },
  });
  const siteDesc = await prisma.systemConfig.upsert({
    where: {
      configGroup_configKey: {
        configGroup: 'basic',
        configKey: 'site_description',
      },
    },
    update: {},
    create: {
      configGroup: 'basic',
      configKey: 'site_description',
      configValue: '一个现代化的内容管理系统',
      displayName: '网站描述',
      inputType: 'textarea',
      sortOrder: 2,
      isActive: true,
    },
  });
  console.log('✅ 创建了 2 个系统配置');

  console.log('\n🎉 基础数据播种完成！');
  console.log('========================================');
  console.log('📊 数据统计：');
  console.log(`  - 权限: ${permissions.length} 个`);
  console.log('  - 角色: 4 个 (admin, editor, author, user)');
  console.log('  - 管理员: admin@example.com / admin123');
  console.log('  - 分类: 2 个');
  console.log('  - 标签: 3 个');
  console.log('  - 系统配置: 2 项');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
