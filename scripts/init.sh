#!/bin/bash

# CMS 项目目录结构初始化脚本

echo "🚀 开始创建CMS项目目录结构..."

# 创建apps目录
mkdir -p apps/web/app/{public,auth,admin,api}
mkdir -p apps/web/components/{ui,layout,article,editor,shared}
mkdir -p apps/web/lib
mkdir -p apps/web/hooks
mkdir -p apps/web/stores
mkdir -p apps/web/types
mkdir -p apps/web/public/{images,fonts}
mkdir -p apps/web/styles
mkdir -p apps/web/__tests__/{components,hooks,lib}

# 创建api目录
mkdir -p apps/api/src/{routes,controllers,services,models,middleware,utils,types,config,jobs}
mkdir -p apps/api/prisma/migrations
mkdir -p apps/api/uploads
mkdir -p apps/api/__tests__/{routes,services,middleware}

# 创建packages目录
mkdir -p packages/types/src
mkdir -p packages/utils/src
mkdir -p packages/config/src
mkdir -p packages/ui/src/components

# 创建docs子目录
mkdir -p docs/{api,database,development}

# 创建其他目录
mkdir -p scripts
mkdir -p tests/{e2e,fixtures}
mkdir -p docker/{nginx,monitoring/grafana}
mkdir -p .github/workflows
mkdir -p .husky
mkdir -p .vscode

echo "✅ 目录结构创建完成！"
echo ""
echo "📊 创建的目录统计："
echo "  apps/web:      $(find apps/web -type d | wc -l) 个目录"
echo "  apps/api:      $(find apps/api -type d | wc -l) 个目录"
echo "  packages:      $(find packages -type d | wc -l) 个目录"
echo "  docs:          $(find docs -type d | wc -l) 个目录"
echo ""
echo "📝 下一步："
echo "  1. 配置 package.json 和 tsconfig.json"
echo "  2. 配置环境变量 (.env)"
echo "  3. 开始开发 🚀"
