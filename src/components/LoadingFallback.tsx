/**
 * 4CORE OKR Platform - Loading Fallback
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  text?: string;
  fullPage?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  text = 'Loading...',
  fullPage = false
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingFallback;