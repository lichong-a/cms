# Tiptap 分屏编辑器

实时预览的富文本编辑器组件，支持分屏、专注模式和响应式设计。

## 功能特性

✨ **实时预览** - 编辑时立即看到渲染效果  
📱 **响应式设计** - 移动端自动切换到单一视图  
🔄 **专注模式** - 在编辑、预览和分屏之间切换  
📏 **可调节分割** - 拖拽分割线调整比例  
💾 **状态持久化** - 记住用户的视图偏好  
🖥️ **设备预览** - 模拟桌面、平板、移动设备视图

## 基础用法

```tsx
import { TiptapSplitEditor } from '@/components/editor'

function MyEditor() {
  const [content, setContent] = useState('<p>初始内容</p>')

  return (
    <TiptapSplitEditor
      content={content}
      onChange={setContent}
      placeholder="开始编写..."
    />
  )
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string` | - | 编辑器初始内容（HTML） |
| `onChange` | `(html: string) => void` | - | 内容变化回调 |
| `placeholder` | `string` | `'开始编写...'` | 占位文本 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `showViewToggle` | `boolean` | `true` | 显示视图切换按钮 |
| `showDevicePreview` | `boolean` | `false` | 显示设备预览切换 |

## 视图模式

### 分屏模式（默认）
左侧编辑器 + 右侧预览，可拖拽调整比例

### 编辑器模式
仅显示编辑器，适合专注写作

### 预览模式
仅显示预览，适合查看最终效果

## 响应式行为

- **桌面端（≥768px）**：默认分屏模式
- **移动端（<768px）**：自动切换到单一视图，提供"编辑/预览"切换按钮

## 样式说明

预览区使用 Tailwind Typography 插件的 `prose` 样式：

- 标题、段落、列表等元素自动排版
- 代码块使用 lowlight 语法高亮
- 链接、引用等元素有默认样式
- 可通过覆盖 prose 样式自定义

## 示例页面

访问 `/editor-demo` 查看完整示例。

## 技术实现

- **实时同步**：通过 `editor.getHTML()` 获取 HTML，无需防抖（Tiptap 内部已优化）
- **拖拽分割**：使用原生 mousedown/mousemove/mouseup 事件
- **状态持久化**：使用 localStorage 保存视图模式
- **响应式检测**：监听 window resize 事件

## 扩展建议

### 添加全屏模式

```tsx
const [isFullscreen, setIsFullscreen] = useState(false)

<div className={isFullscreen ? 'fixed inset-0 z-50' : ''}>
  <TiptapSplitEditor {...props} />
</div>
```

### 添加导出功能

```tsx
const handleExport = () => {
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.html'
  a.click()
}
```

### 添加 Markdown 支持

安装 `@tiptap/extension-markdown` 并添加到 extensions。
