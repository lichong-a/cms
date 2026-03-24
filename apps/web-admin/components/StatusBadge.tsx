'use client'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { label: string; color: string }> = {
    DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
    PENDING: { label: '待审', color: 'bg-yellow-100 text-yellow-800' },
    PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-800' },
    ARCHIVED: { label: '已归档', color: 'bg-blue-100 text-blue-800' },
    SCHEDULED: { label: '定时发布', color: 'bg-purple-100 text-purple-800' }
  }
  
  const { label, color } = config[status] || config['DRAFT']!
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
      {label}
    </span>
  )
}
