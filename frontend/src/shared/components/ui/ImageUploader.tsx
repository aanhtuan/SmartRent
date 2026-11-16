import React, { useState, useRef } from 'react';
import { mediaApi } from '../../api/mediaApi';
import { MediaFile } from '../../types';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  targetType: 'MAINTENANCE' | 'ROOM' | 'PROPERTY';
  targetId?: string;
  files: MediaFile[];
  onFileUploaded: (file: MediaFile) => void;
  onFileDeleted?: (id: string) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  targetType,
  targetId,
  files,
  onFileUploaded,
  onFileDeleted,
  maxFiles = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (files.length >= maxFiles) {
      setErrorMsg(`Chỉ được đính kèm tối đa ${maxFiles} hình ảnh.`);
      return;
    }

    const file = selectedFiles[0];
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp không được vượt quá 15MB.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    try {
      const uploaded = await mediaApi.upload(file, targetType, targetId);
      onFileUploaded(uploaded);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tải tệp lên.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-ink-secondary flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-primary" />
          Hình ảnh đính kèm ({files.length}/{maxFiles})
        </label>
        {files.length < maxFiles && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Thêm ảnh</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {errorMsg && (
        <div className="p-2 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {files.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group rounded-xl overflow-hidden border border-border bg-surface-subtle aspect-square"
            >
              <img
                src={file.url}
                alt={file.file_name}
                className="w-full h-full object-cover"
              />
              {onFileDeleted && (
                <button
                  type="button"
                  onClick={() => onFileDeleted(file.id)}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-opacity opacity-80 hover:opacity-100"
                  title="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-surface-subtle transition-colors"
        >
          <Upload className="w-6 h-6 text-ink-muted mx-auto mb-1.5" />
          <p className="text-xs font-medium text-ink-secondary">
            Bấm để tải ảnh sự cố thực tế
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5">JPG, PNG, WEBP (Tối đa 15MB)</p>
        </div>
      )}
    </div>
  );
};
