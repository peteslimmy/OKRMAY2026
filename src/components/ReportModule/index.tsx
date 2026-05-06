import React, { useState, useEffect, useMemo } from 'react';
import { FileText, LoaderCircle, ShieldCheck, UploadCloud, Plus, Download, Target, Lock, AlertTriangle } from 'lucide-react';
import { Goal, Task, TaskStatus, KeyResult, UserRole, User, AIMessage } from '../../types';
import { calculateGoalScore, getRecentWeekRanges, logAudit, getSessionUser, getReportLockStatus, getRegistryKeyResults, generateReportId, callAIDirect, getGoalTagOptions, STRESSED_TAG } from '../../utils';
import { RichTextEditor } from '../RichTextEditor';
import { Select } from '../ui/Select';
import { AdvancedFilters } from '../ui/AdvancedFilters';
import { ConfirmDialog } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { supabase } from '../../lib/supabase';
import { ReportHeader } from './ReportHeader';
import { ReportStats } from './ReportStats';
import { GoalCard } from './GoalCard';
import { ReportForm } from './ReportForm';

const ReportModule: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const reportingWeeks = useMemo(() => getRecentWeekRanges(), []);
  const effectiveWeekValue = useMemo(() => {
    if (selectedWeek !== null) return `Week ${selectedWeek}`;
    return reportingWeeks[0]?.value || '';
  }, [selectedWeek, reportingWeeks]);
  const currentFilterWeekNum = useMemo(() => parseInt(effectiveWeekValue.match(/\d+/)?.[0] || '1'), [effectiveWeekValue]);
  const weekOptions = useMemo(() => {
    const weeks: { value: number; label: string }[] = [];
    for (let w = 1; w <= 52; w++) {
      const simple = new Date(selectedYear, 0, 1 + (w - 1) * 7);
      const dow = simple.getDay();
      const start = new Date(simple);
      if (dow <= 4) start.setDate(simple.getDate() - simple.getDay() + 1);
      else start.setDate(simple.getDate() + 8 - simple.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      weeks.push({ value: w, label: `W${w} • ${months[start.getMonth()]} ${start.getDate()} - ${end.getDate()}` });
    }
    return weeks;
  }, [selectedYear]);

  const [availableKRs, setAvailableKRs] = useState<KeyResult[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [selectedSubKrtag, setSelectedSubKrtag] = useState('');
  const [selectedKrId, setSelectedKrId] = useState<string>('');
  const [availableSubKrtags, setAvailableSubKrtags] = useState<string[]>([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalComments, setGoalComments] = useState('');
  const [tasks, setTasks] = useState<{ id: string, title: string, status: TaskStatus }[]>([]);
  const [currentTaskInput, setCurrentTaskInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [governanceVersion, setGovernanceVersion] = useState(0);
  const [isVetting, setIsVetting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [generalComment, setGeneralComment] = useState('');
  const [showLastWeekOutstanding, setShowLastWeekOutstanding] = useState(false);
  const [bulkUpload, setBulkUpload] = useState({ isOpen: false, status: '', progress: 0, total: 0, errors: [], success: 0, duplicates: [] });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; goalId: string | null }>({ isOpen: false, goalId: null });

  const { addToast } = useToast();

  const isBypassActive = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;
  const isManagerial = currentUser?.role === UserRole.Manager || currentUser?.role === UserRole.Director;
  const canCreate = isManagerial || isBypassActive;
  const lockStatus = useMemo(() => getReportLockStatus(currentFilterWeekNum, selectedYear), [currentFilterWeekNum, selectedYear, governanceVersion]);
  const isFullyLocked = lockStatus === 'LOCKED';
  const isPartiallyLocked = lockStatus === 'PARTIAL';

  const canModifyGoal = (act: Goal) => {
    if (isBypassActive) return true;
    if (isManagerial && act.department === currentUser?.department) return true;
    return false;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [krs, goalsRes, user, subKrtags] = await Promise.all([
        getRegistryKeyResults(selectedYear),
        supabase.from('activities').select('*').eq('year', selectedYear),
        getSessionUser(),
        getGoalTagOptions(selectedYear)
      ]);
      const seenLabels = new Set<string>();
      const uniqueKRs = krs.filter(kr => {
        const key = `${kr.quarter}-${kr.label}`;
        if (seenLabels.has(key)) return false;
        seenLabels.add(key);
        return true;
      });
      setAvailableKRs(uniqueKRs);
      setAvailableSubKrtags(subKrtags);
      setCurrentUser(user);
      const dbGoals = (goalsRes.data as any[]) || [];
      setGoals(dbGoals.map(a => ({
        ...a,
        tasks: typeof a.tasks === 'string' ? JSON.parse(a.tasks) : (a.tasks || [])
      })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const handleSync = () => fetchData();
    const handleGovSync = () => setGovernanceVersion(v => v + 1);
    window.addEventListener('4COREUserUpdate', handleSync);
    window.addEventListener('4COREGovernanceUpdate', handleGovSync);
    return () => {
      window.removeEventListener('4COREUserUpdate', handleSync);
      window.removeEventListener('4COREGovernanceUpdate', handleGovSync);
    };
  }, [selectedYear, effectiveWeekValue]);

  const handleTaskStatusToggle = async (goalId: string, taskId: string) => {
    const act = goals.find(a => a.id === goalId);
    if (!act) return;
    if (!isBypassActive && isFullyLocked) return;
    if (!canModifyGoal(act)) return;
    const updatedTasks = act.tasks.map(t => {
      if (t.id === taskId) {
        const statusOrder = [TaskStatus.Undefined, TaskStatus.Done, TaskStatus.NotDone];
        const currentIndex = statusOrder.indexOf(t.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...t, status: nextStatus };
      }
      return t;
    });
    const newScore = calculateGoalScore(updatedTasks);
    await supabase.from('activities').update({ tasks: JSON.stringify(updatedTasks), score: newScore }).eq('id', goalId);
    await fetchData();
  };

const saveGoal = async () => {
    if (!goalTitle.trim() || !selectedSubKrtag || tasks.length === 0) return;
    setSubmitting(true);
    try {
      const newAct = {
        id: editingGoalId || crypto.randomUUID(),
        sub_kr_tag: selectedSubKrtag,
        owner_id: currentUser?.id || 'SYSTEM',
        department: currentUser?.department || 'Registry',
        title: goalTitle.trim(),
        tasks: JSON.stringify(tasks),
        comments: goalComments,
        week: currentFilterWeekNum,
        year: selectedYear,
        score: calculateGoalScore(tasks)
      };
      const { error } = await supabase.from('activities').upsert([newAct]);
      if (error) throw error;
      setIsAddModalOpen(false);
      setSelectedSubKrtag('');
      await fetchData();
      logAudit(editingGoalId ? 'UPDATE' : 'CREATE', `Goal saved: ${goalTitle}`);
    } catch (e: any) {
      console.error("Save Error:", e);
      addToast('error', `Save failure: ${e.message || "Check cloud status."}`);
    } finally { setSubmitting(false); }
  };

  const handleAddTask = () => {
    if (!currentTaskInput.trim()) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), title: currentTaskInput.trim(), status: TaskStatus.Undefined }]);
    setCurrentTaskInput('');
  };

  const handleDeleteGoal = async () => {
    if (!deleteConfirm.goalId) return;
    try {
      await supabase.from('activities').delete().eq('id', deleteConfirm.goalId);
      addToast('success', 'Goal deleted successfully');
      fetchData();
    } catch (e: any) {
      addToast('error', `Delete failed: ${e.message}`);
    } finally {
      setDeleteConfirm({ isOpen: false, goalId: null });
    }
  };

  const vetTitleWithAI = async () => {
    if (!goalTitle.trim() || isVetting) return;
    setIsVetting(true);
    setAiSuggestion(null);
    try {
      const messages: AIMessage[] = [
        { role: 'system', content: 'You are a 4CORE governance AI assistant. Evaluate weekly goals for SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound). Return a brief analysis with a score 0-100 and actionable suggestions.' },
        { role: 'user', content: `Evaluate this weekly goal: "${goalTitle}"\n\nProvide your response in this format:\nScore: [0-100]\nAnalysis: [brief analysis]\nRecommendation: [specific actionable improvement if score < 80]` }
      ];
      const result = await callAIDirect(messages);
      setAiSuggestion(result);
    } catch (e) {
      setAiSuggestion("AI review unavailable. Your goal has been checked by the rule-based SMART validator above.");
    } finally {
      setIsVetting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const parentKRs = availableKRs.filter(kr => !kr.parent_kr_id && kr.label.match(/^KR[1-4]$/));
    const seenKeys = new Set<string>();
    const uniqueKRs = parentKRs.filter(kr => {
      const key = `${kr.quarter}-${kr.label}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });
    const headers = "Year,Week,Key Result Label,Goal Title,Task 1,Task 2,Task 3,Task 4,Task 5\n";
    const sampleRows = uniqueKRs.map(kr =>
      `${selectedYear},${currentFilterWeekNum},${kr.label},"[Enter goal title]",[Task 1],[Task 2],[Task 3],[Task 4],[Task 5]`
    ).join('\n');
    const template = `${headers}${sampleRows}\n`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4core_template_W${currentFilterWeekNum}_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (file: File) => {
    setBulkUpload({ isOpen: true, status: 'Reading file...', progress: 0, total: 100, errors: [], success: 0, duplicates: [] });
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
      const rows = lines.slice(1);
      setBulkUpload(prev => ({ ...prev, status: 'Parsing CSV...', progress: 20, total: rows.length }));
      
      const newGoals: any[] = [];
      const errors: string[] = [];
      const duplicates: string[] = [];
      const seenKeys = new Set<string>();
      const parentKRs = availableKRs.filter(kr => !kr.parent_kr_id && kr.label.match(/^KR[1-4]$/));
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const parts = row.split(',');
        setBulkUpload(prev => ({ ...prev, status: `Processing row ${i + 1} of ${rows.length}`, progress: 20 + Math.round((i / rows.length) * 60) }));
        if (parts.length < 4) { errors.push(`Row ${i + 2}: Missing columns`); continue; }
        const title = parts[3]?.trim().replace(/^"|"$/g, '');
        const krLabel = parts[2]?.trim().replace(/^"|"$/g, '');
        if (!title) { errors.push(`Row ${i + 2}: Missing goal title`); continue; }
        const krMatch = parentKRs.find(k => k.label.toUpperCase() === krLabel?.toUpperCase());
        if (!krMatch) { errors.push(`Row ${i + 2}: KR "${krLabel}" not found`); continue; }
        
        const goalKey = `${krMatch.id}-${title.toLowerCase()}-${currentFilterWeekNum}-${selectedYear}`;
        if (seenKeys.has(goalKey)) {
          duplicates.push(`Row ${i + 2}: Duplicate goal "${title}" for ${krLabel} in this upload`);
          continue;
        }
        
        const { data: existing } = await supabase.from('activities').select('id').eq('key_result_id', krMatch.id)
          .eq('title', title).eq('week', currentFilterWeekNum).eq('year', selectedYear);
        if (existing && existing.length > 0) {
          duplicates.push(`Row ${i + 2}: Goal "${title}" already exists for ${krLabel} (will be skipped)`);
          continue;
        }
        
        seenKeys.add(goalKey);
        newGoals.push({ id: crypto.randomUUID(), key_result_id: krMatch.id, owner_id: currentUser?.id || 'SYSTEM', department: currentUser?.department || 'Registry', title, tasks: JSON.stringify([]), comments: '', week: currentFilterWeekNum, year: selectedYear, score: 0 });
      }
      setBulkUpload(prev => ({ ...prev, status: 'Saving to database...', progress: 85 }));
      if (newGoals.length > 0) {
        const { error } = await supabase.from('activities').insert(newGoals);
        if (error) errors.push(`Database error: ${error.message}`);
      }
      setBulkUpload(prev => ({ ...prev, status: errors.length + duplicates.length > 0 ? 'Completed with issues' : 'Upload successful!', progress: 100, success: newGoals.length, errors: [...errors, ...duplicates] }));
      logAudit('IMPORT', `Bulk upload: ${newGoals.length} goals, ${duplicates.length} duplicates skipped`);
      fetchData();
    } catch (e: any) {
      setBulkUpload(prev => ({ ...prev, status: 'Upload failed', errors: [e.message], progress: 0 }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-20">
      <div className="max-w-full mx-auto">
        <ReportHeader 
          currentUserDept={currentUser?.department || 'Registry'}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          currentFilterWeekNum={currentFilterWeekNum}
          canCreate={canCreate}
          onNewUpdateClick={() => { setEditingGoalId(null); setGoalTitle(''); setGoalComments(''); setTasks([]); setAiSuggestion(null); setSelectedKrId(''); setIsAddModalOpen(true); }}
          onTemplateDownload={downloadCSVTemplate}
          onBulkUpload={handleBulkUpload}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
        />

        {(isPartiallyLocked || isFullyLocked) && !isBypassActive && (
          <div className={`mt-4 px-4 py-3 rounded-xl flex items-center gap-3 ${isFullyLocked ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>
            <Lock size={18} />
            <span className="text-sm font-semibold">{isFullyLocked ? 'Report is locked - view only' : 'Status-Only Mode - can update task status only'}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : !currentUser ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={40} />
            </div>
            <p className="text-slate-400 font-semibold">Authentication Required</p>
            <p className="text-slate-300 text-sm mt-2">Please log in to access Weekly Reporting</p>
          </div>
        ) : (
          <div className="space-y-8">
            {availableKRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
                  <Target size={40} />
                </div>
                <p className="text-slate-400 font-semibold">No Key Results found for {selectedYear}</p>
                <p className="text-slate-300 text-sm mt-2">Create KRs in Quarterly KRs module first</p>
              </div>
            ) : (() => {
              const parentKRsOnly = availableKRs.filter(kr => !kr.parent_kr_id && kr.label.match(/^KR[1-4]$/));
              const seenLabels = new Set<string>();
              const uniqueParentKRs = parentKRsOnly.filter(kr => {
                const key = `${kr.quarter}-${kr.label}`;
                if (seenLabels.has(key)) return false;
                seenLabels.add(key);
                return true;
              });

              const allFilteredGoals = goals.filter(a => {
                const targetWeek = selectedWeek !== null ? selectedWeek : currentFilterWeekNum;
                return a.week === targetWeek && a.year === selectedYear && (isBypassActive || a.department === currentUser?.department);
              });

              const overallAvg = allFilteredGoals.length > 0
                ? Math.round(allFilteredGoals.reduce((sum, a) => sum + (a.score || 0), 0) / allFilteredGoals.length)
                : 0;
              
              const totalTasks = allFilteredGoals.reduce((sum, a) => {
                const tasks = Array.isArray(a.tasks) ? a.tasks : (typeof a.tasks === 'string' ? JSON.parse(a.tasks) : []);
                return sum + tasks.length;
              }, 0);
              const completedTasks = allFilteredGoals.reduce((sum, a) => {
                const tasks = Array.isArray(a.tasks) ? a.tasks : (typeof a.tasks === 'string' ? JSON.parse(a.tasks) : []);
                return sum + tasks.filter((t: Task) => t.status === TaskStatus.Done).length;
              }, 0);

              const lastWeekNum = currentFilterWeekNum - 1;
              const lastWeekYear = lastWeekNum < 1 ? selectedYear - 1 : selectedYear;
              const adjustedLastWeekNum = lastWeekNum < 1 ? 52 : lastWeekNum;
              const lastWeekGoals = goals.filter(a => a.week === adjustedLastWeekNum && a.year === lastWeekYear && (isBypassActive || a.department === currentUser?.department));
              const lastWeekNotDoneTasks = lastWeekGoals.flatMap(a => {
                const tasks = Array.isArray(a.tasks) ? a.tasks : (typeof a.tasks === 'string' ? JSON.parse(a.tasks) : []);
                return tasks.filter((t: Task) => t.status === TaskStatus.NotDone).map((t: Task) => ({ ...t, goalTitle: a.title, goalWeek: a.week, goalYear: a.year }));
              });

              return (
                <>
                  <ReportStats totalGoals={allFilteredGoals.length} overallAvg={overallAvg} completedTasks={completedTasks} totalTasks={totalTasks} department={currentUser?.department || 'N/A'} />
                  {lastWeekNotDoneTasks.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={20} className="text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-amber-800">Last Week Outstanding</h3>
                            <p className="text-xs text-amber-600">{lastWeekNotDoneTasks.length} pending tasks from W{adjustedLastWeekNum}</p>
                          </div>
                        </div>
                        <button onClick={() => setShowLastWeekOutstanding(!showLastWeekOutstanding)} className="text-amber-700 hover:text-amber-900 text-sm font-semibold">
                          {showLastWeekOutstanding ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                      {showLastWeekOutstanding && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {lastWeekNotDoneTasks.map((task, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-amber-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">W{task.activityWeek}</span>
                                <span className="text-[9px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Not Done</span>
                              </div>
                              <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-2">{task.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{task.goalTitle}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {uniqueParentKRs.map(kr => {
                    const targetWeek = selectedWeek !== null ? selectedWeek : currentFilterWeekNum;
                    const krGoals = goals.filter(a => a.key_result_id === kr.id && a.week === targetWeek && a.year === selectedYear && (isBypassActive || a.department === currentUser?.department));
                    const krAvg = krGoals.length > 0
                      ? Math.round(krGoals.reduce((sum, a) => sum + (a.score || 0), 0) / krGoals.length)
                      : 0;
                    return (
                      <div key={kr.id}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">{kr.label}</div>
                          <h2 className="text-lg font-semibold text-slate-800">{kr.title}</h2>
                          {krAvg > 0 && (
                            <span className="ml-auto px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{krAvg}% avg</span>
                          )}
                          <div className="h-px flex-grow bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {krGoals.map((a, i) => (
                            <GoalCard key={a.id} goal={a} index={i} keyResultLabel={kr.label}
onEdit={(act) => {
    if (!isBypassActive && (isPartiallyLocked || isFullyLocked)) {
      addToast('warning', isPartiallyLocked ? "Status-Only Mode" : "Report Locked", 4000);
      return;
    }
                                setEditingGoalId(act.id);
                                setSelectedKrId(act.key_result_id);
                                setGoalTitle(act.title);
                                setGoalComments(act.comments || '');
                                setTasks([...act.tasks]);
                                setAiSuggestion(null);
setIsAddModalOpen(true);
  }}
  onDelete={(id) => {
    if (!isBypassActive && (isPartiallyLocked || isFullyLocked)) {
      addToast('warning', "Report is locked", 4000);
      return;
    }
    setDeleteConfirm({ isOpen: true, goalId: id });
  }}
                              onTaskToggle={handleTaskStatusToggle}
                              isContentLocked={isFullyLocked} isPartiallyLocked={isPartiallyLocked} isBypassActive={isBypassActive} canModify={canModifyGoal(a)} />
                          ))}
                          {canCreate && !isFullyLocked && !isPartiallyLocked && (
                            <button onClick={() => { setEditingGoalId(null); setSelectedKrId(kr.id); setGoalTitle(''); setGoalComments(''); setTasks([]); setAiSuggestion(null); setIsAddModalOpen(true); }} className="min-h-[280px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:text-blue-500 hover:border-blue-200 transition-all group bg-slate-50/50">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={28} />
                              </div>
                              <span className="text-sm font-semibold">Add Goal</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}
      </div>
    
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Comments & Notes</h3>
            <p className="text-xs text-slate-400">Add general notes or observations for this reporting period</p>
          </div>
        </div>
        <RichTextEditor 
          value={generalComment} 
          onChange={setGeneralComment} 
          placeholder="Write your comments here... You can use formatting, lists, and more." 
        />
        <div className="flex justify-end mt-4">
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Comment
          </button>
        </div>
      </div>
    
<ReportForm
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setSelectedSubKrtag(''); }}
        editingGoalId={editingGoalId}
        selectedSubKrtag={selectedSubKrtag}
        setSelectedSubKrtag={setSelectedSubKrtag}
        availableSubKrtags={availableSubKrtags}
        goalTitle={goalTitle}
        setGoalTitle={setGoalTitle}
        goalComments={goalComments}
        setGoalComments={setGoalComments}
        tasks={tasks}
        setTasks={setTasks}
        currentTaskInput={currentTaskInput}
        setCurrentTaskInput={setCurrentTaskInput}
        onSave={saveGoal}
        onAddTask={handleAddTask}
        submitting={submitting}
        onVetTitle={vetTitleWithAI}
        isVetting={isVetting}
        aiSuggestion={aiSuggestion}
        setAiSuggestion={setAiSuggestion}
      />

  <ConfirmDialog
    isOpen={deleteConfirm.isOpen}
    onClose={() => setDeleteConfirm({ isOpen: false, goalId: null })}
    onConfirm={handleDeleteGoal}
    title="Delete Goal"
    message="Are you sure you want to delete this goal? This action cannot be undone."
    confirmLabel="Delete"
    variant="danger"
  />
</div>
);
};

export default ReportModule;
