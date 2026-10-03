import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Play, Pause, RotateCcw, Square, Timer, Target, Zap } from 'lucide-react';

export function FocusPage() {
  const { focusSessions, startFocusSession, updateFocusSession, completeFocusSession, goals, tasks, getFocusToday, getTotalFocus } = useStore();
  const [duration, setDuration] = useState(25);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  const activeGoals = goals.filter(g => g.status === 'active');
  const availableTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const todayFocus = getFocusToday();
  const totalFocus = getTotalFocus();
  const completedSessions = focusSessions.filter(s => s.status === 'completed');
  const todaySessions = completedSessions.filter(s => s.endTime && format(new Date(s.endTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));

  // Timer logic using real timestamps
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000);
        const remaining = Math.max(0, duration * 60 - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0 && activeSessionId) {
          completeFocusSession(activeSessionId);
          setIsRunning(false);
          setActiveSessionId(null);
          // Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Session Complete!', { body: `Great work! You focused for ${duration} minutes.` });
          }
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, duration, activeSessionId]);

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const sessionId = startFocusSession({
      duration,
      type: 'pomodoro',
      taskId: selectedTaskId || undefined,
      goalId: selectedGoalId || undefined,
    });
    setActiveSessionId(sessionId);
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (activeSessionId) updateFocusSession(activeSessionId, { status: 'paused' });
  };

  const handleResume = () => {
    setIsPaused(false);
    if (activeSessionId) updateFocusSession(activeSessionId, { status: 'running' });
  };

  const handleStop = () => {
    if (activeSessionId) {
      completeFocusSession(activeSessionId);
    }
    setIsRunning(false);
    setIsPaused(false);
    setActiveSessionId(null);
    setTimeLeft(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setActiveSessionId(null);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = isRunning ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Focus</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">Deep work sessions for meaningful progress</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Timer */}
        <div className="col-span-2">
          <div className="bg-white dark:bg-[#181a24] rounded-2xl border border-[#e5e7eb] dark:border-[#1e2030] p-8">
            {/* Circular Timer */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg width="280" height="280" className="transform -rotate-90">
                  <circle cx="140" cy="140" r="120" stroke="currentColor" strokeWidth="4" fill="none" className="text-[#f3f4f6] dark:text-[#252836]" />
                  <circle
                    cx="140" cy="140" r="120"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={isRunning ? strokeDashoffset : circumference}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold tracking-tight tabular-nums">
                    {isRunning ? formatTime(timeLeft) : formatTime(duration * 60)}
                  </span>
                  <span className="text-xs text-[#9ca3af] mt-2">
                    {isRunning ? (isPaused ? 'Paused' : 'Focusing...') : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
                >
                  <Play className="w-5 h-5" /> Start Focus
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button onClick={handleResume} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
                      <Play className="w-4 h-4" /> Resume
                    </button>
                  ) : (
                    <button onClick={handlePause} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )}
                  <button onClick={handleStop} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium">
                    <Square className="w-4 h-4" /> Stop
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f3f4f6] dark:bg-[#252836] hover:bg-[#e5e7eb] dark:hover:bg-[#2d3044] font-medium">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </>
              )}
            </div>

            {/* Duration Selector */}
            {!isRunning && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {[15, 25, 45, 50, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${duration === d
                        ? 'bg-indigo-500 text-white'
                        : 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280] hover:bg-[#e5e7eb] dark:hover:bg-[#2d3044]'
                      }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            )}

            {/* Task/Goal Linking */}
            {!isRunning && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#6b7280] mb-1 block">Link to Goal</label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                  >
                    <option value="">No goal</option>
                    {activeGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#6b7280] mb-1 block">Link to Task</label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                  >
                    <option value="">No task</option>
                    {availableTasks.slice(0, 20).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
            <h3 className="text-xs font-semibold text-[#6b7280] mb-3">TODAY</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sessions</span>
                <span className="text-sm font-bold">{todaySessions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Focus Time</span>
                <span className="text-sm font-bold">{todayFocus}m</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
            <h3 className="text-xs font-semibold text-[#6b7280] mb-3">ALL TIME</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Sessions</span>
                <span className="text-sm font-bold">{completedSessions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Focus</span>
                <span className="text-sm font-bold">{Math.floor(totalFocus / 60)}h {totalFocus % 60}m</span>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
            <h3 className="text-xs font-semibold text-[#6b7280] mb-3">RECENT SESSIONS</h3>
            <div className="space-y-2">
              {completedSessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-xs font-medium">{session.actualDuration}m</p>
                    <p className="text-[10px] text-[#9ca3af]">
                      {session.endTime ? format(new Date(session.endTime), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                  {session.goalId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {goals.find(g => g.id === session.goalId)?.title?.slice(0, 12)}
                    </span>
                  )}
                </div>
              ))}
              {completedSessions.length === 0 && (
                <p className="text-xs text-[#9ca3af] text-center py-4">No sessions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
