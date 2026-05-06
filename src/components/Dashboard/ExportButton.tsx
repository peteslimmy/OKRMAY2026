import React from 'react';
import { Download, FileText } from 'lucide-react';

interface ExportButtonProps {
  week: number;
  year: number;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ week, year }) => {
  const handleExport = () => {
    const printContent = document.getElementById('executive-dashboard');
    if (!printContent) {
      console.error('Could not find dashboard content');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Executive Dashboard - Week ${week}, ${year}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
            @page { margin: 1cm; }
          </style>
        </head>
        <body class="bg-white p-8">
          <div class="max-w-[1600px] mx-auto">
            <div class="mb-8 flex justify-between items-center border-b pb-4">
              <div>
                <h1 class="text-2xl font-black text-slate-900">Executive Dashboard</h1>
                <p class="text-sm text-slate-500">Week ${week}, ${year}</p>
              </div>
              <div class="text-right text-xs text-slate-400">
                Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
              </div>
            </div>
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors"
    >
      <Download size={14} />
      Export PDF
    </button>
  );
};