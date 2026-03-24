import { PrismaClient, ArticleStatus, CommentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { loadEnv } from '../src/utils/load-env';

loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // ========================================
  // 0. 创建默认租户
  // ========================================
  console.log('🏠 创建默认租户...');
  await prisma.tenants.upsert({
    where: { id: 'default' },
    update: {
      name: 'Default Tenant',
      slug: 'default',
      updated_at: new Date(),
    },
    create: {
      id: 'default',
      name: 'Default Tenant',
      slug: 'default',
      updated_at: new Date(),
    },
  });

  // ========================================
  // 1. 创建权限
  // ========================================
  console.log('📋 创建权限...');
  const permissions = await Promise.all([
    prisma.permissions.upsert({
      where: { name: 'article:create' },
      update: { updated_at: new Date() },
      create: {
        name: 'article:create',
        description: '创建文章',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'article:read' },
      update: { updated_at: new Date() },
      create: {
        name: 'article:read',
        description: '查看文章',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'article:update' },
      update: { updated_at: new Date() },
      create: {
        name: 'article:update',
        description: '更新文章',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'article:delete' },
      update: { updated_at: new Date() },
      create: {
        name: 'article:delete',
        description: '删除文章',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'article:publish' },
      update: { updated_at: new Date() },
      create: {
        name: 'article:publish',
        description: '发布文章',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'media:upload' },
      update: { updated_at: new Date() },
      create: {
        name: 'media:upload',
        description: '上传媒体文件',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'media:delete' },
      update: { updated_at: new Date() },
      create: {
        name: 'media:delete',
        description: '删除媒体文件',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'user:manage' },
      update: { updated_at: new Date() },
      create: {
        name: 'user:manage',
        description: '管理用户',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'role:manage' },
      update: { updated_at: new Date() },
      create: {
        name: 'role:manage',
        description: '管理角色',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'config:manage' },
      update: { updated_at: new Date() },
      create: {
        name: 'config:manage',
        description: '管理配置',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'comment:moderate' },
      update: { updated_at: new Date() },
      create: {
        name: 'comment:moderate',
        description: '审核评论',
        updated_at: new Date(),
      },
    }),
    prisma.permissions.upsert({
      where: { name: 'theme:manage' },
      update: { updated_at: new Date() },
      create: {
        name: 'theme:manage',
        description: '管理主题',
        updated_at: new Date(),
      },
    }),
  ]);

  console.log(`✅ 创建了 ${permissions.length} 个权限`);

  // ========================================
  // 2. 创建角色
  // ========================================
  console.log('👥 创建角色...');
  
  // 管理员角色
  const adminRole = await prisma.roles.upsert({
    where: { name: 'admin' },
    update: { updated_at: new Date() },
    create: {
      name: 'admin',
      description: '系统管理员，拥有所有权限',
      updated_at: new Date(),
    },
  });

  // 编辑角色
  const editorRole = await prisma.roles.upsert({
    where: { name: 'editor' },
    update: { updated_at: new Date() },
    create: {
      name: 'editor',
      description: '编辑人员，可以管理内容',
      updated_at: new Date(),
    },
  });

  // 作者角色
  const authorRole = await prisma.roles.upsert({
    where: { name: 'author' },
    update: { updated_at: new Date() },
    create: {
      name: 'author',
      description: '作者，可以创建和管理自己的文章',
      updated_at: new Date(),
    },
  });

  // 普通用户角色
  const userRole = await prisma.roles.upsert({
    where: { name: 'user' },
    update: { updated_at: new Date() },
    create: {
      name: 'user',
      description: '普通用户',
      updated_at: new Date(),
    },
  });

  console.log('✅ 创建了 4 个角色');

  // ========================================
  // 3. 分配角色权限
  // ========================================
  console.log('🔑 分配角色权限...');

  // 管理员拥有所有权限
  for (const permission of permissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: permission.id,
      },
    });
  }

  // 编辑权限
  const editorPermissions = permissions.filter(p => 
    p.name.startsWith('article:') || 
    p.name.startsWith('media:') || 
    p.name === 'comment:moderate'
  );
  for (const permission of editorPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: editorRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: editorRole.id,
        permission_id: permission.id,
      },
    });
  }

  // 作者权限
  const authorPermissions = permissions.filter(p => 
    ['article:create', 'article:read', 'article:update', 'media:upload'].includes(p.name)
  );
  for (const permission of authorPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: authorRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: authorRole.id,
        permission_id: permission.id,
      },
    });
  }

  // 普通用户权限
  const userPermissions = permissions.filter(p => p.name === 'article:read');
  for (const permission of userPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: userRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: userRole.id,
        permission_id: permission.id,
      },
    });
  }

  console.log('✅ 角色权限分配完成');

  // ========================================
  // 4. 创建管理员用户
  // ========================================
  console.log('👤 创建管理员用户...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.users.upsert({
    where: { tenant_id_email: { tenant_id: 'default', email: 'admin@example.com' } },
    update: { updated_at: new Date() },
    create: {
      tenant_id: 'default',
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      avatarUrl: null,
      isActive: true,
      metadata: {
        nickname: '管理员',
        bio: '系统管理员',
      },
      updated_at: new Date(),
    },
  });

  // 分配管理员角色
  await prisma.user_roles.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: adminRole.id,
    },
  });

  console.log('✅ 管理员用户创建完成 (admin@example.com / admin123)');

  // ========================================
  // 5. 创建默认分类
  // ========================================
  console.log('📁 创建默认分类...');
  
  await prisma.categories.upsert({
    where: { tenant_id_slug: { tenant_id: 'default', slug: 'tech' } },
    update: { name: '技术', description: '技术相关文章', updated_at: new Date() },
    create: {
      name: '技术',
      slug: 'tech',
      description: '技术相关文章',
      sort_order: 1,
      tenant_id: 'default',
      updated_at: new Date(),
    },
  });

  await prisma.categories.upsert({
    where: { tenant_id_slug: { tenant_id: 'default', slug: 'life' } },
    update: { name: '生活', description: '生活相关文章', updated_at: new Date() },
    create: {
      name: '生活',
      slug: 'life',
      description: '生活相关文章',
      sort_order: 2,
      tenant_id: 'default',
      updated_at: new Date(),
    },
  });

  await prisma.categories.upsert({
    where: { tenant_id_slug: { tenant_id: 'default', slug: 'thoughts' } },
    update: { name: '思考', description: '思考与感悟', updated_at: new Date() },
    create: {
      name: '思考',
      slug: 'thoughts',
      description: '思考与感悟',
      sort_order: 3,
      tenant_id: 'default',
      updated_at: new Date(),
    },
  });

  console.log('✅ 创建了 3 个默认分类');

  // ========================================
  // 6. 创建默认标签
  // ========================================
  console.log('🏷️  创建默认标签...');
  
  const tagData = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'React', slug: 'react' },
    { name: 'Vue', slug: 'vue' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: '数据库', slug: 'database' },
    { name: '前端', slug: 'frontend' },
    { name: '后端', slug: 'backend' },
  ];

  for (const tag of tagData) {
    await prisma.tags.upsert({
      where: { tenant_id_slug: { tenant_id: 'default', slug: tag.slug } },
      update: { name: tag.name, updated_at: new Date() },
      create: {
        name: tag.name,
        slug: tag.slug,
        tenant_id: 'default',
        updated_at: new Date(),
      },
    });
  }

  console.log(`✅ 创建了 ${tagData.length} 个默认标签`);

  console.log('\n🎉 种子数据播种完成！');
  console.log('='.repeat(50));
  console.log('📊 数据统计：');
  console.log(`  - 权限: ${permissions.length} 个`);
  console.log('  - 角色: 4 个 (admin, editor, author, user)');
  console.log('  - 管理员: admin@example.com / admin123');
  console.log('  - 分类: 3 个');
  console.log(`  - 标签: ${tagData.length} 个`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ 种子数据播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
