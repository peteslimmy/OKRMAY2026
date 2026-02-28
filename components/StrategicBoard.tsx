
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Lock, FileText, CalendarDays, UserRound, AlertTriangle } from 'lucide-react';
import {
  getStrategicNotes, addStrategicNote, updateStrategicNote, deleteStrategicNote,
  getSessionUser, getRegistryUsers, canManageObjectives, getWATTime, getCurrentWeekNumber, logAudit,
  getRecentWeekRanges, generateLocalUUID
} from '../utils';
import { RichTextEditor } from './RichTextEditor';
import { StrategicNote, User } from '../types';
import DOMPurify from 'dompurify';

interface StrategicNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<StrategicNote>) => void;
  noteToEdit: Partial<StrategicNote> | null;
  canEdit: boolean;
}

const StrategicNoteModal: React.FC<StrategicNoteModalProps> = ({ isOpen, onClose, onSave, noteToEdit, canEdit }) => {
  const currentWeekInfo = getCurrentWeekNumber();
  const defaultWeekValue = `Week ${currentWeekInfo.week.split(' ')[1]}, ${currentWeekInfo.year}`;

  const [formData, setFormData] = useState<Partial<StrategicNote>>(noteToEdit || {
    title: '',
    content: '',
    week: defaultWeekValue,
    year: currentWeekInfo.year,
  });

  const recentWeekRanges = getRecentWeekRanges();

  useEffect(() => {
    if (isOpen) {
      setFormData(noteToEdit || {
        title: '',
        content: '',
        week: defaultWeekValue,
        year: currentWeekInfo.year,
      });
    }
  }, [isOpen, noteToEdit, defaultWeekValue, currentWeekInfo.year]);

  const handleSave = () => {
    if (!canEdit) return;
    if (!formData.title?.trim() || !formData.content?.trim() || !formData.week) {
      alert('Please provide a title, select a week, and add content for the note.');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {noteToEdit?.id ? 'Edit Session Note' : 'Add New Session Note'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label htmlFor="note-title" className="block text-sm font-medium text-slate-700 mb-2">Session Title</label>
            <input
              id="note-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Q3 Planning Meeting Summary"
              className="w-full p-3 bg-white border border-slate-200 rounded-[4px] text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
              disabled={!canEdit}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="note-week" className="block text-sm font-medium text-slate-700 mb-2">Week</label>
              <select
                id="note-week"
                value={formData.week}
                onChange={(e) => {
                  // Ensure correct parsing of week label
                  const selectedLabel = e.target.value;
                  const weekMatch = selectedLabel.match(/Week (\d+)/);
                  const yearMatch = selectedLabel.match(/, (\d{4})$/);
                  const weekNum = weekMatch ? `Week ${weekMatch[1]}` : currentWeekInfo.week;
                  const yearNum = yearMatch ? parseInt(yearMatch[1]) : currentWeekInfo.year;

                  setFormData({ ...formData, week: weekNum, year: yearNum });
                }}
                className="w-full p-3 bg-white border border-slate-200 rounded-[4px] text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                disabled={!canEdit}
              >
                {recentWeekRanges.map((range) => (
                  <option key={range.value} value={range.label}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="note-year" className="block text-sm font-medium text-slate-700 mb-2">Year</label>
              <input
                id="note-year"
                type="number"
                value={formData.year}
                readOnly
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-[4px] text-sm cursor-not-allowed"
                disabled={!canEdit}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Note Content</label>
            <RichTextEditor
              value={formData.content || ''}
              onChange={(val) => setFormData({ ...formData, content: val })}
              placeholder="Detailed notes from the session..."
              rows={8}
              readOnly={!canEdit}
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!canEdit || !formData.title?.trim() || !formData.content?.trim() || !formData.week}
            className="px-5 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-[4px] hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
          >
            {noteToEdit?.id ? 'Save Changes' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StrategicBoardProps {
  selectedYear: number;
}

export const StrategicBoard: React.FC<StrategicBoardProps> = ({ selectedYear }) => {
  const [notes, setNotes] = useState<StrategicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [registry, setRegistry] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Partial<StrategicNote> | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<StrategicNote | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // canManageObjectives is an asynchronous function; use state and resolve it in useEffect.
  const [canManage, setCanManage] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    const fetchedNotes = await getStrategicNotes();
    setNotes(fetchedNotes.filter(note => note.year === selectedYear));
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();

    // Initial fetch for registry and user
    getRegistryUsers().then(setRegistry);
    getSessionUser().then(setCurrentUser);
    // Resolve canManageObjectives promise on load and year change.
    canManageObjectives().then(setCanManage);

    const handleUserUpdate = () => {
      getRegistryUsers().then(setRegistry);
      getSessionUser().then(setCurrentUser);
      canManageObjectives().then(setCanManage);
    };
    window.addEventListener('4COREUserUpdate', handleUserUpdate);
    return () => window.removeEventListener('4COREUserUpdate', handleUserUpdate);
  }, [selectedYear]);

  const handleAddNote = () => {
    if (!canManage) {
      alert("You do not have permission to add notes to the Strategic Board.");
      return;
    }
    setNoteToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditNote = (note: StrategicNote) => {
    if (!canManage) {
      alert("You do not have permission to edit notes on the Strategic Board.");
      return;
    }
    setNoteToEdit(note);
    setIsAddEditModalOpen(true);
  };

  const handleSaveNote = async (savedNote: Partial<StrategicNote>) => {
    const user = await getSessionUser();
    const noteWithMetadata = {
      ...savedNote,
      owner_id: savedNote.owner_id || user?.id || 'SYSTEM',
      timestamp: savedNote.timestamp || getWATTime().toISOString(),
      year: savedNote.year || selectedYear
    } as StrategicNote;

    if (noteWithMetadata.id) {
      await updateStrategicNote(noteWithMetadata);
    } else {
      await addStrategicNote(noteWithMetadata);
    }
    fetchNotes();
    setIsAddEditModalOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (!canManage) {
      alert("You do not have permission to delete notes from the Strategic Board.");
      return;
    }
    const note = notes.find(n => n.id === id); // Find the note object to pass to the modal
    if (note) {
      setNoteToDelete(note); // Set the full note object for deletion confirmation
    }
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await deleteStrategicNote(noteToDelete.id); // Use the utility function for in-memory deletion
      fetchNotes();
      setNoteToDelete(null); // Clear the noteToDelete state
    }
  };

  if (!canManage && notes.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-white/70 backdrop-blur-xl p-8 rounded-[4px] shadow-lg border border-white/20">
        <Lock className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium">Access Restricted or No Notes Available</h3>
        <p className="text-sm text-slate-500">You do not have permission to manage strategic notes, and no notes have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-[4px] border border-white/20 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">OKR Session Notes</h2>
          <p className="text-sm text-slate-500 mt-1">Capture and review weekly OKR session summaries and action items.</p>
        </div>
        {canManage && (
          <button
            onClick={handleAddNote}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-[4px] text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Session Note
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] text-slate-400 bg-white/70 backdrop-blur-xl p-8 rounded-[4px] shadow-lg border border-white/20">
          <span className="animate-spin text-primary-500"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-8-8c-1.577 0-3.072.396-4.382 1.056L4 10m-2 2h4l2 3h4l2-3h4"></path></svg></span>
          <span className="ml-3">Loading session notes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 ? (
            <div className="lg:col-span-3 flex flex-col items-center justify-center min-h-[200px] text-slate-400 bg-white/70 backdrop-blur-xl p-8 rounded-[4px] shadow-lg border border-white/20">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No session notes found.</p>
              {canManage && <p className="text-sm text-slate-500 mt-2">Click "Add New Session Note" to get started.</p>}
            </div>
          ) : (
            notes.map((note) => {
              const owner = registry.find(u => u.id === note.owner_id);
              return (
                <div key={note.id} className="bg-white p-6 rounded-[4px] shadow-lg border border-slate-200/80 hover:shadow-xl transition-shadow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center justify-between">
                      {note.title}
                      {canManage && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-[4px]"
                            title="Edit Note"
                          ><Edit2 size={16} /></button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px]"
                            title="Delete Note"
                          ><Trash2 size={16} /></button>
                        </div>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span>{note.week}, {note.year}</span>
                      {owner && (
                        <span className="flex items-center gap-1 ml-auto">
                          <UserRound size={14} className="text-slate-400" />
                          {owner.name}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-sm text-slate-600 rich-text-content overflow-hidden max-h-40 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                    Last Updated: {new Date(note.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {isAddEditModalOpen && (
        <StrategicNoteModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          onSave={handleSaveNote}
          noteToEdit={noteToEdit}
          canEdit={canManage}
        />
      )}

      {noteToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4 animate-fade-in font-montserrat">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-7xl animate-scale-in border border-slate-100 overflow-hidden">
            <div className="p-12 md:p-16 flex flex-col md:flex-row items-start gap-8">
              {/* Icon Container - Matching Screenshot */}
              <div className="shrink-0">
                <div className="w-16 h-16 bg-[#fff1f2] rounded-[4px] flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-[#e11d48]" />
                </div>
              </div>

              {/* Text Content - Matching Screenshot */}
              <div className="flex-1 space-y-4">
                <h3 className="text-[28px] font-bold text-[#0f172a] tracking-tight">Delete Strategic Record?</h3>
                <p className="text-[16px] text-[#64748b] leading-relaxed">
                  This action will permanently remove <span className="font-bold text-[#0f172a]">{noteToDelete.title}</span> from the governance cloud.
                </p>
              </div>
            </div>

            {/* Buttons - Matching Screenshot Alignment and Style */}
            <div className="px-12 pb-12 md:px-16 md:pb-16 flex items-center justify-between gap-6">
              <button
                onClick={() => setNoteToDelete(null)}
                className="text-[13px] font-black text-[#64748b] uppercase tracking-[0.1em] hover:text-[#0f172a] transition-colors"
              >
                CANCEL
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 max-w-lg py-5 bg-[#e11d48] text-white rounded-[4px] font-black text-[13px] uppercase tracking-[0.1em] shadow-xl shadow-rose-500/20 hover:bg-[#be123c] active:scale-[0.98] transition-all"
              >
                CONFIRM DELETION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





