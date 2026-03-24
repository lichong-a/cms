'use client'

import { Upload, X, Loader2 } from 'lucide-react'
import { useState, useRef, useCallback } from 'react'

import { getDefaultStorage, type StorageType, type UploadResult } from '@/lib/storage'

interface UploadButtonProps {
  /**
   * 存储类型
   * @default 'oss'
   */
  storageType?: StorageType

  /**
   * 上传路径前缀
   * @default 'uploads/'
   */
  path?: string

  /**
   * 允许的文件类型
   * @default ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
   */
  allowedTypes?: string[]

  /**
   * 最大文件大小（字节）
   * @default 5 * 1024 * 1024 (5MB)
   */
  maxSize?: number

  /**
   * 上传成功回调
   */
  onSuccess?: (result: UploadResult) => void

  /**
   * 上传失败回调
   */
  onError?: (error: Error) => void

  /**
   * 按钮文本
   * @default '上传图片'
   */
  buttonText?: string

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 自定义样式类名
   */
  className?: string
}

export function UploadButton({
  storageType = 'oss',
  path = 'uploads/',
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  onSuccess,
  onError,
  buttonText = '上传图片',
  disabled = false,
  className = '',
}: UploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // 验证文件类型
      if (!allowedTypes.includes(file.type)) {
        const error = new Error(`不支持的文件类型: ${file.type}`)
        onError?.(error)
        return
      }

      // 验证文件大小
      if (file.size > maxSize) {
        const error = new Error(`文件大小超过限制: ${file.size} > ${maxSize}`)
        onError?.(error)
        return
      }

      // 显示预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // 上传文件
      setUploading(true)
      setUploadProgress(0)

      try {
        const storage = getDefaultStorage(storageType)
        const result = await storage.upload(file, {
          filename: file.name,
          mimeType: file.type,
          maxSize,
          allowedTypes,
          path,
        })

        setUploadProgress(100)
        onSuccess?.(result)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('上传失败')
        onError?.(err)
        setPreview(null)
      } finally {
        setUploading(false)
        setUploadProgress(0)
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [storageType, path, allowedTypes, maxSize, onSuccess, onError]
  )

  const handleClearPreview = useCallback(() => {
    setPreview(null)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* 预览 */}
      {preview && (
        <div className="relative mb-2 inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs max-h-40 rounded border"
          />
          <button
            type="button"
            onClick={handleClearPreview}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            disabled={uploading}
          >
            <X size={14} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
              <div className="text-white text-center">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <div className="text-sm">{uploadProgress}%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 上传按钮 */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || uploading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-blue-600 text-white hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            上传中...
          </>
        ) : (
          <>
            <Upload size={16} />
            {buttonText}
          </>
        )}
      </button>
    </div>
  )
}
