'use client'

import { Cloud, HardDrive } from 'lucide-react'
import { useState } from 'react'

import type { StorageType } from '@/lib/storage'

interface StorageSelectorProps {
  /**
   * 当前选中的存储类型
   */
  value: StorageType

  /**
   * 存储类型变更回调
   */
  onChange: (type: StorageType) => void

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 自定义样式类名
   */
  className?: string
}

export function StorageSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: StorageSelectorProps) {
  const [hoveredType, setHoveredType] = useState<StorageType | null>(null)

  const storageOptions: Array<{
    type: StorageType
    label: string
    description: string
    icon: React.ReactNode
  }> = [
    {
      type: 'oss',
      label: '阿里云 OSS',
      description: '云存储，支持大文件和 CDN 加速',
      icon: <Cloud size={20} />,
    },
    {
      type: 'local',
      label: '本地存储',
      description: '存储在服务器本地，适合小规模使用',
      icon: <HardDrive size={20} />,
    },
  ]

  return (
    <div className={`flex gap-3 ${className}`}>
      {storageOptions.map((option) => {
        const isSelected = value === option.type
        const isHovered = hoveredType === option.type

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            onMouseEnter={() => setHoveredType(option.type)}
            onMouseLeave={() => setHoveredType(null)}
            disabled={disabled}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all
              ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : isHovered
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`
                ${
                  isSelected
                    ? 'text-blue-600'
                    : isHovered
                      ? 'text-gray-700'
                      : 'text-gray-500'
                }
              `}
              >
                {option.icon}
              </div>
              <div
                className={`
                font-medium
                ${
                  isSelected
                    ? 'text-blue-600'
                    : isHovered
                      ? 'text-gray-900'
                      : 'text-gray-700'
                }
              `}
              >
                {option.label}
              </div>
            </div>
            <div
              className={`
              text-xs text-left
              ${
                isSelected
                  ? 'text-blue-500'
                  : isHovered
                    ? 'text-gray-600'
                    : 'text-gray-400'
              }
            `}
            >
              {option.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
