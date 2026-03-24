import { type TocItem } from '@/components/TableOfContents';

/**
 * 从 Markdown 内容中提取标题列表
 */
export function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split('\n');

  lines.forEach((line) => {
    // 匹配 ATX 风格标题 (## 标题)
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match && match[1] && match[2]) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);

      headings.push({ id, text, level });
    }
  });

  return headings;
}

/**
 * 生成标题 ID
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 计算阅读时间（分钟）
 * @param content Markdown 内容
 * @param wordsPerMinute 每分钟阅读字数（中文约 300-400，英文约 200-250）
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 300
): number {
  // 移除代码块
  const textOnly = content.replace(/```[\s\S]*?```/g, '');

  // 统计中文字符数
  const chineseChars = (textOnly.match(/[\u4e00-\u9fa5]/g) || []).length;

  // 统计英文单词数
  const englishWords = (textOnly.match(/[a-zA-Z]+/g) || []).length;

  // 总字数（中文按字符，英文按单词）
  const totalWords = chineseChars + englishWords;

  // 阅读时间（向上取整，最少 1 分钟）
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
}

/**
 * 为 Markdown 内容中的标题添加 ID
 */
export function addHeadingIds(markdown: string): string {
  return markdown.replace(/^(#{2,4})\s+(.+)$/gm, (_match, hashes, text) => {
    const id = generateHeadingId(text.trim());
    return `${hashes} ${text.trim()} {#${id}}`;
  });
}
