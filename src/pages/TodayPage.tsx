import { useState } from 'react';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Circle, Clock, Flame, Timer, Plus, Target, Zap, Calendar, Trash2 } from 'lucide-react';

import { safeFormat } from '../utils/date';

export function TodayPage() {
  const { tasks, habits, calendarEvents, getCurrentStreak, getFocusToday, getTodayHabits, toggleTaskComplete, deleteTask, toggleHabitCompletion, toggleCalendarEventComplete, addTask, setCurrentPage, setSelectedGoalId, goals } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const validGoalIds = new Set(goals.map(g => g.id));
  const validGoalTitles = new Set(goals.map(g => g.title.trim().toLowerCase()));

  const isGoalEventValid = (e: (typeof calendarEvents)[0]) => {
    if (e.goalId) return validGoalIds.has(e.goalId);
    const lower = e.title.trim().toLowerCase();
    if (lower.startsWith('goal:')) {
      const name = lower.replace(/^goal:\s*/, '').trim();
      return validGoalTitles.has(name);
    }
    return true;
  };

  const todayEvents = calendarEvents
    .filter(e => e.date === today && isGoalEventValid(e))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const todayTasks = tasks.filter(t =>
    (t.scheduledDate === today || t.dueDate === today || t.status === 'in_progress') && t.status !== 'completed' && t.status !== 'cancelled'
  ).sort((a, b) => {
    const pOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return pOrder[a.priority] - pOrder[b.priority];
  });
  const completedToday = tasks.filter(t => {
    if (!t.completedAt) return false;
    return safeFormat(t.completedAt, 'yyyy-MM-dd') === today;
  });
  const todayHabits = getTodayHabits();
  const streak = getCurrentStreak();
  const focusToday = getFocusToday();
  const activeGoal = goals.find(g => g.status === 'active');

  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addTask({
      title: newTask.trim(),
      scheduledDate: today,
      priority: 'P3',
      // Daily task for today - NOT tied to any goal (Daily Preference)
      goalId: undefined,
    });
    setNewTask('');
    setShowAddTask(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        <p className="text-[13px] text-[#6b7280] dark:text-[#6b7280] mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Day Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] text-[#6b7280]">Tasks</span>
          </div>
          <p className="text-lg font-bold">{todayTasks.length + completedToday.length}</p>
          <p className="text-[10px] text-[#9ca3af]">{completedToday.length} completed</p>
        </div>
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] text-[#6b7280]">Streak</span>
          </div>
          <p className="text-lg font-bold">{streak}d</p>
          <p className="text-[10px] text-[#9ca3af]">Keep going!</p>
        </div>
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-[#6b7280]">Focus</span>
          </div>
          <p className="text-lg font-bold">{focusToday}m</p>
          <p className="text-[10px] text-[#9ca3af]">today</p>
        </div>
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[11px] text-[#6b7280]">Habits</span>
          </div>
          <p className="text-lg font-bold">{todayHabits.filter(h => h.completed).length}/{todayHabits.length}</p>
          <p className="text-[10px] text-[#9ca3af]">completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">

          {/* Schedule */}
          {todayEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Today's Schedule</h2>
              <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] overflow-hidden">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6] dark:border-[#1e2030] last:border-0 group hover:bg-[#fafbfc] dark:hover:bg-[#1a1d2e] transition-colors">
                    <button
                      onClick={() => toggleCalendarEventComplete(event.id)}
                      className={`w-[18px] h-[18px] rounded-full border-2 transition-colors shrink-0 flex items-center justify-center ${
                        event.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-[#d1d5db] dark:border-[#4b5563] hover:border-emerald-500'
                      }`}
                    >
                      {event.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div className="w-[28px] h-[28px] rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${event.color}20`, color: event.color }}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${event.completed ? 'line-through text-[#9ca3af]' : ''}`}>{event.title}</p>
                    </div>
                    <div className="text-[11px] font-semibold text-[#9ca3af] flex items-center gap-1.5 bg-[#f3f4f6] dark:bg-[#252836] px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  Today's Tasks
                  <span className="text-[11px] font-normal text-[#6b7280] dark:text-[#9ca3af] bg-[#f3f4f6] dark:bg-[#252836] px-2 py-0.5 rounded-full">Daily Preference</span>
                </h2>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">Personal tasks for today. (Goal tasks are created in the Goal page)</p>
              </div>
              <button onClick={() => setShowAddTask(true)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                <Plus className="w-3 h-3" /> Add Daily Task
              </button>
            </div>

            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] overflow-hidden">
              {showAddTask && (
                <div className="px-4 py-3 border-b border-[#f3f4f6] dark:border-[#1e2030] flex items-center gap-2">
                  <input
                    autoFocus
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add a daily personal task for today..."
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-[#9ca3af]"
                  />
                  <button onClick={handleAddTask} className="text-xs px-2.5 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 font-medium">Add</button>
                  <button onClick={() => setShowAddTask(false)} className="text-xs text-[#9ca3af] hover:text-[#6b7280]">Cancel</button>
                </div>
              )}
              {todayTasks.length === 0 && !showAddTask ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-[#9ca3af]">No daily tasks for today</p>
                  <p className="text-xs text-[#6b7280] mt-1">Add your personal tasks for today above</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6] dark:border-[#1e2030] last:border-0 group hover:bg-[#fafbfc] dark:hover:bg-[#1a1d2e] transition-colors">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="w-[18px] h-[18px] rounded-full border-2 border-[#d1d5db] dark:border-[#4b5563] hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shrink-0 flex items-center justify-center"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.goalId ? (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Target className="w-2.5 h-2.5" />
                            Goal: {goals.find(g => g.id === task.goalId)?.title || 'Goal'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#9ca3af] bg-[#f3f4f6] dark:bg-[#1f2232] px-1.5 py-0.5 rounded">
                            Daily Preference
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.estimatedDuration && (
                        <span className="text-[11px] text-[#9ca3af] flex items-center gap-1">
                          <Clock className="w-3 h-3" />{task.estimatedDuration}m
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'P1' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                        task.priority === 'P2' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                          task.priority === 'P3' ? 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]' :
                            'bg-[#f3f4f6] dark:bg-[#252836] text-[#9ca3af]'
                        }`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-[#9ca3af] transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {completedToday.length > 0 && (
                <div className="border-t border-[#e5e7eb] dark:border-[#1e2030]">
                  <p className="px-4 py-2 text-[11px] font-medium text-[#9ca3af] bg-[#f9fafb] dark:bg-[#13151d]">
                    Completed ({completedToday.length})
                  </p>
                  {completedToday.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#f3f4f6] dark:border-[#1e2030] last:border-0 group hover:bg-[#fafbfc] dark:hover:bg-[#1a1d2e] transition-colors">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-through text-[#9ca3af]">{task.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {task.goalId ? (
                            <span className="text-[10px] text-[#9ca3af] bg-indigo-50/50 dark:bg-indigo-500/5 px-1.5 py-0.5 rounded">
                              Goal: {goals.find(g => g.id === task.goalId)?.title || 'Goal'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#9ca3af] bg-[#f3f4f6] dark:bg-[#1f2232] px-1.5 py-0.5 rounded">
                              Daily Preference
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-[#9ca3af] transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Habits Sidebar */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Habits</h2>
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
            {todayHabits.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-4">No habits scheduled</p>
            ) : (
              <div className="space-y-3">
                {todayHabits.map(({ habit, completed }) => (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabitCompletion(habit.id, today)}
                    className="w-full flex items-center gap-3 group"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${completed ? 'border-emerald-500 bg-emerald-500' : 'border-[#d1d5db] dark:border-[#4b5563] group-hover:border-emerald-400'
                      }`}>
                      {completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${completed ? 'line-through text-[#9ca3af]' : ''}`}>{habit.name}</span>
                    {habit.currentStreak > 0 && (
                      <span className="ml-auto text-[10px] text-orange-500 font-medium">{habit.currentStreak}🔥</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Focus CTA */}
          <div className="mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <Timer className="w-5 h-5 mb-2" />
            <p className="text-sm font-semibold">Focus Session</p>
            <p className="text-xs opacity-80 mt-1">Deep work on your goals</p>
            <button
              onClick={() => setCurrentPage('focus')}
              className="mt-3 w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors"
            >
              Start Focus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
