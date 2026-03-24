'use client';

import { type Media } from '@cms/types';
import { cn } from '@cms/utils';
import { Upload, Search, X, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { api } from '@/lib/api-v1';

interface MediaPickerProps {
  onSelect: (media: Media) => void;
  multiple?: boolean;
  allowedTypes?: string[];
}

export default function MediaPicker({
  onSelect,
  multiple = false,
  allowedTypes = ['image'],
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: Media[] }>('/media');
      setMediaList(response.data || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await api.upload('/media/upload', file);
      }
      
      // 刷新媒体列表
      await fetchMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredMedia = mediaList.filter(media => {
    // 类型筛选
    const isAllowed = allowedTypes.some(type => media.mimeType.startsWith(type));
    if (!isAllowed) return false;
    
    // 搜索筛选
    if (searchQuery) {
      return media.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const toggleSelect = (media: Media) => {
    if (multiple) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(media.id)) {
        newSelected.delete(media.id);
      } else {
        newSelected.add(media.id);
      }
      setSelectedIds(newSelected);
    } else {
      // 单选模式：直接选择并关闭
      onSelect(media);
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    const selectedMedia = mediaList.filter(m => selectedIds.has(m.id));
    selectedMedia.forEach(onSelect);
    setIsOpen(false);
    setSelectedIds(new Set());
  };

  const getMediaTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📄';
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        媒体库
      </button>

      {/* 弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">媒体库</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between px-6 py-3 border-b gap-4">
              {/* 搜索 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索媒体文件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 上传 */}
              <label className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer flex items-center gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    上传文件
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={allowedTypes.map(t => `${t}/*`).join(',')}
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* 媒体网格 */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Upload className="w-12 h-12 mb-2" />
                  <p>暂无媒体文件</p>
                  <p className="text-sm">点击上方按钮上传文件</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {filteredMedia.map((media) => {
                    const isSelected = selectedIds.has(media.id);
                    return (
                      <button
                        key={media.id}
                        onClick={() => toggleSelect(media)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                          isSelected
                            ? 'border-primary-500 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {/* 预览 */}
                        {media.mimeType.startsWith('image/') ? (
                          <img
                            src={media.storagePath}
                            alt={media.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-4xl">
                              {getMediaTypeIcon(media.mimeType)}
                            </span>
                          </div>
                        )}

                        {/* 选中标记 */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* 文件名 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                          {media.originalName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 底部 */}
            {multiple && selectedIds.size > 0 && (
              <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-600">
                  已选择 {selectedIds.size} 个文件
                </span>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  确认选择
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
