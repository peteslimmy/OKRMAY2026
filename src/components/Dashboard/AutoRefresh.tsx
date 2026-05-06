import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

interface AutoRefreshToggleProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AutoRefreshToggle: React.FC<AutoRefreshToggleProps> = ({ onRefresh, isRefreshing }) => {
  const [enabled, setEnabled] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [countdown, setCountdown] = useState(intervalSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (enabled && !isRefreshing) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onRefresh();
            return intervalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [enabled, intervalSeconds, onRefresh, isRefreshing]);

  useEffect(() => {
    if (enabled) {
      setCountdown(intervalSeconds);
    }
  }, [intervalSeconds, enabled]);

  const handleToggle = () => {
    setEnabled(!enabled);
    if (!enabled) {
      setCountdown(intervalSeconds);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
          enabled 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        {enabled ? 'Live' : 'Auto-refresh'}
      </button>

      {enabled && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600">
            {isRefreshing ? 'Syncing...' : formatTime(countdown)}
          </span>
        </div>
      )}

      {enabled && (
        <select
          value={intervalSeconds}
          onChange={(e) => setIntervalSeconds(parseInt(e.target.value))}
          className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:border-primary-400 focus:outline-none"
        >
          <option value={30}>30s</option>
          <option value={60}>1m</option>
          <option value={120}>2m</option>
          <option value={300}>5m</option>
        </select>
      )}
    </div>
  );
};