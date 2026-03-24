export default function MediaPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl lg:text-2xl font-bold">媒体库</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm lg:text-base">
          + 上传文件
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 lg:p-12 text-center">
          <div className="text-gray-500">
            <p className="mb-2 text-sm lg:text-base">拖拽文件到此处或点击上传</p>
            <p className="text-xs lg:text-sm">支持 JPG, PNG, GIF, PDF 等格式</p>
          </div>
        </div>
      </div>
    </div>
  )
}
