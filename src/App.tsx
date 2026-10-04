import { useEffect, useCallback, useState } from 'react';
import { useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { TodayPage } from './pages/TodayPage';
import { GoalsPage } from './pages/GoalsPage';
import { GoalDetailPage } from './pages/GoalDetailPage';
import { HabitsPage } from './pages/HabitsPage';
import { FocusPage } from './pages/FocusPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { CommandPalette } from './components/CommandPalette';
import { ViewPage } from './types';

export default function App() {
  const { currentPage, theme, setTheme, selectedGoalId, setSelectedGoalId, setShowCommandPalette, showCommandPalette, user, goals } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    useStore.getState().cleanupOrphanedEvents();
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) setTheme(savedTheme);

    // If user is already authenticated from persistent storage, reconcile with cloud in background
    if (useStore.getState().user) {
      useStore.getState().loadCloudData();
    }

    // Flush any pending data sync when closing tab or backgrounding window
    const handleFlushSync = () => {
      const state = useStore.getState();
      if (state.user) {
        state.syncCloudData();
      }
    };

    window.addEventListener('beforeunload', handleFlushSync);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleFlushSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleFlushSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette(!showCommandPalette);
    }
    if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  }, [showCommandPalette, setShowCommandPalette]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderPage = () => {
    if (selectedGoalId) {
      const exists = (goals || []).some(g => g.id === selectedGoalId);
      if (exists) {
        return <GoalDetailPage />;
      }
    }
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'today': return <TodayPage />;
      case 'goals': return <GoalsPage />;
      case 'habits': return <HabitsPage />;
      case 'focus': return <FocusPage />;
      case 'calendar': return <CalendarPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <HomePage />;
    }
  };

// removed mounted check
  if (!user) return <LoginPage />;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#f8f9fb] dark:bg-[#0f1117] text-[#1a1d2e] dark:text-[#e4e6ed] transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderPage()}
      </main>
      {showCommandPalette && <CommandPalette />}
    </div>
  );
}
