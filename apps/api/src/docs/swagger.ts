import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'CMS API',
    version: '1.0.0',
    description: '内容管理系统 API 文档',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3003/api/v1',
      description: '开发服务器',
    },
    {
      url: 'https://api.example.com/api/v1',
      description: '生产服务器',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'ERROR_CODE',
              },
              message: {
                type: 'string',
                example: 'Error message',
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'user_123',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          username: {
            type: 'string',
            example: 'johndoe',
          },
          role: {
            type: 'string',
            enum: ['admin', 'editor', 'author'],
            example: 'author',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Article: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'article_123',
          },
          title: {
            type: 'string',
            example: '文章标题',
          },
          slug: {
            type: 'string',
            example: 'article-slug',
          },
          content: {
            type: 'string',
            example: '文章内容...',
          },
          excerpt: {
            type: 'string',
            example: '文章摘要',
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            example: 'published',
          },
          author: {
            $ref: '#/components/schemas/User',
          },
          category: {
            $ref: '#/components/schemas/Category',
          },
          tags: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Tag',
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'category_123',
          },
          name: {
            type: 'string',
            example: '技术',
          },
          slug: {
            type: 'string',
            example: 'technology',
          },
          description: {
            type: 'string',
            example: '技术相关文章',
          },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'tag_123',
          },
          name: {
            type: 'string',
            example: 'React',
          },
          slug: {
            type: 'string',
            example: 'react',
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: '用户登录',
        tags: ['认证'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: '登录成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                        token: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: '认证失败',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/articles': {
      get: {
        summary: '获取文章列表',
        tags: ['文章'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10,
            },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
            },
          },
        ],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Article',
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: {
                          type: 'integer',
                        },
                        limit: {
                          type: 'integer',
                        },
                        total: {
                          type: 'integer',
                        },
                        totalPages: {
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: '创建文章',
        tags: ['文章'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: {
                    type: 'string',
                  },
                  content: {
                    type: 'string',
                  },
                  excerpt: {
                    type: 'string',
                  },
                  categoryId: {
                    type: 'string',
                  },
                  tagIds: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  status: {
                    type: 'string',
                    enum: ['draft', 'published'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    data: {
                      $ref: '#/components/schemas/Article',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: '未授权',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/categories': {
      get: {
        summary: '获取分类列表',
        tags: ['分类'],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Category',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/tags': {
      get: {
        summary: '获取标签列表',
        tags: ['标签'],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Tag',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const router: ReturnType<typeof Router> = Router();

// Swagger UI 配置选项
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
    filter: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CMS API 文档',
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, swaggerOptions));

export default router;
