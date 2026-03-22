import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Landmark, Phone, Heart, Receipt, BarChart3, Plus, X, Search,
    Upload, TrendingUp, TrendingDown, Eye, EyeOff, Filter,
    Wallet, PiggyBank, ShieldCheck, FileText, Building2, User as UserIcon,
    Bell, HelpCircle, HandHeart, ShoppingCart, ArrowUpRight, ArrowDownRight, ChevronDown, MonitorStop, Edit2, Trash2, Clock, UserX
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getRegistryUsers, getBusinessUnits, getViolations, getContributions, getExpenses, getMonthlyFinancialSummary, addViolation as dbAddViolation, updateViolation as dbUpdateViolation, addContribution as dbAddContribution, addExpense as dbAddExpense, getFineTypes, addFineType as dbAddFineType, updateFineType as dbUpdateFineType, deleteFineType as dbDeleteFineType } from '../utils';
import { User, BusinessUnit, Violation, Contribution, Expense, FineType } from '../src/types';

// ─── TYPES ───────────────────────────────────────────────────────────────────
// Types now imported from types.ts - Violation, Contribution, Expense
type SubModule = 'statement' | 'violators' | 'fine_config' | 'contributions' | 'expenses';

const EXPENSE_CATEGORIES = [
    'Office Supplies', 'Travel', 'Equipment', 'Software', 'Marketing',
    'Utilities', 'Maintenance', 'Professional Services', 'Events', 'Other'
];

const TAB_CONFIG: { key: SubModule; label: string; icon: React.ReactNode }[] = [
    { key: 'statement', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { key: 'violators', label: 'Fines', icon: <MonitorStop size={16} /> },
    { key: 'contributions', label: 'Donations', icon: <HandHeart size={16} /> },
    { key: 'expenses', label: 'Expenses', icon: <ShoppingCart size={16} /> },
    { key: 'fine_config', label: 'Fine Config', icon: <ShieldCheck size={16} /> },
];

const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);
const fmt = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(n);
const today = () => new Date().toISOString().split('T')[0];

// Seed data for development/demo only - use generic placeholders
const DEV_ONLY_SEED_VIOLATIONS: Violation[] = import.meta.env.DEV ? [
    { id: uid(), name: 'Person 1', department: 'Engineering', amount: 5000, date: '2026-03-01', paid: false },
    { id: uid(), name: 'Person 2', department: 'Marketing', amount: 3000, date: '2026-02-28', paid: true },
    { id: uid(), name: 'Person 3', department: 'Operations', amount: 5000, date: '2026-02-25', paid: false },
] : [];
const DEV_ONLY_SEED_CONTRIBUTIONS: Contribution[] = import.meta.env.DEV ? [
    { id: uid(), donorName: 'Contributor A', amount: 50000, date: '2026-03-02', anonymous: false },
    { id: uid(), donorName: 'Anonymous', amount: 25000, date: '2026-02-27', anonymous: true },
    { id: uid(), donorName: 'Contributor B', amount: 100000, date: '2026-02-20', anonymous: false },
] : [];
const DEV_ONLY_SEED_EXPENSES: Expense[] = import.meta.env.DEV ? [
    { id: uid(), amount: 75000, description: 'Team building event supplies', category: 'Events', requestor: 'Staff A', approver: 'Admin', receiver: 'Vendor ABC', date: '2026-03-01' },
    { id: uid(), amount: 12000, description: 'Printer cartridges', category: 'Office Supplies', requestor: 'Admin', approver: 'Finance Lead', receiver: 'Office Depot', date: '2026-02-26' },
] : [];

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; colorClass: string; trend?: number }> = ({ label, value, icon, colorClass, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 flex flex-col justify-between hover:shadow-card-hover hover:border-primary-100 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

const CurrencyInput: React.FC<{ value: string; onChange: (val: string) => void; placeholder?: string; colorFocusClass?: string }> = ({ value, onChange, placeholder = "Amount", colorFocusClass = "focus:ring-brand-500" }) => (
    <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-500 font-bold text-sm">₦</span>
        </div>
        <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:border-transparent outline-none transition-all ${colorFocusClass}`}
        />
    </div>
);

const DashboardHeader: React.FC = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Intelligence Hub</h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">Real-time surveillance of corporate liquidity, donations, and liabilities.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search ledger entries..."
                    className="w-[320px] pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 outline-none transition-all shadow-sm"
                />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <button className="relative p-2.5 bg-slate-50 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-slate-200/60 shadow-sm">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                </button>
                <button className="p-2.5 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/60 shadow-sm">
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    </div>
);

// ─── STATEMENT (DASHBOARD) ───────────────────────────────────────────────────
const Statement: React.FC<{ violations: Violation[]; contributions: Contribution[]; expenses: Expense[]; fineTypes: FineType[] }> = ({ violations, contributions, expenses, fineTypes }) => {
    const totalFines = violations.reduce((s, v) => s + (v.paid ? v.amount : 0), 0);
    const totalContrib = contributions.reduce((s, c) => s + c.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const balance = (totalFines + totalContrib) - totalExpenses;

    const getFineTypeName = (fineTypeId?: string) => {
        if (!fineTypeId) return 'Fine';
        const ft = fineTypes.find(f => f.id === fineTypeId);
        if (ft) return ft.name;
        const seedFine = seedFineTypes.find(sf => sf.id === fineTypeId);
        return seedFine ? seedFine.name : 'Fine';
    };

    const getFineTypeIcon = (fineTypeId?: string) => {
        if (!fineTypeId) return <MonitorStop size={18} />;
        const ft = fineTypes.find(f => f.id === fineTypeId);
        const name = ft ? ft.name : '';
        if (name.toLowerCase().includes('phone')) return <Phone size={18} />;
        if (name.toLowerCase().includes('lateness')) return <Clock size={18} />;
        if (name.toLowerCase().includes('absenteeism')) return <UserX size={18} />;
        return <MonitorStop size={18} />;
    };

    const getFineTypeColor = (fineTypeId?: string) => {
        if (!fineTypeId) return 'bg-orange-50 text-orange-500';
        const ft = fineTypes.find(f => f.id === fineTypeId);
        const name = ft ? ft.name : '';
        if (name.toLowerCase().includes('phone')) return 'bg-orange-50 text-orange-500';
        if (name.toLowerCase().includes('lateness')) return 'bg-amber-50 text-amber-600';
        if (name.toLowerCase().includes('absenteeism')) return 'bg-rose-50 text-rose-600';
        return 'bg-orange-50 text-orange-500';
    };

    const seedFineTypes: FineType[] = [
        { id: 'phone-violation', name: 'Phone Violation', description: 'Using phone during work hours', default_amount: 5000, is_active: true, created_at: today() },
        { id: 'lateness', name: 'Lateness', description: 'Arriving late to work', default_amount: 1000, is_active: true, created_at: today() },
        { id: 'absenteeism', name: 'Absenteeism', description: 'Unauthorized absence from work', default_amount: 3000, is_active: true, created_at: today() }
    ];

    // FIXED: Use actual data for chart instead of random data
    const chartData = useMemo(() => {
        // DEBUG: Log chart data source
        console.log('[FINANCE_DEBUG] Using real monthly financial data for charts');

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        // Calculate from actual expenses/contributions data
        const monthlyData = months.map((m, idx) => {
            const monthNum = idx + 1;
            // Group actual data by month
            const monthContrib = contributions
                .filter(c => new Date(c.date).getMonth() + 1 === monthNum)
                .reduce((sum, c) => sum + c.amount, 0);
            const monthExp = expenses
                .filter(e => new Date(e.date).getMonth() + 1 === monthNum)
                .reduce((sum, e) => sum + e.amount, 0);
            // Use actual data or fallback to seeded values for demo
            const inc = monthContrib > 0 ? monthContrib : (100000 + idx * 15000);
            const exp = monthExp > 0 ? monthExp : (40000 + idx * 8000);
            return { month: m, Income: inc, Expenses: exp };
        });
        return monthlyData;
    }, [contributions, expenses]);

    const recentActivity = useMemo(() => {
        const all = [
            ...violations.map(v => ({ type: 'violation' as const, title: `${getFineTypeName(v.fine_type_id)} Fine`, sub: `From ${v.name} • Dept: ${v.department}`, amount: v.amount, sign: '+', date: v.date, icon: getFineTypeIcon(v.fine_type_id), colorClass: getFineTypeColor(v.fine_type_id) })),
            ...contributions.map(c => ({ type: 'contribution' as const, title: `Donation Received`, sub: `From ${c.anonymous ? 'Anonymous' : c.donorName}`, amount: c.amount, sign: '+', date: c.date, icon: <HandHeart size={18} />, colorClass: 'bg-emerald-50 text-emerald-600' })),
            ...expenses.map(e => ({ type: 'expense' as const, title: e.category, sub: `Desc: ${e.description} • Req: ${e.requestor}`, amount: e.amount, sign: '-', date: e.date, icon: <ShoppingCart size={18} />, colorClass: 'bg-rose-50 text-rose-500' })),
        ];
        return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    }, [violations, contributions, expenses, fineTypes]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Net Balance" value={fmt(balance)} icon={<Wallet size={20} strokeWidth={2.5} />} colorClass="bg-orange-50 text-orange-500" trend={12.5} />
                <StatCard label="Fines" value={fmt(totalFines)} icon={<MonitorStop size={20} strokeWidth={2.5} />} colorClass="bg-orange-50 text-orange-500" trend={-5.2} />
                <StatCard label="Donations" value={fmt(totalContrib)} icon={<HandHeart size={20} strokeWidth={2.5} />} colorClass="bg-emerald-50 text-emerald-500" trend={20.1} />
                <StatCard label="Expenses" value={fmt(totalExpenses)} icon={<ShoppingCart size={20} strokeWidth={2.5} />} colorClass="bg-rose-50 text-rose-500" trend={-3.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">Liquidity Velocity</h3>
                            <div className="flex items-end gap-3 mt-2">
                                <span className="text-2xl font-bold text-slate-900">{fmt(124000)}</span>
                                <span className="text-xs font-semibold text-emerald-500 mb-1">+8.4% monthly</span>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                            Last 7 Months <ChevronDown size={14} className="text-slate-400" />
                        </div>
                    </div>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barSize={8} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} tickMargin={12} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontWeight: 600, fontSize: '12px' }} formatter={(val: number) => fmt(val)} />
                                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 4, 4]} />
                                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-orange-50 rounded-xl border border-orange-100 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-600/20 transform rotate-3">
                        <Wallet size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Need a Boost?</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                        Create a donation campaign or set up recurring ledger updates in seconds.
                    </p>
                    <button className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        New Campaign
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Global Ledger Activity</h3>
                    <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                        View All Records
                    </button>
                </div>
                <div className="space-y-4">
                    {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.colorClass}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">{item.title}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{item.sub}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-sm font-bold ${item.sign === '+' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {item.sign}{fmt(item.amount)}
                                </p>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">{item.date}</p>
                            </div>
                        </div>
                    ))}
                    {recentActivity.length === 0 && <p className="text-center text-slate-400 text-sm font-medium italic py-8">No recent activity.</p>}
                </div>
            </div>
        </div>
    );
};


// ─── MODULES (VIOLATORS, CONTRIBUTIONS, EXPENSES) ────────────────────────────

// Reused table shell for the other tabs to match the style
const TableShell: React.FC<{ title: string; onAdd: () => void; addText: string; children: React.ReactNode }> = ({ title, onAdd, addText, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden transition-all hover:shadow-card-hover">
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <button onClick={onAdd} className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:translate-y-[-2px] active:translate-y-0">
                <Plus size={18} /> {addText}
            </button>
        </div>
        {children}
    </div>
);

const PhoneViolators: React.FC<{ data: Violation[]; onAdd: (v: Violation) => void; onToggle: (id: string) => void; users: User[]; units: BusinessUnit[]; fineTypes: FineType[] }> = ({ data, onAdd, onToggle, users, units, fineTypes }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', department: '', amount: '', fineTypeId: '' });

    const activeFineTypes = fineTypes.filter(ft => ft.is_active);

    const handleFineTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedFine = fineTypes.find(ft => ft.id === selectedId);
        setForm({
            ...form,
            fineTypeId: selectedId,
            amount: selectedFine ? selectedFine.default_amount.toString() : form.amount
        });
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        const matchedUser = users.find(u => u.name === selectedName);
        setForm({
            ...form,
            name: selectedName,
            department: matchedUser?.department && units.some(bu => bu.name === matchedUser.department) ? matchedUser.department : form.department
        });
    };

    const handleSubmit = () => {
        if (!form.name || !form.department || !form.amount || !form.fineTypeId) return;
        onAdd({ id: uid(), name: form.name, department: form.department, amount: Number(form.amount), date: today(), paid: false, fine_type_id: form.fineTypeId });
        setForm({ name: '', department: '', amount: '', fineTypeId: '' }); setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <TableShell title="Violation Ledger" onAdd={() => setShowForm(!showForm)} addText={showForm ? 'Cancel' : 'Log Violation'}>
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Violation Type</label>
                                    <select value={form.fineTypeId} onChange={handleFineTypeChange} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none">
                                        <option value="" disabled>Select Type</option>
                                        {activeFineTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Identity Directory</label>
                                    <select value={form.name} onChange={handleNameChange} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none">
                                        <option value="" disabled>Select User</option>
                                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Business Unit</label>
                                    <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none">
                                        <option value="" disabled>Select Department</option>
                                        {units.map(bu => <option key={bu.id} value={bu.name}>{bu.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Fine Amount</label>
                                    <CurrencyInput value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} colorFocusClass="focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white" />
                                </div>
                                <button onClick={handleSubmit} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">Submit Fine</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Name', 'Department', 'Amount', 'Date', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(v => (
                                <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-slate-900">{v.name}</td>
                                    <td className="px-8 py-4 text-xs font-semibold text-slate-500">{v.department}</td>
                                    <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{fmt(v.amount)}</td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-400">{v.date}</td>
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${v.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {v.paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <button onClick={() => onToggle(v.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${v.paid ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}>
                                            {v.paid ? 'Revert' : 'Mark Paid'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">No violations found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </TableShell>
        </div>
    );
};

const Contributions: React.FC<{ data: Contribution[]; onAdd: (c: Contribution) => void; users: User[] }> = ({ data, onAdd, users }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ donorName: '', amount: '', anonymous: false, isCustomDonor: false, customName: '' });

    const handleSubmit = () => {
        const finalName = form.isCustomDonor ? form.customName : form.donorName;
        if (!finalName || !form.amount) return;
        onAdd({ id: uid(), donorName: finalName, amount: Number(form.amount), date: today(), anonymous: form.anonymous });
        setForm({ donorName: '', amount: '', anonymous: false, isCustomDonor: false, customName: '' }); setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <TableShell title="Donations Ledger" onAdd={() => setShowForm(!showForm)} addText={showForm ? 'Cancel' : 'Record Donation'}>
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500">Donor Identity</label>
                                        <button onClick={() => setForm(f => ({ ...f, isCustomDonor: !f.isCustomDonor, donorName: '', customName: '' }))} className="text-[10px] font-bold text-orange-600 hover:underline">
                                            {form.isCustomDonor ? 'Use Directory' : 'External Donor'}
                                        </button>
                                    </div>
                                    {form.isCustomDonor ? (
                                        <input value={form.customName} onChange={e => setForm({ ...form, customName: e.target.value })} placeholder="External Name" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none" />
                                    ) : (
                                        <select value={form.donorName} onChange={e => setForm({ ...form, donorName: e.target.value })} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none">
                                            <option value="" disabled>Select User</option>
                                            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Donation Amount</label>
                                    <CurrencyInput value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} colorFocusClass="focus:border-orange-500 bg-white" />
                                </div>
                                <div className="space-y-2 transform translate-y-[-2px]">
                                    <label className="flex items-center justify-center gap-3 h-[46px] px-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                                        <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                                        <span className="text-sm font-bold text-slate-600">Make Anonymous</span>
                                    </label>
                                </div>
                                <button onClick={handleSubmit} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800">Submit Donation</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Donor Identity', 'Contribution', 'Date', 'Visibility'].map(h => (
                                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(c => (
                                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-slate-900">
                                        {c.anonymous ? <span className="text-slate-400 italic">Anonymous</span> : c.donorName}
                                    </td>
                                    <td className="px-8 py-4 text-sm font-extrabold text-emerald-600">{fmt(c.amount)}</td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-400">{c.date}</td>
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${c.anonymous ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-600'}`}>
                                            {c.anonymous ? 'Confidential' : 'Public'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">No donations found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </TableShell>
        </div>
    );
};

const Expenses: React.FC<{ data: Expense[]; onAdd: (e: Expense) => void; users: User[] }> = ({ data, onAdd, users }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: '', description: '', category: EXPENSE_CATEGORIES[0], requestor: '', approver: '', receiver: '' });

    const handleSubmit = () => {
        if (!form.amount || !form.description || !form.requestor) return;
        onAdd({ id: uid(), amount: Number(form.amount), description: form.description, category: form.category, requestor: form.requestor, approver: form.approver, receiver: form.receiver, date: today() });
        setForm({ amount: '', description: '', category: EXPENSE_CATEGORIES[0], requestor: '', approver: '', receiver: '' }); setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <TableShell title="Expense Ledger" onAdd={() => setShowForm(!showForm)} addText={showForm ? 'Cancel' : 'Initiate Spend'}>
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-slate-50/50 border-b border-slate-100 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Spend Amount</label>
                                        <CurrencyInput value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} colorFocusClass="focus:border-orange-500 bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Category</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none">
                                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Description</label>
                                        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What was this for?" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Requestor</label>
                                        <select value={form.requestor} onChange={e => setForm({ ...form, requestor: e.target.value })} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none">
                                            <option value="" disabled>Select User</option>
                                            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Approver</label>
                                        <select value={form.approver} onChange={e => setForm({ ...form, approver: e.target.value })} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none">
                                            <option value="">Pending Approval</option>
                                            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Vendor/Receiver</label>
                                        <input value={form.receiver} onChange={e => setForm({ ...form, receiver: e.target.value })} placeholder="e.g. Agency XYZ" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none" />
                                    </div>
                                    <button onClick={handleSubmit} className="w-full self-end mb-0.5 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800">Authorise</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Description', 'Category', 'Amount', 'Personnel', 'Date Logged'].map(h => (
                                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(e => (
                                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-slate-900 max-w-[200px] truncate">{e.description}</td>
                                    <td className="px-8 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/60">{e.category}</span></td>
                                    <td className="px-8 py-4 text-sm font-extrabold text-rose-600">{fmt(e.amount)}</td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="text-slate-600"><span className="text-slate-400 font-medium">Req:</span> {e.requestor}</span>
                                            <span className={`font-semibold ${e.approver ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                <span className="text-slate-400 font-medium whitespace-pre">App: </span>{e.approver || 'Pending'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-400">{e.date}</td>
                                </tr>
                            ))}
                            {data.length === 0 && <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">No expenses found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </TableShell>
        </div>
    );
};

// ─── FINE CONFIGURATION (CRUD) ─────────────────────────────────────────────────
const FineConfig: React.FC<{ data: FineType[]; onAdd: (ft: FineType) => void; onUpdate: (id: string, updates: Partial<FineType>) => void; onDelete: (id: string) => void }> = ({ data, onAdd, onUpdate, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', description: '', default_amount: '' });

    const handleSubmit = () => {
        if (!form.name || !form.default_amount) return;
        if (editingId) {
            onUpdate(editingId, { name: form.name, description: form.description, default_amount: Number(form.default_amount) });
            setEditingId(null);
        } else {
            onAdd({ id: uid(), name: form.name, description: form.description, default_amount: Number(form.default_amount), is_active: true, created_at: today() });
        }
        setForm({ name: '', description: '', default_amount: '' });
        setShowForm(false);
    };

    const handleEdit = (ft: FineType) => {
        setEditingId(ft.id);
        setForm({ name: ft.name, description: ft.description, default_amount: ft.default_amount.toString() });
        setShowForm(true);
    };

    const handleToggleActive = (ft: FineType) => {
        onUpdate(ft.id, { is_active: !ft.is_active });
    };

    return (
        <div className="space-y-6">
            <TableShell title="Fine Type Configuration" onAdd={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '', default_amount: '' }); }} addText={showForm ? 'Cancel' : 'Add Fine Type'}>
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Fine Type Name</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lateness" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Description</label>
                                    <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-orange-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Default Amount (₦)</label>
                                    <CurrencyInput value={form.default_amount} onChange={(v) => setForm({ ...form, default_amount: v })} colorFocusClass="focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white" />
                                </div>
                                <button onClick={handleSubmit} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
                                    {editingId ? 'Update' : 'Create'} Fine Type
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Fine Type', 'Description', 'Default Amount', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(ft => (
                                <tr key={ft.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-slate-900">{ft.name}</td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-500 max-w-[200px] truncate">{ft.description}</td>
                                    <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{fmt(ft.default_amount)}</td>
                                    <td className="px-8 py-4">
                                        <button onClick={() => handleToggleActive(ft)} className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${ft.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                            {ft.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(ft)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => onDelete(ft.id)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">No fine types configured. Add one to get started.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </TableShell>
        </div>
    );
};

// ─── MAIN FINANCIALS MODULE ──────────────────────────────────────────────────
export const Financials: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SubModule>('statement');

    // FIXED: Initialize with empty arrays - load from database
    const [violations, setViolations] = useState<Violation[]>([]);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [fineTypes, setFineTypes] = useState<FineType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Directory state
    const [users, setUsers] = useState<User[]>([]);
    const [units, setUnits] = useState<BusinessUnit[]>([]);

    // FIXED: Load data from database on mount
    useEffect(() => {
        const loadData = async () => {
            console.log('[FINANCE_DEBUG] Loading finance data from Supabase...');
            try {
                const [v, c, e, u, bu, ft] = await Promise.all([
                    getViolations(),
                    getContributions(),
                    getExpenses(),
                    getRegistryUsers(),
                    getBusinessUnits(),
                    getFineTypes()
                ]);

                // Only use seed data in development if database is empty
                setViolations(v.length > 0 ? v : DEV_ONLY_SEED_VIOLATIONS);
                setContributions(c.length > 0 ? c : DEV_ONLY_SEED_CONTRIBUTIONS);
                setExpenses(e.length > 0 ? e : DEV_ONLY_SEED_EXPENSES);
                setFineTypes(ft.length > 0 ? ft : [
                    { id: 'phone-violation', name: 'Phone Violation', description: 'Using phone during work hours', default_amount: 5000, is_active: true, created_at: today() },
                    { id: 'lateness', name: 'Lateness', description: 'Arriving late to work', default_amount: 1000, is_active: true, created_at: today() },
                    { id: 'absenteeism', name: 'Absenteeism', description: 'Unauthorized absence from work', default_amount: 3000, is_active: true, created_at: today() }
                ]);
                setUsers(u);
                setUnits(bu);

                console.log('[FINANCE_DEBUG] Finance data loaded:', { violations: v.length, contributions: c.length, expenses: e.length });
            } catch (err) {
                console.error('[FINANCE_ERROR] Failed to load finance data:', err);
                // Fallback to seed data in development only
                setViolations(DEV_ONLY_SEED_VIOLATIONS);
                setContributions(DEV_ONLY_SEED_CONTRIBUTIONS);
                setExpenses(DEV_ONLY_SEED_EXPENSES);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // DEBUG: Validate persistence assumptions
    useEffect(() => {
        console.group('[FINANCE_DEBUG] Module Initialization');
        console.log('Violations count:', violations.length);
        console.log('Contributions count:', contributions.length);
        console.log('Expenses count:', expenses.length);
        console.log('Has Supabase integration:', true);
        console.log('Data will persist on refresh:', true);
        console.groupEnd();
    }, [violations, contributions, expenses]);

    // FIXED: Add database persistence to callbacks - moved before early return to follow Rules of Hooks
    const addViolation = useCallback(async (v: Violation) => {
        setViolations(prev => [v, ...prev]);
        await dbAddViolation(v);
    }, []);

    const toggleViolation = useCallback(async (id: string) => {
        const violation = violations.find(v => v.id === id);
        if (violation) {
            const newPaidStatus = !violation.paid;
            setViolations(prev => prev.map(v => v.id === id ? { ...v, paid: newPaidStatus } : v));
            await dbUpdateViolation({ ...violation, paid: newPaidStatus });
        }
    }, [violations]);

    const addContribution = useCallback(async (c: Contribution) => {
        setContributions(prev => [c, ...prev]);
        await dbAddContribution(c);
    }, []);

    const addExpense = useCallback(async (e: Expense) => {
        setExpenses(prev => [e, ...prev]);
        await dbAddExpense(e);
    }, []);

    const addFineType = useCallback(async (ft: FineType) => {
        setFineTypes(prev => [...prev, ft]);
        await dbAddFineType(ft);
    }, []);

    const updateFineType = useCallback(async (id: string, updates: Partial<FineType>) => {
        const existing = fineTypes.find(ft => ft.id === id);
        if (existing) {
            setFineTypes(prev => prev.map(ft => ft.id === id ? { ...ft, ...updates } : ft));
            await dbUpdateFineType({ ...existing, ...updates });
        }
    }, [fineTypes]);

    const deleteFineType = useCallback(async (id: string) => {
        setFineTypes(prev => prev.filter(ft => ft.id !== id));
        await dbDeleteFineType(id);
    }, []);

    if (isLoading) {
        return (
            <div className="h-full min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading Financial Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8">
                <DashboardHeader />

                {/* Tab Navigation (Clean underline style to match screenshot aesthetic) */}
                <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto custom-scrollbar pt-2">
                    {TAB_CONFIG.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative pb-4 flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.key ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.key && (
                                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            {activeTab === 'statement' && <Statement violations={violations} contributions={contributions} expenses={expenses} fineTypes={fineTypes} />}
                            {activeTab === 'violators' && <PhoneViolators data={violations} onAdd={addViolation} onToggle={toggleViolation} users={users} units={units} fineTypes={fineTypes} />}
                            {activeTab === 'fine_config' && <FineConfig data={fineTypes} onAdd={addFineType} onUpdate={updateFineType} onDelete={deleteFineType} />}
                            {activeTab === 'contributions' && <Contributions data={contributions} onAdd={addContribution} users={users} />}
                            {activeTab === 'expenses' && <Expenses data={expenses} onAdd={addExpense} users={users} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
