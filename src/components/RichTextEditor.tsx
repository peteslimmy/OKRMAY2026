
import React from 'react';
import DOMPurify from 'dompurify';

export const RichTextEditor = ({ value, onChange, placeholder, rows = 3, readOnly = false }: { value: string, onChange: (val: string) => void, placeholder?: string, rows?: number, readOnly?: boolean }) => {
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Sync prop value to DOM safely
  React.useEffect(() => {
    if (editorRef.current) {
      // FR-SECURITY: BUG-004 Sanitization implementation
      const sanitized = DOMPurify.sanitize(value || '');
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rawHtml = e.currentTarget.innerHTML;
    // FR-SECURITY: Sanitize before propagation
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    if (value !== sanitizedHtml) {
      onChange(sanitizedHtml);
    }
  };

  const handleCommand = (cmd: string) => {
    if (readOnly) return;
    editorRef.current?.focus();
    try {
      document.execCommand(cmd, false);
      if (editorRef.current) {
        const sanitizedHtml = DOMPurify.sanitize(editorRef.current.innerHTML);
        onChange(sanitizedHtml);
      }
    } catch (e) {
      console.warn("RichText Command failed", e);
    }
  };

  const minHeight = `${rows * 1.5 + 2}rem`;

  return (
    <div className={`w-full bg-white border ${readOnly ? 'border-slate-100 bg-slate-50/30 shadow-none' : 'border-slate-200 shadow-inner'} rounded-[4px] text-sm focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/10 outline-none transition-all overflow-hidden`}>
      {!readOnly && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-white border-b border-slate-50">
          {['bold', 'italic', 'underline'].map(cmd => (
            <button
              key={cmd}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleCommand(cmd)}
              className="p-1.5 hover:bg-slate-50 rounded-[4px] text-slate-700 uppercase text-[10px] font-black w-9 h-9 flex items-center justify-center border border-slate-100 transition-colors hover:border-slate-200"
            >
              {cmd[0]}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-100 mx-1 self-center" />
          {['insertUnorderedList', 'insertOrderedList'].map(cmd => (
            <button
              key={cmd}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleCommand(cmd)}
              className="px-4 h-9 hover:bg-slate-50 rounded-[4px] text-slate-700 text-[10px] font-black border border-slate-100 transition-colors hover:border-slate-200 uppercase tracking-widest"
            >
              {cmd === 'insertUnorderedList' ? '• List' : '1. List'}
            </button>
          ))}
        </div>
      )}
      <div
        ref={editorRef}
        className={`rich-text-editor p-6 outline-none rich-text-content ${readOnly ? 'cursor-default' : 'cursor-text bg-slate-50/30'}`}
        style={{ minHeight }}
        contentEditable={!readOnly}
        onInput={handleInput}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-readonly={readOnly}
      />
    </div>
  );
};


