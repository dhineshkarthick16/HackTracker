import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Plus, LogOut, User, Menu, X, Database, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onNavigate, currentPage }) => {
  const { user, logout, isLiveSupabase } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c111c]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile) + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                HackTrack
              </span>
            </div>
          </button>
        </div>

        {/* Center: System Mode Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          {isLiveSupabase ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-300 flex items-center gap-1">
                <Database className="w-3 h-3" /> Supabase Cloud Connected
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="font-mono text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Multi-User Local Engine (Zero-Config)
              </span>
            </>
          )}
        </div>

        {/* Right: Quick Add + User Profile Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('add-competition')}
            className="btn-primary py-1.5 px-3.5 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Competition</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* User Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm"
              aria-expanded={dropdownOpen}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline font-medium max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-slate-500">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1523] border border-slate-700/80 shadow-2xl py-1.5 z-50 animate-slide-up">
                <div className="px-4 py-2.5 border-b border-slate-800/80">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile & Settings
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
