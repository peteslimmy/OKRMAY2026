import jsPDF from 'jspdf';
import { supabase } from '../../lib/supabase';
import { getWATTime, getRegistryKeyResults, calculateGovernanceHealth, calculateBPI } from '../../utils';

export interface ComplianceReportData {
  generatedAt: string;
  week: number;
  year: number;
  quarter: string;
  governanceScore: number;
  totalGoals: number;
  compliantGoals: number;
  complianceRate: number;
  topPerformers: { name: string; score: number; bpi: number }[];
  bottomPerformers: { name: string; score: number; bpi: number }[];
  anomalies: { type: string; count: number }[];
  penalties: { userId: string; userName: string; amount: number }[];
}

export const generateCompliancePDF = async (week?: number, year?: number): Promise<Blob> => {
  const now = getWATTime();
  const targetWeek = week || Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (86400000 * 7));
  const targetYear = year || now.getFullYear();
  const quarterMap = ['Q1', 'Q1', 'Q1', 'Q2', 'Q2', 'Q2', 'Q3', 'Q3', 'Q3', 'Q4', 'Q4', 'Q4'];
  const quarter = quarterMap[now.getMonth()] as string;

  const governanceScore = await calculateGovernanceHealth();
  const { data: goals } = await supabase.from('activities').select('*').eq('week', targetWeek).eq('year', targetYear);
  const { data: auditLogs } = await supabase.from('audit_logs').select('*').eq('action', 'INTEGRITY_ADJUSTMENT').eq('week', targetWeek);
  const bpiScores = await calculateBPI();

  const totalGoals = (goals || []).length;
  const compliantGoals = (goals || []).filter((g: any) => (g.score || 0) >= 50).length;
  const complianceRate = totalGoals > 0 ? Math.round((compliantGoals / totalGoals) * 100) : 0;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('4CORE Compliance Report', 14, y + 10);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Week ${targetWeek}, ${targetYear} | ${quarter}`, 14, y + 20);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, y + 20, { align: 'right' });

  y += 45;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Governance Health Score', 14, y);
  y += 8;
  doc.setFontSize(36);
  const scoreColor = governanceScore >= 70 ? [16, 185, 129] : governanceScore >= 40 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${governanceScore}`, 14, y);
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`/100`, 50, y);
  y += 20;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Compliance Summary', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const summaryRows = [
    ['Total Goals Submitted', totalGoals.toString()],
    ['Compliant Goals (Score >= 50%)', compliantGoals.toString()],
    ['Non-Compliant Goals', (totalGoals - compliantGoals).toString()],
    ['Compliance Rate', `${complianceRate}%`],
    ['Penalty Adjustments', (auditLogs || []).length.toString()]
  ];

  for (const [label, value] of summaryRows) {
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 100, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
  }

  y += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Performers (BPI)', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const sortedBPI = [...bpiScores].sort((a, b) => b.overallBPI - a.overallBPI).slice(0, 5);
  for (const user of sortedBPI) {
    doc.text(`${user.rank}. ${user.userName}`, 20, y);
    doc.text(`BPI: ${user.overallBPI}`, 100, y);
    doc.text(`Dept: ${user.department}`, 140, y);
    y += 6;
  }

  y += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bottom 5 Performers (BPI)', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const bottomBPI = [...bpiScores].sort((a, b) => a.overallBPI - b.overallBPI).slice(0, 5);
  for (const user of bottomBPI) {
    doc.setTextColor(239, 68, 68);
    doc.text(`${user.userName}`, 20, y);
    doc.setTextColor(60, 60, 60);
    doc.text(`BPI: ${user.overallBPI}`, 100, y);
    doc.text(`Dept: ${user.department}`, 140, y);
    y += 6;
  }

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`4CORE Unified Governance Platform | Confidential`, pageWidth / 2, footerY, { align: 'center' });

  return doc.output('blob');
};

export const downloadCompliancePDF = async (week?: number, year?: number) => {
  const blob = await generateCompliancePDF(week, year);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `4CORE_Compliance_W${week || 'current'}_${new Date().toISOString().split('T')[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};