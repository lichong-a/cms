'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold">系统设置</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 lg:p-6 space-y-6">
          <div>
            <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">基本设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站名称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CMS 系统"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站描述
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入网站描述"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">SEO 设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta 关键词
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="关键词1, 关键词2, 关键词3"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
