import { useStore } from '../store';
import { ViewPage } from '../types';
import {
  Home, Target, Calendar, Flame, Timer, BarChart3,
  Inbox, ChevronRight, Zap, Sun, Moon, Monitor
} from 'lucide-react';

const navItems: { id: ViewPage; label: string; icon: any }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'today', label: 'Today', icon: Zap },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, theme, setTheme, selectedGoalId, setSelectedGoalId, getCurrentStreak } = useStore();
  const streak = getCurrentStreak();

  return (
    <aside className="w-[240px] h-full flex flex-col border-r border-[#e5e7eb] dark:border-[#1e2030] bg-[#ffffff] dark:bg-[#13151d] shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Momentum</h1>
          <p className="text-[10px] text-[#6b7280] dark:text-[#6b7280] tracking-wide uppercase">Goal System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id && !selectedGoalId;
          return (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSelectedGoalId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'text-[#4b5563] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d2e] hover:text-[#1f2937] dark:hover:text-[#e5e7eb]'
                }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              {item.label}
              {item.id === 'today' && streak > 0 && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                  {streak}🔥
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Streak Widget */}
      {streak > 0 && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/5 dark:to-amber-500/5 border border-orange-100 dark:border-orange-500/10">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">{streak} day streak</span>
          </div>
          <p className="text-[10px] text-orange-600/70 dark:text-orange-400/50 mt-1">Keep the momentum going!</p>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#f3f4f6] dark:bg-[#1a1d2e]">
          {(['light', 'dark', 'system'] as const).map((t) => {
            const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor;
            return (
              <button
                key={t}
                onClick={() => { setTheme(t); localStorage.setItem('theme', t); }}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all duration-150
                  ${theme === t
                    ? 'bg-white dark:bg-[#252836] shadow-sm text-[#1f2937] dark:text-[#e5e7eb]'
                    : 'text-[#9ca3af] hover:text-[#6b7280] dark:hover:text-[#d1d5db]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
