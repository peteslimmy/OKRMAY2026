import { UserRole } from '../types';

export const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  'CEO': { bg: '#1e293b', text: '#fff' },
  'Finance': { bg: '#059669', text: '#fff' },
  'HR': { bg: '#7c3aed', text: '#fff' },
  'Operations': { bg: '#ea580c', text: '#fff' },
  'Technology': { bg: '#2563eb', text: '#fff' },
  'Marketing': { bg: '#db2777', text: '#fff' },
  'Sales': { bg: '#16a34a', text: '#fff' },
  'Legal': { bg: '#9333ea', text: '#fff' },
  'Registry': { bg: '#0891b2', text: '#fff' },
  'BUS.DEV': { bg: '#d97706', text: '#fff' },
};

export const getDeptAbbr = (dept: string): string => {
  if (!dept) return '??';
  const words = dept.trim().split(/\s+/);
  if (words.length === 1) return dept.slice(0, 2).toUpperCase();
  return words.map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

export const getDeptColor = (dept: string): { bg: string; text: string } => {
  if (!dept) return { bg: '#64748b', text: '#fff' };
  if (DEPT_COLORS[dept]) return DEPT_COLORS[dept];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return { bg: `hsl(${hue}, 60%, 45%)`, text: '#fff' };
};
