import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompetitionsListPage } from './pages/CompetitionsListPage';
import { CompetitionDetailsPage } from './pages/CompetitionDetailsPage';
import { CompetitionFormPage } from './pages/CompetitionFormPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProfilePage } from './pages/ProfilePage';
import { Trophy } from 'lucide-react';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navigationParams, setNavigationParams] = useState<Record<string, any>>({});

  // Sync with browser URL hash for friendly deep linking & back button support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      const [route, paramStr] = hash.split('?');
      
      if (route.startsWith('competitions/')) {
        const parts = route.split('/');
        if (parts.length === 3 && parts[2] === 'edit') {
          setCurrentPage('edit-competition');
          setNavigationParams({ id: parts[1] });
        } else if (parts.length === 2) {
          setCurrentPage('competition-details');
          setNavigationParams({ id: parts[1] });
        }
      } else {
        setCurrentPage(route || 'dashboard');
        setNavigationParams({});
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, params: Record<string, any> = {}) => {
    setCurrentPage(page);
    setNavigationParams(params);

    // Update URL hash
    if (page === 'competition-details' && params.id) {
      window.location.hash = `competitions/${params.id}`;
    } else if (page === 'edit-competition' && params.id) {
      window.location.hash = `competitions/${params.id}/edit`;
    } else {
      window.location.hash = page;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-bounce">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400 tracking-wider">
          INITIALIZING HACKTRACK...
        </p>
      </div>
    );
  }

  // Not authenticated: render Login / Register page
  if (!user) {
    return <AuthPage />;
  }

  // Authenticated: Render App Shell with Active Page
  return (
    <Layout currentPage={currentPage} onNavigate={navigate}>
      {currentPage === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      {currentPage === 'competitions' && <CompetitionsListPage onNavigate={navigate} />}
      {currentPage === 'competition-details' && (
        <CompetitionDetailsPage id={navigationParams.id} onNavigate={navigate} />
      )}
      {currentPage === 'add-competition' && <CompetitionFormPage onNavigate={navigate} />}
      {currentPage === 'edit-competition' && (
        <CompetitionFormPage id={navigationParams.id} onNavigate={navigate} />
      )}
      {currentPage === 'calendar' && <CalendarPage onNavigate={navigate} />}
      {currentPage === 'profile' && <ProfilePage />}
    </Layout>
  );
};
