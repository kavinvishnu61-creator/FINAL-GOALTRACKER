import { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, Flame, Timer, Plus, Target, Zap } from 'lucide-react';

export function TodayPage() {
  const { tasks, habits, getCurrentStreak, getFocusToday, getTodayHabits, toggleTaskComplete, toggleHabitCompletion, addTask, setCurrentPage, setSelectedGoalId, goals } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t =>
    (t.scheduledDate === today || t.dueDate === today || t.status === 'in_progress') && t.status !== 'completed' && t.status !== 'cancelled'
  ).sort((a, b) => {
    const pOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return pOrder[a.priority] - pOrder[b.priority];
  });
  const completedToday = tasks.filter(t => t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === today);
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
      goalId: activeGoal?.id,
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

      <div className="grid grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Tasks</h2>
            <button onClick={() => setShowAddTask(true)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add task
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
                  placeholder="What needs to be done?"
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-[#9ca3af]"
                />
                <button onClick={handleAddTask} className="text-xs px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600">Add</button>
                <button onClick={() => setShowAddTask(false)} className="text-xs text-[#9ca3af] hover:text-[#6b7280]">Cancel</button>
              </div>
            )}
            {todayTasks.length === 0 && !showAddTask ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-[#9ca3af]">Nothing planned for today</p>
                <p className="text-xs text-[#6b7280] mt-1">Add a task or schedule from your goals</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6] dark:border-[#1e2030] last:border-0 group hover:bg-[#fafbfc] dark:hover:bg-[#1a1d2e] transition-colors">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="w-[18px] h-[18px] rounded-full border-2 border-[#d1d5db] dark:border-[#4b5563] hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shrink-0 flex items-center justify-center"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{task.title}</p>
                    {task.goalId && (
                      <p className="text-[11px] text-[#9ca3af] truncate mt-0.5">
                        {goals.find(g => g.id === task.goalId)?.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.estimatedDuration && (
                      <span className="text-[11px] text-[#9ca3af] flex items-center gap-1">
                        <Clock className="w-3 h-3" />{task.estimatedDuration}m
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      task.priority === 'P1' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                      task.priority === 'P2' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                      task.priority === 'P3' ? 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]' :
                      'bg-[#f3f4f6] dark:bg-[#252836] text-[#9ca3af]'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
            {completedToday.length > 0 && (
              <div className="border-t border-[#e5e7eb] dark:border-[#1e2030]">
                <p className="px-4 py-2 text-[11px] font-medium text-[#9ca3af] bg-[#f9fafb] dark:bg-[#13151d]">
                  Completed ({completedToday.length})
                </p>
                {completedToday.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-2 border-b border-[#f3f4f6] dark:border-[#1e2030] last:border-0 opacity-60">
                    <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 shrink-0" />
                    <p className="text-sm line-through text-[#9ca3af]">{task.title}</p>
                  </div>
                ))}
              </div>
            )}
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
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      completed ? 'border-emerald-500 bg-emerald-500' : 'border-[#d1d5db] dark:border-[#4b5563] group-hover:border-emerald-400'
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
