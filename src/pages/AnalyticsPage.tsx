import { useMemo } from 'react';
import { useStore } from '../store';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { safeFormat } from '../utils/date';
import { BarChart3, TrendingUp, Target, Flame, Timer, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

export function AnalyticsPage() {
  const { tasks, focusSessions, habits, habitCompletions, goals, getCurrentStreak, getLongestStreak, getTotalFocus, getWeekTasksCompleted } = useStore();
  
  const streak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const totalFocus = getTotalFocus();
  const weekCompleted = getWeekTasksCompleted();
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const todayStr = safeFormat(new Date(), 'yyyy-MM-dd');
  const todaySessions = focusSessions.filter(s => s.status === 'completed' && s.endTime && safeFormat(s.endTime, 'yyyy-MM-dd') === todayStr);
  const todayPomos = todaySessions.length;
  const todayFocus = todaySessions.reduce((sum, s) => sum + s.actualDuration, 0);

  // Weekly data
  const last7Days = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return days.map(day => {
      const dateStr = safeFormat(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.completedAt && safeFormat(t.completedAt, 'yyyy-MM-dd') === dateStr).length;
      const dayFocus = focusSessions.filter(s => s.status === 'completed' && s.endTime && safeFormat(s.endTime, 'yyyy-MM-dd') === dateStr).reduce((sum, s) => sum + s.actualDuration, 0);
      const dayHabits = habitCompletions.filter(c => c.date === dateStr).length;
      return {
        date: safeFormat(day, 'EEE'),
        fullDate: dateStr,
        tasks: dayTasks,
        focus: dayFocus,
        habits: dayHabits,
      };
    });
  }, [tasks, focusSessions, habitCompletions]);

  // Year heatmap data (last 90 days)
  const heatmapData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 89), end: new Date() });
    return days.map(day => {
      const dateStr = safeFormat(day, 'yyyy-MM-dd');
      const activity = tasks.filter(t => t.completedAt && safeFormat(t.completedAt, 'yyyy-MM-dd') === dateStr).length +
        focusSessions.filter(s => s.status === 'completed' && s.endTime && safeFormat(s.endTime, 'yyyy-MM-dd') === dateStr).length +
        habitCompletions.filter(c => c.date === dateStr).length;
      return { date: dateStr, activity, day: safeFormat(day, 'd') };
    });
  }, [tasks, focusSessions, habitCompletions]);

  // Focus distribution by hour
  const hourlyFocus = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, minutes: 0, sessions: 0 }));
    focusSessions.filter(s => s.status === 'completed' && s.endTime).forEach(s => {
      const hour = new Date(s.endTime!).getHours();
      hours[hour].minutes += s.actualDuration;
      hours[hour].sessions += 1;
    });
    return hours.filter(h => h.minutes > 0);
  }, [focusSessions]);

  // Goal analytics
  const goalAnalytics = useMemo(() => {
    return goals.filter(g => g.status === 'active').map(g => {
      const goalTasks = tasks.filter(t => t.goalId === g.id);
      const goalCompleted = goalTasks.filter(t => t.status === 'completed').length;
      const goalFocus = focusSessions.filter(s => s.goalId === g.id && s.status === 'completed').reduce((sum, s) => sum + s.actualDuration, 0);
      return {
        id: g.id,
        title: g.title,
        color: g.color,
        progress: g.progress,
        tasksCompleted: goalCompleted,
        totalTasks: goalTasks.length,
        focusMinutes: goalFocus,
      };
    });
  }, [goals, tasks, focusSessions]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">Track your progress and patterns</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Timer} label="Today's Focus" value={`${todayFocus}m`} sublabel={`${todayPomos} sessions`} color="emerald" />
        <StatCard icon={CheckCircle2} label="Tasks Completed" value={completedTasks.length} sublabel={`${completionRate}% rate`} color="blue" />
        <StatCard icon={Flame} label="Current Streak" value={`${streak}d`} sublabel={`Best: ${longestStreak}d`} color="orange" />
        <StatCard icon={TrendingUp} label="This Week" value={weekCompleted} sublabel="tasks completed" color="indigo" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
          <h3 className="text-sm font-semibold mb-4">Weekly Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                <Tooltip
                  contentStyle={{ background: 'var(--tooltip-bg, #1a1d2e)', border: '1px solid #2d3044', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[3, 3, 0, 0]} name="Tasks" />
                <Bar dataKey="habits" fill="#f97316" radius={[3, 3, 0, 0]} name="Habits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Trend */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
          <h3 className="text-sm font-semibold mb-4">Focus Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} unit="m" />
                <Tooltip
                  contentStyle={{ background: 'var(--tooltip-bg, #1a1d2e)', border: '1px solid #2d3044', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Area type="monotone" dataKey="focus" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} name="Focus (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Year Heatmap */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
          <h3 className="text-sm font-semibold mb-4">Activity (Last 90 Days)</h3>
          <div className="grid grid-cols-15 gap-0.5">
            {heatmapData.map((day) => (
              <div
                key={day.date}
                className={`w-full aspect-square rounded-sm transition-colors ${
                  day.activity === 0 ? 'bg-[#f3f4f6] dark:bg-[#252836]' :
                  day.activity <= 2 ? 'bg-emerald-200 dark:bg-emerald-900' :
                  day.activity <= 5 ? 'bg-emerald-400 dark:bg-emerald-700' :
                  'bg-emerald-600 dark:bg-emerald-500'
                }`}
                title={`${day.date}: ${day.activity} activities`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-[#9ca3af]">Less</span>
            <div className="w-3 h-3 rounded-sm bg-[#f3f4f6] dark:bg-[#252836]" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-[10px] text-[#9ca3af]">More</span>
          </div>
        </div>

        {/* Most Focused Hours */}
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
          <h3 className="text-sm font-semibold mb-4">Most Focused Hours</h3>
          {hourlyFocus.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyFocus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} tickFormatter={(h) => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} unit="m" />
                  <Tooltip
                    contentStyle={{ background: 'var(--tooltip-bg, #1a1d2e)', border: '1px solid #2d3044', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(h) => `${h}:00`}
                  />
                  <Bar dataKey="minutes" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Focus (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-[#9ca3af]">Complete focus sessions to see patterns</p>
            </div>
          )}
        </div>
      </div>

      {/* Goal Analytics */}
      <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
        <h3 className="text-sm font-semibold mb-4">Goal Progress</h3>
        {goalAnalytics.length === 0 ? (
          <p className="text-sm text-[#9ca3af] text-center py-8">No active goals to analyze</p>
        ) : (
          <div className="space-y-4">
            {goalAnalytics.map(g => (
              <div key={g.id} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{g.title}</span>
                    <span className="text-xs font-semibold">{g.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f3f4f6] dark:bg-[#252836] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${g.progress}%`, backgroundColor: g.color }} />
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#9ca3af]">
                    <span>{g.tasksCompleted}/{g.totalTasks} tasks</span>
                    <span>{g.focusMinutes}m focused</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color }: { icon: any; label: string; value: string | number; sublabel: string; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };
  return (
    <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
      <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-[#6b7280] mt-0.5">{label}</p>
      <p className="text-[10px] text-[#9ca3af]">{sublabel}</p>
    </div>
  );
}
