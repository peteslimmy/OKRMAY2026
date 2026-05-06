import React from 'react';
import { CheckCircle, LoaderCircle } from 'lucide-react';

interface SuccessScreenProps {
  title: string;
  message: string;
  showSpinner?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  extraButton?: { text: string; onClick: () => void };
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title,
  message,
  showSpinner = false,
  buttonText = 'Continue',
  onButtonClick,
  extraButton,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-modal px-8 pt-10 pb-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle size={30} className="text-emerald-600" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 mb-8">{message}</p>
      {showSpinner && (
        <div className="flex justify-center mb-4">
          <LoaderCircle className="w-6 h-6 text-primary-600 animate-spin" />
        </div>
      )}
      {onButtonClick && (
        <button
          onClick={onButtonClick}
          className="w-full h-12 rounded-lg text-white text-sm font-bold tracking-wide shadow-sm transition-all flex items-center justify-center bg-primary-600 hover:bg-primary-700"
        >
          {buttonText}
        </button>
      )}
      {extraButton && (
        <button
          onClick={extraButton.onClick}
          className="w-full h-12 rounded-lg text-white text-sm font-bold tracking-wide shadow-sm transition-all flex items-center justify-center bg-primary-600 hover:bg-primary-700 mt-3"
        >
          {extraButton.text}
        </button>
      )}
    </div>
  );
};

interface SuccessMessageProps {
  children: React.ReactNode;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ children }) => (
  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
    <CheckCircle className="text-emerald-500 shrink-0" size={15} />
    <p className="text-emerald-600 text-xs font-medium">{children}</p>
  </div>
);