import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAudit, getSessionUser, getCurrentQuarterInfo } from '../../utils';
import { useToast } from '../ui/Toast';

export const QuarterlyArchive: React.FC = () => {
  const [archiving, setArchiving] = useState(false);
  const { addToast } = useToast();
  const { quarter, year } = getCurrentQuarterInfo();

  const archiveQuarter = async () => {
    if (!confirm(`Archive Q${quarter} ${year}? This will mark all KRs for this quarter as archived and prevent further modifications.`)) return;
    
    setArchiving(true);
    try {
      const user = await getSessionUser();
      await supabase.from('key_results')
        .update({ 
          status: 'Archived',
          archived_at: new Date().toISOString(),
          archived_by: user?.id
        })
        .eq('quarter', `Q${quarter}`)
        .eq('year', year);
      
      await logAudit('SYSTEM', `Quarter Q${quarter} ${year} archived by ${user?.name}`);
      addToast(`Q${quarter} ${year} has been archived successfully.`, 'success', 5000, 'Quarter Archived');
    } catch (e: any) {
      addToast(e.message, 'error', 5000, 'Archive Failed');
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Quarterly Archive</h3>
          <p className="text-sm text-slate-500">Archive Q{quarter} {year} — freeze all KRs for this quarter</p>
        </div>
        <button
          onClick={archiveQuarter}
          disabled={archiving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-40"
        >
          <Archive size={16} /> {archiving ? 'Archiving...' : 'Archive Quarter'}
        </button>
      </div>
    </div>
  );
};