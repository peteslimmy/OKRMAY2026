/**
 * 4CORE OKR Platform - Header Component
 */

import React from 'react';
import { Menu, Bell, Search, Command } from 'lucide-react';
import { Avatar } from '../../shared/components/ui/Avatar';
import type { User } from '../../shared/types';
import { getRoleDisplayName, getRoleBadgeColor } from '../../shared/utils/permissions';

interface HeaderProps {
  currentUser: User;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors min-w-[280px]">
            <Search size={16} />
            <span>Search or type a command...</span>
            <div className="ml-auto flex items-center gap-1 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Dropdown */}
          <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{getRoleDisplayName(currentUser.role)}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role}
            </div>
            <Avatar
              src={currentUser.avatarUrl}
              name={currentUser.name}
              size="md"
            />
          </div>
        </div>
      </div>
    </header>
  );
};