'use client'

// 简化版 DataTable，后续使用 Shadcn/ui 的 DataTable
interface Column<T> {
  key: keyof T
  header: string
  render?: (value: T[keyof T], item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-sm font-medium text-gray-700"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3 text-sm">
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
