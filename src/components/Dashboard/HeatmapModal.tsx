import React, { useEffect, useState } from 'react';
import { X, Target, Building2, TrendingUp, TrendingDown, Minus, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getWATTime } from '../../utils';

interface HeatmapModalProps {
  kr: string;
  krId: string;
  bu: string;
  buId: string;
  score: number;
  status: 'Green' | 'Amber' | 'Red';
  onClose: () => void;
}

interface KRDetails {
  title: string;
  description: string;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GoalInfo {
  week: number;
  status: string;
  submitted_at: string;
  notes: string;
}

export const HeatmapModal: React.FC<HeatmapModalProps> = ({
  kr,
  krId,
  bu,
  buId,
  score,
  status,
  onClose
}) => {
  const [krDetails, setKRDetails] = useState<KRDetails | null>(null);
  const [goalInfo, setGoalInfo] = useState<GoalInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const now = getWATTime ? getWATTime() : new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (86400000 * 7));

        const [krRes, goalRes] = await Promise.all([
          supabase
            .from('key_results')
            .select('id, title, description, progress, status, created_at, updated_at')
            .eq('id', krId)
            .single(),
          supabase
            .from('goals')
            .select('week, status, submitted_at, notes')
            .eq('business_unit', buId)
            .eq('week', currentWeek)
            .single()
        ]);

        setKRDetails(krRes.data);
        setGoalInfo(goalRes.data);
      } catch (e) {
        console.error('[HeatmapModal]', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [krId, buId]);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Green': return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'On Track' };
      case 'Amber': return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'At Risk' };
      case 'Red': return { bg: 'bg-rose-500', text: 'text-rose-600', label: 'Behind' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-600', label: 'Unknown' };
    }
  };

  const statusColors = getStatusColor(status);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${statusColors.bg} flex items-center justify-center`}>
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{kr}</h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <Building2 size={12} />
                {bu}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Progress</p>
                  <p className="text-2xl font-black text-slate-900">{score}%</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${statusColors.bg} text-white`}>
                    {status === 'Green' ? <TrendingUp size={12} /> : status === 'Amber' ? <Minus size={12} /> : <TrendingDown size={12} />}
                    {statusColors.label}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Week</p>
                  <p className="text-2xl font-black text-slate-900">
                    {goalInfo?.week || '-'}
                  </p>
                </div>
              </div>

              {krDetails && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Result Details</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Title</p>
                      <p className="text-sm font-medium text-slate-700">{krDetails.title}</p>
                    </div>
                    {krDetails.description && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Description</p>
                        <p className="text-sm text-slate-600">{krDetails.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                        <p className="text-xs font-medium text-slate-600">
                          {krDetails.created_at ? new Date(krDetails.created_at).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Last Updated</p>
                        <p className="text-xs font-medium text-slate-600">
                          {krDetails.updated_at ? new Date(krDetails.updated_at).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {goalInfo && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    <Calendar size={14} className="inline mr-1" />
                    Current Week Goal
                  </h4>
                  <div className={`rounded-2xl p-4 ${goalInfo.status === 'submitted' ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                        goalInfo.status === 'submitted' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {goalInfo.status || 'pending'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Submitted: {goalInfo.submitted_at ? new Date(goalInfo.submitted_at).toLocaleDateString() : 'Not yet'}
                      </span>
                    </div>
                    {goalInfo.notes && (
                      <p className="text-xs text-slate-600 mt-2">{goalInfo.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {status === 'Red' && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-700">Attention Required</p>
                    <p className="text-xs text-rose-600 mt-1">This KR is behind target. Consider scheduling a review with the BU lead to identify blockers.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};