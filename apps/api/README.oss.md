# 阿里云 OSS 存储提供者

## 概述

阿里云 OSS 存储提供者支持通过 STS 临时凭证和签名 URL 上传文件到阿里云对象存储服务。

## 功能特性

- ✅ 支持 STS 临时凭证
- ✅ 生成签名 URL
- ✅ 分片上传支持（大文件）
- ✅ 错误重试机制
- ✅ 安全性：临时凭证自动过期
- ✅ 环境变量配置
- ✅ 与现有本地存储无缝切换

## 环境配置

复制 `.env.oss.example` 到 `.env` 并填入真实的 OSS 配置：

```bash
# 阿里云 OSS 配置
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_BUCKET_NAME=your-bucket-name
OSS_REGION=cn-hangzhou

# OSS RAM 角色 ARN（用于 STS 临时凭证）
OSS_ROLE_ARN=acs:ram::your-account-id:role/your-role-name

# 存储类型（local 或 oss）
STORAGE_TYPE=oss
```

## API 端点

### 1. 获取 STS 临时凭证

```bash
GET /api/v1/auth/sts?type=write
Authorization: Bearer <your-token>
```

参数：
- `type`: `read`（只读）或 `write`（上传）

响应：
```json
{
  "success": true,
  "data": {
    "accessKeyId": "STS临时访问密钥ID",
    "accessKeySecret": "STS临时访问密钥",
    "securityToken": "STS安全令牌",
    "expiration": "过期时间",
    "bucket": "存储桶名称",
    "region": "区域",
    "endpoint": "OSS endpoint"
  }
}
```

### 2. 上传文件到 OSS

```bash
POST /api/v1/upload/oss
Authorization: Bearer <your-token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "path": "uploads/" // 可选，存储路径前缀
}
```

### 3. 获取上传签名 URL

```bash
POST /api/v1/upload/oss/url
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "key": "uploads/test-image.png",
  "expiresIn": 3600
}
```

响应：
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://your-bucket.oss-cn-hangzhou.aliyuncs.com/uploads/test-image.png?OSSAccessKeyId=...&Expires=...&Signature=...",
    "key": "uploads/test-image.png"
  }
}
```

### 4. 分片上传

#### 初始化分片上传
```bash
POST /api/v1/upload/oss/multipart/init
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "key": "uploads/large-file.zip"
}
```

#### 上传分片
```bash
PUT /api/v1/upload/oss/multipart/complete
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "key": "uploads/large-file.zip",
  "uploadId": "上传ID",
  "parts": [
    { "number": 1, "etag": "分片1的ETag" },
    { "number": 2, "etag": "分片2的ETag" }
  ]
}
```

## 前端集成

### 1. 安装依赖

```bash
pnpm add ali-oss
pnpm add -D @types/ali-oss
```

### 2. 使用存储提供者

```typescript
import { getDefaultStorage, StorageType } from '@/lib/storage'

// 获取 OSS 存储提供者
const storage = getDefaultStorage(StorageType.OSS)

// 上传文件
const result = await storage.upload(file, {
  filename: file.name,
  mimeType: file.type,
  maxSize: 10 * 1024 * 1024, // 10MB
  path: 'uploads/',
})

console.log('上传成功:', result.url)
```

### 3. 使用上传组件

```typescript
import { UploadButton, StorageSelector } from '@/components/upload'

function MyComponent() {
  const [storageType, setStorageType] = useState<StorageType>('oss')

  return (
    <div>
      <StorageSelector
        value={storageType}
        onChange={setStorageType}
      />
      
      <UploadButton
        storageType={storageType}
        onSuccess={(result) => {
          console.log('上传成功:', result.url)
        }}
      />
    </div>
  )
}
```

## 测试

运行测试脚本验证 OSS 功能：

```bash
pnpm test-oss
```

## 注意事项

1. **安全性**：使用 STS 临时凭证，不要在前端直接使用主账号密钥
2. **凭证过期**：STS 凭证默认 1 小时过期，前端会自动刷新
3. **文件大小限制**：默认 100MB，可通过环境变量调整
4. **错误处理**：实现重试机制，处理网络错误
5. **大文件**：支持分片上传，适合大文件传输

## 故障排除

### 常见问题

1. **"获取 STS 凭证失败"**
   - 检查 `OSS_ROLE_ARN` 是否正确配置
   - 确认 RAM 角色有正确的权限策略

2. **"OSS 上传失败"**
   - 检查 OSS bucket 权限
   - 验证网络连接
   - 确认文件大小和类型符合要求

3. **"签名 URL 访问失败"**
   - 检查 URL 过期时间
   - 确认签名正确生成

## 相关文档

- [阿里云 OSS 官方文档](https://help.aliyun.com/document_detail/31817.html)
- [STS 临时授权](https://help.aliyun.com/document_detail/28763.html)
- [签名 URL](https://help.aliyun.com/document_detail/327174.html)