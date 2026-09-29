import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { ViewPage } from '../types';
import { Search, Target, Zap, Flame, Timer, Calendar, BarChart3, Home, Plus, Sun, Moon } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: any;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const { setCurrentPage, setShowCommandPalette, addTask, addGoal, addHabit, theme, setTheme, goals, tasks } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'home', label: 'Go to Home', icon: Home, category: 'Navigation', action: () => { setCurrentPage('home'); setShowCommandPalette(false); } },
    { id: 'today', label: 'Go to Today', icon: Zap, category: 'Navigation', action: () => { setCurrentPage('today'); setShowCommandPalette(false); } },
    { id: 'goals', label: 'Go to Goals', icon: Target, category: 'Navigation', action: () => { setCurrentPage('goals'); setShowCommandPalette(false); } },
    { id: 'habits', label: 'Go to Habits', icon: Flame, category: 'Navigation', action: () => { setCurrentPage('habits'); setShowCommandPalette(false); } },
    { id: 'focus', label: 'Go to Focus', icon: Timer, category: 'Navigation', action: () => { setCurrentPage('focus'); setShowCommandPalette(false); } },
    { id: 'calendar', label: 'Go to Calendar', icon: Calendar, category: 'Navigation', action: () => { setCurrentPage('calendar'); setShowCommandPalette(false); } },
    { id: 'analytics', label: 'Go to Analytics', icon: BarChart3, category: 'Navigation', action: () => { setCurrentPage('analytics'); setShowCommandPalette(false); } },
    { id: 'new-task', label: 'Create New Task', icon: Plus, category: 'Create', action: () => { addTask({ title: 'New Task', priority: 'P3' }); setCurrentPage('today'); setShowCommandPalette(false); } },
    { id: 'new-goal', label: 'Create New Goal', icon: Plus, category: 'Create', action: () => { setCurrentPage('goals'); setShowCommandPalette(false); } },
    { id: 'new-habit', label: 'Create New Habit', icon: Plus, category: 'Create', action: () => { setCurrentPage('habits'); setShowCommandPalette(false); } },
    { id: 'start-focus', label: 'Start Focus Session', icon: Timer, category: 'Actions', action: () => { setCurrentPage('focus'); setShowCommandPalette(false); } },
    { id: 'theme-light', label: 'Switch to Light Mode', icon: Sun, category: 'Settings', action: () => { setTheme('light'); localStorage.setItem('theme', 'light'); } },
    { id: 'theme-dark', label: 'Switch to Dark Mode', icon: Moon, category: 'Settings', action: () => { setTheme('dark'); localStorage.setItem('theme', 'dark'); } },
  ];

  // Add goal shortcuts
  goals.slice(0, 5).forEach(g => {
    commands.push({
      id: `goal-${g.id}`,
      label: `Open Goal: ${g.title}`,
      icon: Target,
      category: 'Goals',
      action: () => { useStore.getState().setSelectedGoalId(g.id); setShowCommandPalette(false); },
    });
  });

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setShowCommandPalette(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#2d3044] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e7eb] dark:border-[#2d3044]">
          <Search className="w-4 h-4 text-[#9ca3af]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280] font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#9ca3af]">No results found</p>
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIndex
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'text-[#4b5563] dark:text-[#9ca3af] hover:bg-[#f9fafb] dark:hover:bg-[#1a1d2e]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm flex-1">{cmd.label}</span>
                  <span className="text-[10px] text-[#9ca3af]">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#e5e7eb] dark:border-[#2d3044] flex items-center gap-4 text-[10px] text-[#9ca3af]">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
