import React from 'react';
import { ImageIcon, RefreshCcw, Upload } from 'lucide-react';

interface BrandUploadCardProps {
  title: string;
  description: string;
  assetKey: 'logo' | 'landingImage' | 'loginImage';
  currentImage: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'landingImage' | 'loginImage') => void;
  onClear: (key: 'logo' | 'landingImage' | 'loginImage') => void;
  setDirty: () => void;
}

export const BrandUploadCard: React.FC<BrandUploadCardProps> = ({
  title,
  description,
  assetKey,
  currentImage,
  onUpload,
  onClear,
  setDirty,
}) => (
  <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col group transition-all hover:border-primary-200 hover:shadow-lg">
    <div className="aspect-video bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
      {currentImage ? (
        <>
          <img src={currentImage} alt={title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => { onClear(assetKey); setDirty(); }} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-md hover:bg-rose-500 transition-colors shadow-xl">
              <RefreshCcw size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <ImageIcon size={56} strokeWidth={1} />
          <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Asset Upload</span>
        </div>
      )}
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-2">{title}</h4>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-2">{description}</p>
      <div className="mt-auto">
        <label className="block w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all cursor-pointer shadow-sm">
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e, assetKey)} />
          <div className="flex items-center justify-center gap-2">
            <Upload size={14} />
            {currentImage ? 'Replace Strategic Asset' : 'Upload Identity Asset'}
          </div>
        </label>
      </div>
    </div>
  </div>
);