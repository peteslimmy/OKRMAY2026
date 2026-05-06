import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, LoaderCircle, Check, AlertCircle } from 'lucide-react';
import { parseCSVLine, downloadCSVTemplate } from './utils';
import { generateLocalUUID } from '../../utils';
import { supabase } from '../../lib/supabase';
import { KeyResult } from '../../types';

interface BulkUploadModalProps {
  currentUserId: string | undefined;
  selectedYear: number;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  currentUserId,
  selectedYear,
  onClose,
  onUploadComplete,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  const handleBulkUpload = async (file: File) => {
    setUploadStatus('processing');
    setUploadProgress(0);
    setUploadError('');

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        throw new Error('CSV must have a header row and at least one data row');
      }
      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

      if (!headers.includes('quarter') || !headers.includes('year') || !headers.includes('label') || !headers.includes('title')) {
        throw new Error('Invalid CSV format. Required columns: quarter, year, label, title');
      }

      const data = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        return row;
      }).filter(r => r.quarter && r.year && r.label && r.title);

      const total = data.length;
      const krsToInsert: Partial<KeyResult>[] = [];
      const parentMap: Record<string, string> = {};
      const errors: string[] = [];

      const parentRows = data.filter(row => !row.parent_label || row.parent_label === row.label);
      parentRows.forEach(row => {
        if (row.parent_label === row.label) {
          errors.push(`Row "${row.label}": parent_label cannot be the same as label (self-reference)`);
          return;
        }
        const id = generateLocalUUID();
        parentMap[row.label] = id;
        krsToInsert.push({
          id,
          quarter: row.quarter,
          year: parseInt(row.year),
          label: row.label,
          title: row.title,
          description: '',
          owner_id: currentUserId || 'SYSTEM',
          progress: 0,
          status: (['Green', 'Amber', 'Red'].includes(row.status) ? row.status : 'Green') as 'Green' | 'Amber' | 'Red',
          parent_kr_id: null
        });
        setUploadProgress(Math.round((krsToInsert.length / (total * 2)) * 100));
      });

      const childRows = data.filter(row => row.parent_label && row.parent_label !== row.label);
      childRows.forEach(row => {
        if (!parentMap[row.parent_label]) {
          errors.push(`Row "${row.label}": parent_label "${row.parent_label}" not found in CSV`);
          return;
        }
        krsToInsert.push({
          id: generateLocalUUID(),
          quarter: row.quarter,
          year: parseInt(row.year),
          label: row.label,
          title: row.title,
          description: '',
          owner_id: currentUserId || 'SYSTEM',
          progress: 0,
          status: (['Green', 'Amber', 'Red'].includes(row.status) ? row.status : 'Green') as 'Green' | 'Amber' | 'Red',
          parent_kr_id: parentMap[row.parent_label]
        });
        setUploadProgress(Math.round(((krsToInsert.length + parentRows.length) / (total * 2)) * 100));
      });

      if (errors.length > 0) {
        throw new Error('CSV errors:\n' + errors.join('\n'));
      }

      const batchSize = 10;
      for (let i = 0; i < krsToInsert.length; i += batchSize) {
        const batch = krsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('key_results').upsert(batch, { onConflict: 'id' });
        if (error) throw error;
        setUploadProgress(Math.round((i + batch.length) / krsToInsert.length * 100));
      }

      setUploadProgress(100);
      setUploadStatus('success');
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setUploadProgress(0);
        onUploadComplete();
      }, 2000);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setUploadStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud size={20} className="text-emerald-600" /> Bulk Upload KRs
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {uploadStatus === 'idle' && (
            <>
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-medium mb-2">CSV Format:</p>
                <p className="text-xs text-slate-500">quarter,year,label,title,parent_label,status</p>
                <p className="text-xs text-slate-400 mt-2">Example: Q1,2026,KR1,Grow Revenue,,Green</p>
                <p className="text-xs text-slate-400">Sub-KR: Q1,2026,KR1.1,Increase Sales,KR1,Green</p>
                <p className="text-xs text-slate-400 mt-1">Status: Green, Amber, or Red (optional)</p>
              </div>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileSpreadsheet size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload CSV file</p>
                </div>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBulkUpload(file);
                }} />
              </label>
              
              <button
                onClick={downloadCSVTemplate}
                className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Download size={16} /> Download Template
              </button>
            </>
          )}

          {uploadStatus === 'processing' && (
            <div className="text-center py-8">
              <LoaderCircle size={48} className="mx-auto mb-4 text-emerald-600 animate-spin" />
              <p className="text-lg font-semibold text-slate-800 mb-2">Uploading KRs...</p>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500">{uploadProgress}% complete</p>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-emerald-600" />
              </div>
              <p className="text-lg font-semibold text-slate-800 mb-2">Upload Complete!</p>
              <p className="text-sm text-slate-500">All KRs have been imported successfully.</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-rose-600" />
              </div>
              <p className="text-lg font-semibold text-slate-800 mb-2">Upload Failed</p>
              <p className="text-sm text-rose-600 mb-4">{uploadError}</p>
              <button 
                onClick={() => setUploadStatus('idle')}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};