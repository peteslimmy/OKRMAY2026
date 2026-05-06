import React, { useState, useMemo } from 'react';
import { Users, Building2, User, ZoomIn, ZoomOut, RotateCcw, Mail } from 'lucide-react';
import { BusinessUnit, User as UserType } from '../../src/types';

interface OrgChartProps {
  businessUnits: BusinessUnit[];
  users: UserType[];
  onNodeClick?: (unit: BusinessUnit) => void;
}

export const OrgChart: React.FC<OrgChartProps> = ({ businessUnits, users, onNodeClick }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => setZoom(1);

  // Group users by business unit
  const usersByUnit = useMemo(() => {
    const map: Record<string, UserType[]> = {};
    users.forEach(user => {
      const dept = user.department || 'Unassigned';
      if (!map[dept]) map[dept] = [];
      map[dept].push(user);
    });
    return map;
  }, [users]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button onClick={handleZoomOut} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Zoom out">
          <ZoomOut size={16} className="text-slate-600" />
        </button>
        <span className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={handleZoomIn} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Zoom in">
          <ZoomIn size={16} className="text-slate-600" />
        </button>
        <button onClick={handleReset} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Reset view">
          <RotateCcw size={16} className="text-slate-600" />
        </button>
      </div>
      
      {/* Stats */}
      <div className="absolute top-4 left-4 flex gap-3 z-10">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Building2 size={14} className="text-primary-500" />
          <span className="text-xs font-bold text-slate-600">{businessUnits.length} Units</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Users size={14} className="text-primary-500" />
          <span className="text-xs font-bold text-slate-600">{users.length} People</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-full overflow-auto p-8 pt-20">
        {businessUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Building2 size={64} className="text-slate-200 mb-4" />
            <p className="text-lg font-bold text-slate-400">No Business Units</p>
            <p className="text-sm text-slate-300 mt-1">Add business units to visualize your organization</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {businessUnits.map(unit => {
              const head = users.find(u => u.id === unit.head_user_id);
              const unitUsers = usersByUnit[unit.name] || [];
              const isSelected = selectedNode === unit.id;
              
              return (
                <div
                  key={unit.id}
                  onClick={() => {
                    setSelectedNode(unit.id);
                    onNodeClick?.(unit);
                  }}
                  className={`
                    relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg
                    ${isSelected ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-500/10' : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'}
                  `}
                >
                  {/* Header with color bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-[14px]" />
                  
                  {/* Unit Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                      {unit.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {unitUsers.length} members
                    </span>
                  </div>
                  
                  {/* Unit Name */}
                  <h4 className="font-bold text-slate-900 text-base mb-3 leading-tight">{unit.name}</h4>
                  
                  {/* Unit Head */}
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Unit Head</p>
                    {head ? (
                      <div className="flex items-center gap-2">
                        <img src={head.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{head.name}</p>
                          <p className="text-[10px] text-slate-400">{head.role}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <User size={14} />
                        <span className="text-xs">No head assigned</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Contact */}
                  {unit.contactEmail && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <Mail size={12} className="text-slate-400" />
                      <a href={`mailto:${unit.contactEmail}`} className="text-xs text-primary-600 hover:underline truncate">
                        {unit.contactEmail}
                      </a>
                    </div>
                  )}
                  
                  {/* Member avatars */}
                  {unitUsers.length > 0 && (
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex -space-x-2">
                        {unitUsers.slice(0, 4).map((u, i) => (
                          <img 
                            key={u.id} 
                            src={u.avatarUrl} 
                            alt="" 
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                            title={u.name}
                          />
                        ))}
                        {unitUsers.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 ring-2 ring-white">
                            +{unitUsers.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 ml-1">
                        {unitUsers.length === 1 ? '1 person' : `${unitUsers.length} people`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChart;