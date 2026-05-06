import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Save, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface LogoUploadProps {
  currentLogo?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onUpload, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, SVG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (e) {
      setError('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(async () => {
    setPreview(null);
    if (onRemove) {
      try {
        await onRemove();
      } catch (e) {
        setError('Failed to remove logo');
      }
    }
  }, [onRemove]);

  return (
    <div className="space-y-4">
      {/* Current Logo Preview */}
      {(preview || currentLogo) && (
        <div className="relative inline-block">
          <div className="w-48 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            <img 
              src={preview || currentLogo} 
              alt="Company Logo" 
              className="w-full h-full object-contain p-2"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging 
            ? 'border-brand-500 bg-brand-50' 
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            isDragging ? 'bg-brand-100' : 'bg-slate-100'
          )}>
            <Upload size={20} className="text-slate-500" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-700">
              Drop your logo here or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG, SVG up to 2MB • Recommended: 200x50px
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-rose-600 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      {preview && !currentLogo && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          <Image size={16} />
          <span>{isUploading ? 'Uploading...' : 'Save Logo'}</span>
        </button>
      )}
    </div>
  );
};