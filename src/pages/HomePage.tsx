import { useStore } from '../store';
import { format } from 'date-fns';
import { Target, Flame, Timer, CheckCircle2, ArrowRight, TrendingUp, Zap } from 'lucide-react';

export function HomePage() {
  const { goals, tasks, habits, getCurrentStreak, getFocusToday, getWeekTasksCompleted, getTodayHabits, setCurrentPage, setSelectedGoalId } = useStore();
  const today = new Date();
  const activeGoals = goals.filter(g => g.status === 'active');
  const todayHabits = getTodayHabits();
  const completedHabits = todayHabits.filter(h => h.completed).length;
  const streak = getCurrentStreak();
  const focusToday = getFocusToday();
  const weekCompleted = getWeekTasksCompleted();
  const todayTasks = tasks.filter(t => (t.dueDate === format(today, 'yyyy-MM-dd') || t.scheduledDate === format(today, 'yyyy-MM-dd')) && t.status !== 'completed');
  const priorityTasks = todayTasks.filter(t => t.priority === 'P1' || t.priority === 'P2').slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[#6b7280] dark:text-[#6b7280] font-medium">
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Target} label="Active Goals" value={activeGoals.length} color="indigo" onClick={() => setCurrentPage('goals')} />
        <StatCard icon={Flame} label="Current Streak" value={`${streak}d`} color="orange" onClick={() => setCurrentPage('habits')} />
        <StatCard icon={Timer} label="Focus Today" value={`${focusToday}m`} color="emerald" onClick={() => setCurrentPage('focus')} />
        <StatCard icon={CheckCircle2} label="This Week" value={weekCompleted} color="blue" onClick={() => setCurrentPage('analytics')} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Priority Tasks */}
        <div className="col-span-2 space-y-6">
          {/* Priority Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Priority Tasks
              </h2>
              <button onClick={() => setCurrentPage('today')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] overflow-hidden">
              {priorityTasks.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-[#9ca3af]">No priority tasks for today</p>
                  <p className="text-xs text-[#6b7280] mt-1">Add tasks from your goals to get started</p>
                </div>
              ) : (
                priorityTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))
              )}
            </div>
          </section>

          {/* Active Goals */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                Active Goals
              </h2>
              <button onClick={() => setCurrentPage('goals')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {activeGoals.length === 0 ? (
                <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] px-4 py-8 text-center">
                  <p className="text-sm text-[#9ca3af]">No active goals yet</p>
                  <p className="text-xs text-[#6b7280] mt-1">Start with one meaningful outcome</p>
                </div>
              ) : (
                activeGoals.slice(0, 4).map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => { setSelectedGoalId(goal.id); }}
                    className="w-full bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4 text-left hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-150 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goal.color }} />
                        <span className="text-sm font-medium">{goal.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#f3f4f6] dark:bg-[#252836] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-[#9ca3af]">{goal.category}</span>
                      <span className="text-[11px] text-[#9ca3af]">Due {format(new Date(goal.targetDate), 'MMM d')}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Habits & Quick Actions */}
        <div className="space-y-6">
          {/* Habits */}
          <section>
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              Today's Habits
            </h2>
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              {todayHabits.length === 0 ? (
                <p className="text-sm text-[#9ca3af] text-center py-4">No habits scheduled</p>
              ) : (
                <div className="space-y-3">
                  {todayHabits.map(({ habit, completed }) => (
                    <HabitRow key={habit.id} habit={habit} completed={completed} />
                  ))}
                  <div className="pt-2 border-t border-[#f3f4f6] dark:border-[#252836]">
                    <p className="text-xs text-[#6b7280]">{completedHabits}/{todayHabits.length} completed</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Streak Calendar Mini */}
          <section>
            <h2 className="text-sm font-semibold mb-3">Last 7 Days</h2>
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <StreakMini />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction label="Start Focus Session" icon={Timer} onClick={() => setCurrentPage('focus')} />
              <QuickAction label="Daily Review" icon={TrendingUp} onClick={() => setCurrentPage('analytics')} />
              <QuickAction label="Open Calendar" icon={Target} onClick={() => setCurrentPage('calendar')} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: string | number; color: string; onClick: () => void }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };
  return (
    <button onClick={onClick} className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4 text-left hover:border-[#d1d5db] dark:hover:border-[#2d3044] transition-all">
      <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-[#6b7280] dark:text-[#6b7280] mt-0.5">{label}</p>
    </button>
  );
}

function TaskRow({ task }: { task: any }) {
  const { toggleTaskComplete } = useStore();
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6] dark:border-[#1e2030] last:border-0 group">
      <button
        onClick={() => toggleTaskComplete(task.id)}
        className="w-4 h-4 rounded border-2 border-[#d1d5db] dark:border-[#4b5563] hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{task.title}</p>
        {task.goalId && <p className="text-[11px] text-[#9ca3af] truncate">Linked to goal</p>}
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
        task.priority === 'P1' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
        task.priority === 'P2' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
        'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]'
      }`}>
        {task.priority}
      </span>
    </div>
  );
}

function HabitRow({ habit, completed }: { habit: any; completed: boolean }) {
  const { toggleHabitCompletion } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  return (
    <button
      onClick={() => toggleHabitCompletion(habit.id, today)}
      className="w-full flex items-center gap-3 group"
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
        completed
          ? 'border-emerald-500 bg-emerald-500'
          : 'border-[#d1d5db] dark:border-[#4b5563] group-hover:border-emerald-400'
      }`}>
        {completed && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${completed ? 'line-through text-[#9ca3af]' : ''}`}>{habit.name}</span>
      {habit.currentStreak > 0 && (
        <span className="ml-auto text-[10px] text-orange-500 font-medium">{habit.currentStreak}🔥</span>
      )}
    </button>
  );
}

function StreakMini() {
  const { getStreakData } = useStore();
  const data = getStreakData().slice(-7);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((day, i) => (
        <div key={day.date} className="flex flex-col items-center gap-1.5">
          <div className={`w-6 h-6 rounded-md transition-all ${
            day.status === 'completed' ? 'bg-emerald-500' :
            day.status === 'partial' ? 'bg-amber-400' :
            day.status === 'missed' ? 'bg-red-400/30' :
            'bg-[#f3f4f6] dark:bg-[#252836]'
          }`} />
          <span className="text-[10px] text-[#9ca3af]">{days[new Date(day.date).getDay()]}</span>
        </div>
      ))}
    </div>
  );
}

function QuickAction({ label, icon: Icon, onClick }: { label: string; icon: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#1e2030] hover:bg-[#f9fafb] dark:hover:bg-[#1a1d2e] transition-all text-left"
    >
      <Icon className="w-4 h-4 text-[#6b7280]" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
