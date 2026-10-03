import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths, getDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

function safeFormat(dateVal: any, formatStr: string, fallback = ''): string {
  if (!dateVal) return fallback;
  try {
    const d = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}

export function CalendarPage() {
  const { calendarEvents, tasks, habits, habitCompletions, focusSessions, addCalendarEvent, deleteCalendarEvent, goals } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '09:00', endTime: '10:00', type: 'event' as const });

  const validGoalIds = useMemo(() => new Set(goals.map(g => g.id)), [goals]);
  const validGoalTitles = useMemo(() => new Set(goals.map(g => g.title.trim().toLowerCase())), [goals]);

  const isGoalEventValid = (e: (typeof calendarEvents)[0]) => {
    if (e.goalId) return validGoalIds.has(e.goalId);
    const lower = e.title.trim().toLowerCase();
    if (lower.startsWith('goal:')) {
      const name = lower.replace(/^goal:\s*/, '').trim();
      return validGoalTitles.has(name);
    }
    return true;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    const dateStr = safeFormat(date, 'yyyy-MM-dd');
    const events = calendarEvents.filter(e => e.date === dateStr && isGoalEventValid(e));
    const dayTasks = tasks.filter(t => t.scheduledDate === dateStr || t.dueDate === dateStr);
    const completedHabits = habitCompletions.filter(c => c.date === dateStr);
    const focusSessionsDay = focusSessions.filter(s => s.status === 'completed' && s.endTime && safeFormat(s.endTime, 'yyyy-MM-dd') === dateStr);
    return { events, tasks: dayTasks, habits: completedHabits, focus: focusSessionsDay };
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(new Date(selectedDate + 'T00:00:00')) : null;

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    addCalendarEvent({ ...newEvent, date: selectedDate });
    setNewEvent({ title: '', startTime: '09:00', endTime: '10:00', type: 'event' });
    setShowAddEvent(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <button
          onClick={() => setShowAddEvent(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="col-span-2">
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] dark:border-[#1e2030]">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-[#f3f4f6] dark:hover:bg-[#252836]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-[#f3f4f6] dark:hover:bg-[#252836]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-[#e5e7eb] dark:border-[#1e2030]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="px-2 py-2 text-center text-[11px] font-medium text-[#6b7280]">{day}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const inMonth = isSameMonth(day, currentDate);
                const today = isToday(day);
                const isSelected = selectedDate === dateStr;
                const dayData = getEventsForDate(day);
                const hasActivity = dayData.tasks.length > 0 || dayData.events.length > 0 || dayData.habits.length > 0 || dayData.focus.length > 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[80px] p-1.5 border-b border-r border-[#f3f4f6] dark:border-[#1e2030] text-left transition-all ${!inMonth ? 'opacity-40' : ''
                      } ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-[#fafbfc] dark:hover:bg-[#1a1d2e]'}
                    ${i % 7 === 0 ? 'border-l-0' : ''}`}
                  >
                    <span className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${today ? 'bg-indigo-500 text-white' : ''
                      }`}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayData.tasks.slice(0, 2).map(t => (
                        <div key={t.id} className="text-[10px] px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 truncate">
                          {t.title}
                        </div>
                      ))}
                      {dayData.events.slice(0, 1).map(e => (
                        <div key={e.id} className="text-[10px] px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 truncate">
                          {e.title}
                        </div>
                      ))}
                      {dayData.focus.length > 0 && (
                        <div className="text-[10px] px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          {dayData.focus.length} focus
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Detail */}
        <div>
          {selectedDate ? (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
              <h3 className="text-sm font-semibold mb-4">{safeFormat(selectedDate, 'EEEE, MMMM d')}</h3>

              {showAddEvent && (
                <div className="mb-4 p-3 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044]">
                  <input
                    autoFocus
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className="w-full px-2 py-1.5 rounded border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className="px-2 py-1 rounded border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-xs outline-none" />
                    <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className="px-2 py-1 rounded border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-xs outline-none" />
                    <button onClick={handleAddEvent} className="text-xs px-2 py-1 rounded bg-indigo-500 text-white">Add</button>
                    <button onClick={() => setShowAddEvent(false)} className="text-xs text-[#9ca3af]">✕</button>
                  </div>
                </div>
              )}

              {selectedDateEvents && (
                <div className="space-y-4">
                  {/* Tasks */}
                  {selectedDateEvents.tasks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#6b7280] mb-2">TASKS</h4>
                      <div className="space-y-1.5">
                        {selectedDateEvents.tasks.map(t => (
                          <div key={t.id} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                            <span className={t.status === 'completed' ? 'line-through text-[#9ca3af]' : ''}>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {selectedDateEvents.events.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#6b7280] mb-2">EVENTS</h4>
                      <div className="space-y-1.5">
                        {selectedDateEvents.events.map(e => (
                          <div key={e.id} className="flex items-center gap-2 text-sm group">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color || '#8b5cf6' }} />
                            <span className="truncate">{e.title}</span>
                            <span className="text-[10px] text-[#9ca3af] ml-auto shrink-0">{e.startTime}-{e.endTime}</span>
                            <button
                              onClick={() => deleteCalendarEvent(e.id)}
                              title="Delete event"
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-[#9ca3af] transition-all shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Focus */}
                  {selectedDateEvents.focus.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#6b7280] mb-2">FOCUS</h4>
                      <div className="space-y-1.5">
                        {selectedDateEvents.focus.map(f => (
                          <div key={f.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{f.actualDuration}m session</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Habits */}
                  {selectedDateEvents.habits.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#6b7280] mb-2">HABITS COMPLETED</h4>
                      <div className="space-y-1.5">
                        {selectedDateEvents.habits.map(h => {
                          const habit = habits.find(hab => hab.id === h.habitId);
                          return (
                            <div key={h.id} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-orange-500" />
                              <span>{habit?.name || 'Habit'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedDateEvents.tasks.length === 0 && selectedDateEvents.events.length === 0 && selectedDateEvents.focus.length === 0 && selectedDateEvents.habits.length === 0 && (
                    <p className="text-sm text-[#9ca3af] text-center py-8">Nothing scheduled</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-8 text-center">
              <p className="text-sm text-[#9ca3af]">Select a date to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
