import { prisma } from './src/services/database.service';

async function test() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    const tenantId = 'default';
    
    const articles = await prisma.articles.count({ where: { tenant_id: tenantId, deleted_at: null } });
    console.log('Articles count:', articles);
    
    const categories = await prisma.categories.count({ where: { tenant_id: tenantId } });
    console.log('Categories count:', categories);
    
    const tags = await prisma.tags.count({ where: { tenant_id: tenantId } });
    console.log('Tags count:', tags);
    
    const users = await prisma.users.count({ where: { tenant_id: tenantId, deleted_at: null } });
    console.log('Users count:', users);
    
    const media = await prisma.media_files.count({ where: { tenant_id: tenantId, deleted_at: null } });
    console.log('Media count:', media);
    
    const recentArticles = await prisma.articles.findMany({
      where: { tenant_id: tenantId, deleted_at: null },
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
        users: { select: { username: true } }
      }
    });
    console.log('Recent articles:', recentArticles);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
