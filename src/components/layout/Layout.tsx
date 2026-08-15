import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#080b11] text-slate-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
          currentPage={currentPage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>

        {/* Global Footer Credits */}
        <footer className="w-full border-t border-slate-800/80 bg-[#090d16]/80 backdrop-blur-sm py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">HackTrack</span>
              <span>— Modern Hackathon & Competition Tracking</span>
            </div>

            <div className="flex flex-col sm:items-end items-center gap-0.5 text-center sm:text-right">
              <div className="flex items-center gap-1.5">
                <span>Developed by</span>
                <a
                  href="https://www.linkedin.com/in/dhineshkarthick16/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 hover:underline"
                >
                  <span>Dhinesh Karthick D</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                © DK 2026
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
