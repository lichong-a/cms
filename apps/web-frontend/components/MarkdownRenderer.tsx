'use client';

import { cn } from '@cms/utils';
import { Copy, Check } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Markdown 渲染器
 * - 支持 GFM (表格、删除线等)
 * - 代码语法高亮
 * - 数学公式
 * - 自定义组件样式
 */
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  return (
    <div
      className={cn(
        'prose prose-lg max-w-none dark:prose-invert',
        // 标题样式
        'prose-headings:scroll-mt-20 prose-headings:font-semibold',
        'prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8',
        'prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b',
        'prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-6',
        'prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4',
        // 段落样式
        'prose-p:text-lg prose-p:leading-relaxed prose-p:mb-4',
        // 链接样式
        'prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-primary-400',
        // 代码块样式
        'prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:overflow-x-auto',
        'prose-code:text-primary-600 dark:prose-code:text-primary-400',
        // 引用块样式
        'prose-blockquote:border-l-primary-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 dark:prose-blockquote:bg-gray-800/50',
        // 列表样式
        'prose-li:my-1',
        // 表格样式
        'prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-50',
        'prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2',
        // 图片样式
        'prose-img:rounded-lg prose-img:mx-auto',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          // 自定义代码块，添加复制按钮
          pre: ({ children, ...props }) => {
            const codeElement = React.Children.toArray(children).find(
              (child) => React.isValidElement(child) && child.type === 'code'
            ) as React.ReactElement<{ children?: string; className?: string }> | undefined;

            if (!codeElement || !codeElement.props) {
              return <pre {...props}>{children}</pre>;
            }

            const codeString = codeElement.props.children || '';
            const language =
              codeElement.props.className?.replace('language-', '') || '';
            const id = `code-${Math.random().toString(36).substr(2, 9)}`;

            return (
              <div className="relative group">
                <pre {...props}>{children}</pre>
                {language && (
                  <div className="absolute top-2 right-14 px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded">
                    {language}
                  </div>
                )}
                <button
                  onClick={() => copyToClipboard(codeString.toString(), id)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="复制代码"
                >
                  {copiedId === id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          },
          // 自定义图片，添加点击放大
          img: ({ src, alt, ...props }) => {
            if (!src) return null;

            return (
              <span className="block cursor-pointer" onClick={() => {}}>
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg mx-auto"
                  {...props}
                />
              </span>
            );
          },
          // 自定义链接，添加新窗口打开
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
