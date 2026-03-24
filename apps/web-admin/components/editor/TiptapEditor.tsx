'use client'

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { Eye, Edit3, Columns } from 'lucide-react'
import { useState, useEffect } from 'react'

import { EditorToolbar } from './EditorToolbar'

const lowlight = createLowlight(common)

type ViewMode = 'split' | 'edit' | 'preview'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  showPreview?: boolean
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = '开始编写...',
  editable = true,
  showPreview = true,
}: TiptapEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [debouncedHtml, setDebouncedHtml] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-md bg-slate-900 p-4 text-slate-100 font-mono text-sm overflow-x-auto',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // 防抖更新预览
  useEffect(() => {
    if (!editor) return
    const timer = setTimeout(() => {
      setDebouncedHtml(editor.getHTML())
    }, 150)
    return () => clearTimeout(timer)
  }, [editor?.getHTML()])

  // 初始化预览内容
  useEffect(() => {
    if (editor && !debouncedHtml) {
      setDebouncedHtml(editor.getHTML())
    }
  }, [editor])

  if (!editor) return null

  const showEdit = viewMode === 'edit' || viewMode === 'split'
  const showPreviewPanel = viewMode === 'preview' || viewMode === 'split'

  return (
    <div className="space-y-2">
      {/* 视图模式切换 */}
      {showPreview && (
        <div className="flex gap-1 border rounded-lg p-1 bg-slate-50 w-fit">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`p-2 rounded transition-colors ${viewMode === 'edit' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white'}`}
            title="仅编辑"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-2 rounded transition-colors ${viewMode === 'split' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white'}`}
            title="分屏"
          >
            <Columns size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`p-2 rounded transition-colors ${viewMode === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white'}`}
            title="仅预览"
          >
            <Eye size={16} />
          </button>
        </div>
      )}

      {/* 编辑器 + 预览区域 */}
      <div className={`flex gap-4 ${viewMode === 'split' ? 'flex-col lg:flex-row' : ''}`}>
        {/* 编辑器 */}
        {showEdit && (
          <div className={`border rounded-lg overflow-hidden bg-white ${viewMode === 'split' ? 'flex-1 min-w-0' : ''}`}>
            <EditorToolbar editor={editor} />
            <EditorContent
              editor={editor}
              className="prose prose-slate max-w-none p-4 min-h-[300px] focus:outline-none"
            />
          </div>
        )}

        {/* 预览 */}
        {showPreviewPanel && showPreview && (
          <div className={`border rounded-lg bg-white ${viewMode === 'split' ? 'flex-1 min-w-0' : ''}`}>
            <div className="border-b px-4 py-2 bg-slate-50 text-sm font-medium text-gray-600 flex items-center gap-2">
              <Eye size={14} />
              预览
            </div>
            <div
              className="prose prose-slate max-w-none p-4 min-h-[300px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: debouncedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
