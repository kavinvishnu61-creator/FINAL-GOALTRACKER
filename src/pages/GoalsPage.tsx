import { useState } from 'react';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';
import { Plus, Target, MoreHorizontal, Calendar, TrendingUp, Flame, CheckCircle2 } from 'lucide-react';
import { GoalStatus, Priority } from '../types';

import { safeFormat } from '../utils/date';

export function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, setSelectedGoalId, milestones, projects, tasks, getGoalProgress, getGoalStreak } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all');
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'General', priority: 'P2' as Priority, startDate: '', targetDate: '', optimizedTime: '09:00', optimizedEndTime: '10:00' });

  const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.status === filter);

  const handleCreate = () => {
    if (!newGoal.title.trim()) return;
    addGoal({
      ...newGoal,
      targetDate: newGoal.targetDate || format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    });
    setNewGoal({ title: '', description: '', category: 'General', priority: 'P2', startDate: '', targetDate: '', optimizedTime: '09:00', optimizedEndTime: '10:00' });
    setShowCreate(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">{goals.filter(g => g.status === 'active').length} active · {goals.length} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-[#f3f4f6] dark:bg-[#1a1d2e] rounded-lg w-fit">
        {(['all', 'active', 'planned', 'completed', 'paused'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-white dark:bg-[#252836] shadow-sm text-[#1f2937] dark:text-[#e5e7eb]' : 'text-[#6b7280] hover:text-[#4b5563]'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Goal Form */}
      {showCreate && (
        <div className="mb-6 bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
          <h3 className="text-sm font-semibold mb-4">Create New Goal</h3>
          <div className="space-y-3">
            <input
              autoFocus
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="What do you want to achieve?"
              className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Why does this matter to you?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
              >
                <option>General</option>
                <option>Career</option>
                <option>Health</option>
                <option>Learning</option>
                <option>Finance</option>
                <option>Relationships</option>
                <option>Creative</option>
              </select>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Priority })}
                className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
              <div className="flex-1 w-full">
                <label className="block text-xs text-[#6b7280] mb-1">From Date</label>
                <input
                  type="date"
                  value={newGoal.startDate || format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs text-[#6b7280] mb-1">To Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate || format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs text-[#6b7280] mb-1">From Time</label>
                <input
                  type="time"
                  value={newGoal.optimizedTime || '09:00'}
                  onChange={(e) => setNewGoal({ ...newGoal, optimizedTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs text-[#6b7280] mb-1">To Time</label>
                <input
                  type="time"
                  value={newGoal.optimizedEndTime || '10:00'}
                  onChange={(e) => setNewGoal({ ...newGoal, optimizedEndTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">Create Goal</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-[#6b7280] hover:text-[#4b5563]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] px-8 py-16 text-center">
          <Target className="w-10 h-10 text-[#d1d5db] dark:text-[#4b5563] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#4b5563] dark:text-[#9ca3af]">No goals yet</p>
          <p className="text-xs text-[#9ca3af] mt-1">Start with one meaningful outcome</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const goalMilestones = milestones.filter(m => m.goalId === goal.id);
            const goalProjects = projects.filter(p => p.goalId === goal.id);
            const goalTasks = tasks.filter(t => t.goalId === goal.id);
            const completedTasks = goalTasks.filter(t => t.status === 'completed').length;
            const progress = getGoalProgress(goal.id);
            const streakInfo = getGoalStreak(goal.id);

            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5 text-left hover:border-[#d1d5db] dark:hover:border-[#2d3044] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
                    <h3 className="text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{goal.title}</h3>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${goal.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                      goal.status === 'planned' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                        goal.status === 'completed' ? 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]' :
                          'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}>
                    {goal.status}
                  </span>
                </div>

                {goal.description && (
                  <p className="text-xs text-[#6b7280] dark:text-[#6b7280] mb-3 line-clamp-2">{goal.description}</p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#6b7280]">Progress</span>
                    <span className="text-xs font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f3f4f6] dark:bg-[#252836] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[11px] text-[#9ca3af]">
                  <span className="flex items-center gap-1 text-orange-500 font-semibold">
                    <Flame className="w-3 h-3" />{streakInfo.currentStreak}d streak
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />{streakInfo.completedDays}d done
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />{completedTasks}/{goalTasks.length} tasks
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />{safeFormat(goal.targetDate, 'MMM d', 'No target')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
