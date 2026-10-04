import { useState } from 'react';
import { useStore } from '../store';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  isSameMonth, isToday, addMonths, subMonths, parseISO
} from 'date-fns';
import {
  ArrowLeft, Plus, Target, CheckCircle2, Clock, Flame, Trash2,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Pencil
} from 'lucide-react';

import { safeFormat } from '../utils/date';
import { EditGoalModal } from '../components/EditGoalModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export function GoalDetailPage() {
  const {
    selectedGoalId, setSelectedGoalId, goals, milestones, projects, tasks,
    addMilestone, addProject, addTask, deleteTask, updateGoal, updateMilestone,
    deleteGoal, toggleTaskComplete, getGoalProgress, getGoalStreak,
    toggleGoalDayComplete, calendarEvents
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'projects' | 'tasks'>('overview');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', targetDate: '' });
  const [newProject, setNewProject] = useState({ title: '', milestoneId: '' });
  const [newTask, setNewTask] = useState({ title: '', priority: 'P3' as const, estimatedDuration: 30 });
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const goal = (goals || []).find(g => g.id === selectedGoalId);
  if (!goal) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-16 text-center">
        <p className="text-sm text-[#9ca3af] mb-4">Goal not found or was removed.</p>
        <button
          onClick={() => setSelectedGoalId(null)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium"
        >
          Back to Goals
        </button>
      </div>
    );
  }

  const goalMilestones = (milestones || []).filter(m => m.goalId === goal.id).sort((a, b) => a.order - b.order);
  const goalProjects = (projects || []).filter(p => p.goalId === goal.id);
  const goalTasks = (tasks || []).filter(t => t.goalId === goal.id);
  const progress = typeof getGoalProgress === 'function' ? getGoalProgress(goal.id) : (goal.progress || 0);
  const streakInfo = typeof getGoalStreak === 'function'
    ? getGoalStreak(goal.id)
    : { currentStreak: 0, longestStreak: 0, completedDays: 0, totalDays: 1 };

  // Calendar calculations for Day-by-Day streak marks
  const currentMonthDate = viewMonth instanceof Date && !isNaN(viewMonth.getTime()) ? viewMonth : new Date();
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  let daysInGrid: Date[] = [];
  try {
    daysInGrid = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  } catch {
    daysInGrid = [];
  }

  const goalEvents = (calendarEvents || []).filter(e => e.goalId === goal.id);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Back */}
      <button
        onClick={() => setSelectedGoalId(null)}
        className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#1f2937] dark:hover:text-[#e5e7eb] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Goals
      </button>

      {/* Goal Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: goal.color || '#6366f1' }} />
            <h1 className="text-2xl font-bold tracking-tight">{goal.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditGoal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] hover:bg-[#f9fafb] dark:hover:bg-[#1a1d2e] transition-colors"
              title="Edit Goal"
            >
              <Pencil className="w-3.5 h-3.5 text-[#6b7280]" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                const newStatus = goal.status === 'active' ? 'paused' : 'active';
                updateGoal(goal.id, { status: newStatus });
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] hover:bg-[#f9fafb] dark:hover:bg-[#1a1d2e]"
            >
              {goal.status === 'active' ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Delete Goal"
              aria-label="Delete Goal"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {goal.description && <p className="text-sm text-[#6b7280] mt-2 ml-7">{goal.description}</p>}
        {goal.reason && <p className="text-xs text-[#9ca3af] mt-1 ml-7 italic">"{goal.reason}"</p>}
      </div>

      {/* Progress & Streak Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {/* Progress */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <p className="text-[11px] text-[#6b7280] mb-1">Goal Progress</p>
          <p className="text-2xl font-bold" style={{ color: goal.color || '#6366f1' }}>{progress}%</p>
          <div className="w-full h-1.5 rounded-full bg-[#f3f4f6] dark:bg-[#252836] mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: goal.color || '#6366f1' }} />
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <p className="text-[11px] text-[#6b7280]">Daily Streak</p>
          </div>
          <p className="text-2xl font-bold text-orange-500">{streakInfo.currentStreak}d</p>
          <p className="text-[10px] text-[#9ca3af] mt-1">Best: {streakInfo.longestStreak} days</p>
        </div>

        {/* Day Execution */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[11px] text-[#6b7280]">Days Executed</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{streakInfo.completedDays}</p>
          <p className="text-[10px] text-[#9ca3af] mt-1">of {streakInfo.totalDays} total days</p>
        </div>

        {/* Goal Tasks */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-[11px] text-[#6b7280]">Goal Tasks</p>
          </div>
          <p className="text-2xl font-bold">{goalTasks.filter(t => t.status === 'completed').length}/{goalTasks.length}</p>
          <p className="text-[10px] text-[#9ca3af] mt-1">completed</p>
        </div>

        {/* Target Date */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-[11px] text-[#6b7280]">Target Date</p>
          </div>
          <p className="text-base font-bold mt-1 truncate">{safeFormat(goal.targetDate, 'MMM d, yyyy', 'No target')}</p>
          <p className="text-[10px] text-[#9ca3af] mt-1">From {safeFormat(goal.startDate, 'MMM d', 'Start')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-[#f3f4f6] dark:bg-[#1a1d2e] rounded-lg w-fit">
        {(['overview', 'milestones', 'projects', 'tasks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-[#252836] shadow-sm text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-[#6b7280] hover:text-[#4b5563]'
            }`}
          >
            {tab === 'tasks' ? 'Goal Tasks' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab with Day-by-Day Streak Completion Marks */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Day-by-Day Daily Streak & Completion Marks */}
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Day-by-Day Execution & Streak Marks
                </h3>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                  Follow your daily streak. Click on any day to toggle your completion mark.
                </p>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMonth(subMonths(currentMonthDate, 1))}
                  className="p-1 rounded-md border border-[#e5e7eb] dark:border-[#2d3044] hover:bg-[#f3f4f6] dark:hover:bg-[#252836]"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
                </button>
                <span className="text-xs font-semibold px-2 min-w-[100px] text-center">
                  {safeFormat(currentMonthDate, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => setViewMonth(addMonths(currentMonthDate, 1))}
                  className="p-1 rounded-md border border-[#e5e7eb] dark:border-[#2d3044] hover:bg-[#f3f4f6] dark:hover:bg-[#252836]"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                </button>
                <button
                  onClick={() => setViewMonth(new Date())}
                  className="text-xs px-2.5 py-1 rounded-md border border-[#e5e7eb] dark:border-[#2d3044] text-[#6b7280] hover:text-[#111827] dark:hover:text-white"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[11px] font-medium text-[#9ca3af] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysInGrid.map(day => {
                const dateStr = safeFormat(day, 'yyyy-MM-dd');
                const inCurrentMonth = isSameMonth(day, currentMonthDate);
                const isCurrentToday = isToday(day);

                // Check if day falls within goal duration
                const startStr = goal.startDate || '1970-01-01';
                const targetStr = goal.targetDate || '2099-12-31';
                const inGoalRange = dateStr >= startStr && dateStr <= targetStr;
                const event = goalEvents.find(e => e.date === dateStr);
                const isCompleted = !!event?.completed;
                const isPast = dateStr < safeFormat(new Date(), 'yyyy-MM-dd');

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (inGoalRange && typeof toggleGoalDayComplete === 'function') {
                        toggleGoalDayComplete(goal.id, dateStr);
                      }
                    }}
                    disabled={!inGoalRange}
                    className={`min-h-[64px] p-2 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                      !inCurrentMonth ? 'opacity-30' : ''
                    } ${
                      !inGoalRange
                        ? 'border-transparent bg-transparent cursor-not-allowed opacity-20'
                        : isCompleted
                        ? 'bg-emerald-50/80 dark:bg-emerald-500/15 border-emerald-400 dark:border-emerald-500/50 hover:bg-emerald-100 dark:hover:bg-emerald-500/25'
                        : isCurrentToday
                        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10 hover:border-indigo-500'
                        : isPast
                        ? 'border-[#e5e7eb] dark:border-[#1e2030] hover:border-[#d1d5db] dark:hover:border-[#2d3044]'
                        : 'border-[#f3f4f6] dark:border-[#1e2030] opacity-80 hover:opacity-100 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-semibold ${
                        isCurrentToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]'
                          : ''
                      }`}>
                        {safeFormat(day, 'd')}
                      </span>

                      {/* Completion checkmark button / indicator */}
                      {inGoalRange && (
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isCurrentToday
                            ? 'border-indigo-400 dark:border-indigo-400 hover:border-emerald-500'
                            : 'border-[#d1d5db] dark:border-[#4b5563] hover:border-emerald-500'
                        }`}>
                          {isCompleted && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                      )}
                    </div>

                    {/* Day status badge */}
                    {inGoalRange && (
                      <div className="mt-1">
                        {isCompleted ? (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-orange-500" /> Done
                          </span>
                        ) : isCurrentToday ? (
                          <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                            Today
                          </span>
                        ) : isPast ? (
                          <span className="text-[9px] text-[#9ca3af]">
                            Missed
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#9ca3af]">
                            {goal.optimizedTime || '09:00'}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Streak Summary Info Bar */}
            <div className="mt-5 pt-4 border-t border-[#e5e7eb] dark:border-[#1e2030] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Completed Day
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-indigo-500 inline-block" /> Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-[#d1d5db] dark:border-[#4b5563] inline-block" /> Planned
                </span>
              </div>
              <div className="text-[11px] font-medium">
                Daily Execution Time: <span className="text-[#111827] dark:text-white font-semibold">{goal.optimizedTime || '09:00'} - {goal.optimizedEndTime || '10:00'}</span>
              </div>
            </div>
          </div>

          {/* Goal Details */}
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
            <h3 className="text-sm font-semibold mb-3">Goal Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-[#6b7280]">Category:</span> <span className="ml-2 font-medium">{goal.category}</span></div>
              <div><span className="text-[#6b7280]">Priority:</span> <span className="ml-2 font-medium">{goal.priority}</span></div>
              <div><span className="text-[#6b7280]">Start Date:</span> <span className="ml-2 font-medium">{safeFormat(goal.startDate, 'MMM d, yyyy', 'Not set')}</span></div>
              <div><span className="text-[#6b7280]">Target Date:</span> <span className="ml-2 font-medium">{safeFormat(goal.targetDate, 'MMM d, yyyy', 'Not set')}</span></div>
              <div><span className="text-[#6b7280]">Status:</span> <span className="ml-2 capitalize font-medium">{goal.status}</span></div>
              <div><span className="text-[#6b7280]">Daily Schedule:</span> <span className="ml-2 font-medium">{goal.optimizedTime || '09:00'} - {goal.optimizedEndTime || '10:00'}</span></div>
            </div>
          </div>

          {/* Milestone Progress */}
          {goalMilestones.length > 0 && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
              <h3 className="text-sm font-semibold mb-3">Milestone Progress</h3>
              <div className="space-y-2">
                {goalMilestones.map(ms => (
                  <div key={ms.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ms.status === 'completed' ? 'bg-emerald-500' : ms.status === 'in_progress' ? 'bg-indigo-500' : 'bg-[#d1d5db]'}`} />
                    <span className="text-sm flex-1">{ms.title}</span>
                    <span className="text-xs text-[#9ca3af]">{safeFormat(ms.targetDate, 'MMM d')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold">Goal Tasks</h3>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                Tasks created specifically for this goal. They track this goal's execution.
              </p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Goal Task
            </button>
          </div>

          {showAddTask && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <h4 className="text-xs font-semibold text-[#6b7280] mb-2 uppercase">New Task for "{goal.title}"</h4>
              <input
                autoFocus
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What task needs to be completed for this goal?"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-3"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-xs outline-none"
                >
                  <option value="P1">P1 - Urgent</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
                <input
                  type="number"
                  value={newTask.estimatedDuration}
                  onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) || 0 })}
                  placeholder="Est. minutes"
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-xs outline-none w-28"
                />
                <button
                  onClick={() => {
                    if (!newTask.title.trim()) return;
                    addTask({ ...newTask, goalId: goal.id });
                    setNewTask({ title: '', priority: 'P3', estimatedDuration: 30 });
                    setShowAddTask(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="text-xs text-[#9ca3af] hover:text-[#6b7280] px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {goalTasks.length === 0 && !showAddTask ? (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-10 text-center">
              <Target className="w-8 h-8 text-[#9ca3af] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No tasks for this goal yet</p>
              <p className="text-xs text-[#9ca3af] mt-1">Goal-specific tasks help break this goal into manageable work</p>
            </div>
          ) : (
            goalTasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-[#181a24] rounded-lg border border-[#e5e7eb] dark:border-[#1e2030] px-4 py-3 flex items-center gap-3 group hover:border-[#d1d5db] dark:hover:border-[#2d3044] transition-all">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-[#d1d5db] dark:border-[#4b5563] hover:border-indigo-500'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.status === 'completed' ? 'line-through text-[#9ca3af]' : 'font-medium'}`}>{task.title}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  task.priority === 'P1' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                  task.priority === 'P2' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                  task.priority === 'P3' ? 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]' :
                  'bg-[#f3f4f6] dark:bg-[#252836] text-[#9ca3af]'
                }`}>{task.priority}</span>
                {task.estimatedDuration && <span className="text-[11px] text-[#9ca3af]">{task.estimatedDuration}m</span>}
                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete task from goal"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-[#9ca3af] transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {showAddMilestone && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <input
                autoFocus
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="Milestone title"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                />
                <button onClick={() => { addMilestone({ ...newMilestone, goalId: goal.id }); setNewMilestone({ title: '', targetDate: '' }); setShowAddMilestone(false); }} className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm">Add</button>
                <button onClick={() => setShowAddMilestone(false)} className="text-sm text-[#9ca3af]">Cancel</button>
              </div>
            </div>
          )}
          {goalMilestones.map((ms) => (
            <div key={ms.id} className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateMilestone(ms.id, { status: ms.status === 'completed' ? 'pending' : 'completed' })}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${ms.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-[#d1d5db] dark:border-[#4b5563]'
                    }`}
                >
                  {ms.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div>
                  <p className={`text-sm font-medium ${ms.status === 'completed' ? 'line-through text-[#9ca3af]' : ''}`}>{ms.title}</p>
                  <p className="text-[11px] text-[#9ca3af]">Due {safeFormat(ms.targetDate, 'MMM d, yyyy')}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ms.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  ms.status === 'in_progress' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' :
                    'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]'
                }`}>{ms.status}</span>
            </div>
          ))}
          <button onClick={() => setShowAddMilestone(true)} className="w-full py-3 rounded-xl border border-dashed border-[#d1d5db] dark:border-[#2d3044] text-sm text-[#6b7280] hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {showAddProject && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <input
                autoFocus
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Project title"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newProject.milestoneId}
                  onChange={(e) => setNewProject({ ...newProject, milestoneId: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                >
                  <option value="">No milestone</option>
                  {goalMilestones.map(ms => <option key={ms.id} value={ms.id}>{ms.title}</option>)}
                </select>
                <button onClick={() => { addProject({ ...newProject, goalId: goal.id }); setNewProject({ title: '', milestoneId: '' }); setShowAddProject(false); }} className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm">Add</button>
                <button onClick={() => setShowAddProject(false)} className="text-sm text-[#9ca3af]">Cancel</button>
              </div>
            </div>
          )}
          {goalProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{project.title}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                    project.status === 'completed' ? 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]' :
                      'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                  }`}>{project.status}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#f3f4f6] dark:bg-[#252836] overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          ))}
          <button onClick={() => setShowAddProject(true)} className="w-full py-3 rounded-xl border border-dashed border-[#d1d5db] dark:border-[#2d3044] text-sm text-[#6b7280] hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      )}

      {/* Edit Goal Modal */}
      <EditGoalModal
        goal={goal}
        isOpen={showEditGoal}
        onClose={() => setShowEditGoal(false)}
        onSave={(id, updates) => updateGoal(id, updates)}
        onDelete={(id) => {
          deleteGoal(id);
          setSelectedGoalId(null);
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteGoal(goal.id);
          setSelectedGoalId(null);
        }}
        title="Delete Goal"
        itemName={goal.title}
        message="Are you sure you want to delete this goal? All associated milestones, projects, tasks, and daily calendar events will be permanently removed."
      />
    </div>
  );
}
