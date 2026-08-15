import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarDays, 
  UserCircle, 
  LogOut,
  X,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}) => {
  const { logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'competitions',
      label: 'Competitions',
      icon: FolderKanban,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserCircle,
    },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div className="p-5">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏆</span>
              <span className="text-lg font-bold text-white tracking-tight">HackTrack</span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create CTA */}
          <div className="mt-5">
            <button
              onClick={() => handleNavClick('add-competition')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Competition</span>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout & Credit */}
        <div className="p-5 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-rose-400" />
            <span>Logout</span>
          </button>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 text-center space-y-0.5">
            <div>
              <span>Developed by </span>
              <a
                href="https://www.linkedin.com/in/dhineshkarthick16/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Dhinesh Karthick D
              </a>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              © DK 2026
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
