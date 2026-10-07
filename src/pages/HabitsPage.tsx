import { useState } from 'react';
import { useStore } from '../store';
import { format, subDays } from 'date-fns';
import { Plus, Flame, CheckCircle2, Trash2 } from 'lucide-react';

export function HabitsPage() {
  const { habits, habitCompletions, addHabit, deleteHabit, toggleHabitCompletion, goals } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: 'daily' as const, target: 1, unit: 'times', color: '#6366f1' });
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleCreate = () => {
    if (!newHabit.name.trim()) return;
    addHabit(newHabit);
    setNewHabit({ name: '', frequency: 'daily', target: 1, unit: 'times', color: '#6366f1' });
    setShowCreate(false);
  };

  const last14Days = Array.from({ length: 14 }, (_, i) => format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'));

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Build consistency, one day at a time</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
          <h3 className="text-sm font-semibold mb-4">Create New Habit</h3>
          <div className="space-y-3">
            <input
              autoFocus
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              placeholder="Habit name (e.g., Exercise, Read, Meditate)"
              className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none focus:border-indigo-500"
            />
            <div className="flex items-center gap-3">
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as any })}
                className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="number"
                min="1"
                value={newHabit.target || ''}
                onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })}
                className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none w-20"
                placeholder="Target"
              />
              <input
                value={newHabit.unit}
                onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                placeholder="Unit"
                className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none w-24"
              />
              <div className="flex items-center gap-1">
                {[
                  { color: '#6366f1', name: 'Indigo' },
                  { color: '#22c55e', name: 'Green' },
                  { color: '#f97316', name: 'Orange' },
                  { color: '#ec4899', name: 'Pink' },
                  { color: '#06b6d4', name: 'Cyan' },
                  { color: '#eab308', name: 'Yellow' }
                ].map(c => (
                  <button
                    key={c.color}
                    aria-label={`Select color ${c.name}`}
                    onClick={() => setNewHabit({ ...newHabit, color: c.color })}
                    className={`w-5 h-5 rounded-full border-2 ${newHabit.color === c.color ? 'border-white ring-2 ring-offset-1 ring-offset-[#181a24]' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-[#6b7280]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] px-8 py-16 text-center">
          <Flame className="w-10 h-10 text-[#d1d5db] dark:text-[#4b5563] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#4b5563] dark:text-[#9ca3af]">No habits yet</p>
          <p className="text-xs text-[#9ca3af] mt-1">Start building consistency with daily habits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const isCompletedToday = habitCompletions.some(c => c.habitId === habit.id && c.date === today);
            const goal = goals.find(g => g.id === habit.goalId);

            return (
              <div key={habit.id} className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <div>
                      <h3 className="text-sm font-semibold">{habit.name}</h3>
                      <p className="text-[11px] text-[#9ca3af]">{habit.target} {habit.unit} · {habit.frequency}</p>
                    </div>
                    {goal && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{goal.title}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: habit.color }}>{habit.currentStreak}🔥</p>
                      <p className="text-[10px] text-[#9ca3af]">Best: {habit.longestStreak}</p>
                    </div>
                    <button
                      aria-label={isCompletedToday ? 'Mark habit as incomplete' : 'Mark habit as complete'}
                      onClick={() => toggleHabitCompletion(habit.id, today)}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${isCompletedToday
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-[#d1d5db] dark:border-[#4b5563] hover:border-emerald-400'
                        }`}
                    >
                      {isCompletedToday && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button aria-label="Delete habit" onClick={() => deleteHabit(habit.id)} className="text-[#9ca3af] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Streak Calendar */}
                <div className="flex items-center gap-1">
                  {last14Days.map((date) => {
                    const completed = habitCompletions.some(c => c.habitId === habit.id && c.date === date);
                    const isToday = date === today;
                    return (
                      <div
                        key={date}
                        className={`flex-1 h-6 rounded-sm transition-all ${completed ? '' : 'bg-[#f3f4f6] dark:bg-[#252836]'
                          } ${isToday ? 'ring-1 ring-offset-1 ring-offset-white dark:ring-offset-[#181a24]' : ''}`}
                        style={completed ? { backgroundColor: habit.color } : {}}
                        title={`${date}${completed ? ' ✓' : ''}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#9ca3af]">{format(subDays(new Date(), 13), 'MMM d')}</span>
                  <span className="text-[10px] text-[#9ca3af]">Today</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
