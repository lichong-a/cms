'use client'

import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()

  const handleCreateUser = () => {
    router.push('/admin/users/new')
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl lg:text-2xl font-bold">用户管理</h1>
        <button
          onClick={handleCreateUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm lg:text-base"
        >
          + 新建用户
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 lg:p-6">
          <p className="text-gray-600">用户列表将在这里显示</p>
        </div>
      </div>
    </div>
  )
}
