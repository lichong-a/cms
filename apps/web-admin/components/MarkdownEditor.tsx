'use client';

import { cn } from '@cms/utils';
import {
  Bold,
  Italic,
  Strikethrough,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Table,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  onImageUpload?: () => void;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '在这里编写文章内容...',
  height = '400px',
  onImageUpload,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [value, onChange]);

  const toolbarButtons = [
    { icon: Bold, label: '粗体', action: () => insertText('**', '**') },
    { icon: Italic, label: '斜体', action: () => insertText('*', '*') },
    { icon: Strikethrough, label: '删除线', action: () => insertText('~~', '~~') },
    { type: 'divider' as const },
    { icon: Heading1, label: '标题1', action: () => insertText('# ') },
    { icon: Heading2, label: '标题2', action: () => insertText('## ') },
    { type: 'divider' as const },
    { icon: Link, label: '链接', action: () => insertText('[', '](url)') },
    { icon: Image, label: '图片', action: onImageUpload || (() => insertText('![alt](', ')')) },
    { icon: Code, label: '代码', action: () => insertText('`', '`') },
    { type: 'divider' as const },
    { icon: List, label: '无序列表', action: () => insertText('- ') },
    { icon: ListOrdered, label: '有序列表', action: () => insertText('1. ') },
    { icon: Quote, label: '引用', action: () => insertText('> ') },
    { icon: Table, label: '表格', action: () => insertText('| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |') },
  ];

  return (
    <div className={cn(
      'border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col',
      isFullscreen && 'fixed inset-0 z-50'
    )}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, index) => {
            if (btn.type === 'divider') {
              return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
            }
            const Icon = btn.icon;
            return (
              <button
                key={index}
                onClick={btn.action}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                title={btn.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          {/* 模式切换 */}
          <button
            onClick={() => setMode('edit')}
            className={cn(
              'p-1.5 rounded transition-colors',
              mode === 'edit' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-200'
            )}
            title="编辑模式"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('split')}
            className={cn(
              'p-1.5 rounded transition-colors',
              mode === 'split' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-200'
            )}
            title="分屏模式"
          >
            <div className="flex">
              <Edit3 className="w-4 h-4" />
              <Eye className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => setMode('preview')}
            className={cn(
              'p-1.5 rounded transition-colors',
              mode === 'preview' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-200'
            )}
            title="预览模式"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* 全屏切换 */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex flex-1" style={{ height: isFullscreen ? 'calc(100vh - 49px)' : height }}>
        {/* 编辑区 */}
        {mode !== 'preview' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'flex-1 p-4 resize-none focus:outline-none font-mono text-sm',
              mode === 'split' && 'border-r border-gray-200'
            )}
            style={{ width: mode === 'split' ? '50%' : '100%' }}
          />
        )}

        {/* 预览区 */}
        {mode !== 'edit' && (
          <div
            className={cn(
              'flex-1 overflow-auto p-4 bg-white',
              'prose prose-sm max-w-none'
            )}
            style={{ width: mode === 'split' ? '50%' : '100%' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {value || '*预览将在此处显示...*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
