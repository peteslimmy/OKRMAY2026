import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, User as UserIcon, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { User } from '../types';

interface UnifiedHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  currentUser: User | null;
  onOpenSearch?: () => void;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onOpenSearch,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userDisplayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'User';
  const userAvatarUrl = currentUser?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=fff7ed&color=ea580c&bold=true`;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full mb-0 sticky top-0 z-[40]"
    >
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between w-full h-[60px] px-4 lg:px-6 shadow-sm">

        {/* Left — mobile hamburger only (sidebar handles all nav) */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-slate-500 p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search bar — desktop */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Open search (Ctrl+K)"
          >
            <Search size={15} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="hidden lg:inline text-[10px] font-medium bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">

          {/* Search icon — mobile */}
          <button
            onClick={onOpenSearch}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Notifications */}
          <Link
            to="/governance/violations"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Violations & notifications"
          >
            <Bell size={18} />
            {/* Live pulse dot — will be driven by real data in a future iteration */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </Link>

          {/* Settings shortcut */}
          <Link
            to="/settings"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </Link>

          {/* User profile */}
          <div className="relative pl-2 ml-1 border-l border-slate-200">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2.5 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <img
                src={userAvatarUrl}
                className="w-8 h-8 rounded-full border-2 border-slate-200 object-cover"
                alt={`${userDisplayName} avatar`}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=fff7ed&color=ea580c&bold=true`; }}
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{userDisplayName}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{currentUser?.role || 'User'}</p>
              </div>
              <ChevronDown size={14} className={`hidden sm:block text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-[45]"
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-[50] overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{userDisplayName}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <SettingsIcon size={15} className="text-slate-400" />
                      Settings
                    </Link>
                    <Link
                      to="/integrity"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <UserIcon size={15} className="text-slate-400" />
                      My Profile
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
