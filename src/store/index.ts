import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Goal, Milestone, Project, Task, Habit, HabitCompletion,
  FocusSession, CalendarEvent, DailyReview, WeeklyReview,
  ActivityLog, ViewPage, ThemeMode, GoalStatus, TaskStatus, Priority, User
} from '../types';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO, differenceInDays, isValid } from 'date-fns';

import { safeFormat } from '../utils/date';

interface AppState {
  // Auth
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;

  // Navigation
  currentPage: ViewPage;
  setCurrentPage: (page: ViewPage) => void;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  showDetailPanel: boolean;
  setShowDetailPanel: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Data
  goals: Goal[];
  milestones: Milestone[];
  projects: Project[];
  tasks: Task[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  focusSessions: FocusSession[];
  calendarEvents: CalendarEvent[];
  dailyReviews: DailyReview[];
  weeklyReviews: WeeklyReview[];
  activityLog: ActivityLog[];

  // Goal Actions
  addGoal: (goal: Partial<Goal>) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Milestone Actions
  addMilestone: (milestone: Partial<Milestone>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  // Project Actions
  addProject: (project: Partial<Project>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task Actions
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Habit Actions
  addHabit: (habit: Partial<Habit>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;

  // Focus Actions
  startFocusSession: (session: Partial<FocusSession>) => string;
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => void;
  completeFocusSession: (id: string) => void;

  // Calendar Actions
  addCalendarEvent: (event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEventComplete: (id: string) => void;
  cleanupOrphanedEvents: () => void;

  // Review Actions
  addDailyReview: (review: Partial<DailyReview>) => void;
  addWeeklyReview: (review: Partial<WeeklyReview>) => void;

  // Computed helpers
  getGoalProgress: (goalId: string) => number;
  getGoalStreak: (goalId: string) => { currentStreak: number; longestStreak: number; completedDays: number; totalDays: number };
  toggleGoalDayComplete: (goalId: string, date: string) => void;
  getTodayTasks: () => Task[];
  getTodayHabits: () => { habit: Habit; completed: boolean }[];
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getStreakData: () => { date: string; status: 'completed' | 'partial' | 'missed' | 'future' | 'rest' }[];
  getFocusToday: () => number;
  getTotalFocus: () => number;
  getWeekTasksCompleted: () => number;
  logActivity: (type: string, entityId: string, entityType: string, description: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];



export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      login: (name, email) => {
        set({ user: { id: uuidv4(), name, email } });
      },
      logout: () => {
        set({ user: null });
      },

      // Navigation
      currentPage: 'home',
      setCurrentPage: (page) => set({ currentPage: page }),
      selectedGoalId: null,
      setSelectedGoalId: (id) => set({ selectedGoalId: id }),
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      showDetailPanel: false,
      setShowDetailPanel: (show) => set({ showDetailPanel: show }),
      showCommandPalette: false,
      setShowCommandPalette: (show) => set({ showCommandPalette: show }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Data
      goals: [],
      milestones: [],
      projects: [],
      tasks: [],
      habits: [],
      habitCompletions: [],
      focusSessions: [],
      calendarEvents: [],
      dailyReviews: [],
      weeklyReviews: [],
      activityLog: [],

      // Goal Actions
      addGoal: (goalData) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const startDate = goalData.startDate || safeFormat(new Date(), 'yyyy-MM-dd');
        const targetDate = goalData.targetDate || safeFormat(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const optimizedTime = goalData.optimizedTime || '09:00';

        const goal: Goal = {
          id,
          title: goalData.title || 'New Goal',
          description: goalData.description || '',
          reason: goalData.reason || '',
          category: goalData.category || 'General',
          status: goalData.status || 'active',
          priority: goalData.priority || 'P2',
          startDate,
          targetDate,
          optimizedTime,
          optimizedEndTime: goalData.optimizedEndTime || '10:00',
          progress: goalData.progress || 0,
          progressType: goalData.progressType || 'manual',
          targetValue: goalData.targetValue || 100,
          currentValue: goalData.currentValue || 0,
          unit: goalData.unit || '%',
          color: goalData.color || COLORS[Math.floor(Math.random() * COLORS.length)],
          createdAt: now,
          updatedAt: now,
        };

        // Generate calendar events for every day between start and target
        const start = parseISO(startDate);
        const end = parseISO(targetDate);
        let days: Date[] = [];
        if (start <= end) {
          try {
            days = eachDayOfInterval({ start, end });
          } catch (e) {
            console.error('Invalid dates for interval', e);
          }
        }
        
        const newEvents: CalendarEvent[] = days.map(d => ({
          id: uuidv4(),
          title: `Goal: ${goal.title}`,
          date: safeFormat(d, 'yyyy-MM-dd'),
          startTime: optimizedTime,
          endTime: goal.optimizedEndTime || safeFormat(new Date(new Date(`2000-01-01T${optimizedTime}`).getTime() + 60*60*1000), 'HH:mm'),
          type: 'event',
          goalId: goal.id,
          color: goal.color,
          completed: false,
        }));

        set((state) => ({ 
          goals: [...state.goals, goal],
          calendarEvents: [...state.calendarEvents, ...newEvents]
        }));
        
        get().logActivity('create', id, 'goal', `Created goal: ${goal.title}`);
        return id;
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },

      deleteGoal: (id) => {
        const goalToDelete = get().goals.find((g) => g.id === id);
        const goalTitle = goalToDelete?.title.trim().toLowerCase();

        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          milestones: state.milestones.filter((m) => m.goalId !== id),
          projects: state.projects.filter((p) => p.goalId !== id),
          tasks: state.tasks.map((t) => t.goalId === id ? { ...t, goalId: undefined } : t),
          calendarEvents: state.calendarEvents.filter((e) => {
            if (e.goalId === id) return false;
            if (goalTitle && e.title.trim().toLowerCase() === `goal: ${goalTitle}`) return false;
            return true;
          }),
        }));
      },

      // Milestone Actions
      addMilestone: (data) => {
        const milestone: Milestone = {
          id: uuidv4(),
          goalId: data.goalId || '',
          title: data.title || 'New Milestone',
          description: data.description || '',
          targetDate: data.targetDate || safeFormat(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          status: data.status || 'pending',
          progress: data.progress || 0,
          order: data.order || get().milestones.filter(m => m.goalId === data.goalId).length,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ milestones: [...state.milestones, milestone] }));
      },

      updateMilestone: (id, updates) => {
        set((state) => ({
          milestones: state.milestones.map((m) => m.id === id ? { ...m, ...updates } : m),
        }));
      },

      deleteMilestone: (id) => {
        set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
      },

      // Project Actions
      addProject: (data) => {
        const project: Project = {
          id: uuidv4(),
          goalId: data.goalId || '',
          milestoneId: data.milestoneId,
          title: data.title || 'New Project',
          description: data.description || '',
          status: data.status || 'not_started',
          priority: data.priority || 'P2',
          startDate: data.startDate || safeFormat(new Date(), 'yyyy-MM-dd'),
          dueDate: data.dueDate || safeFormat(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          progress: data.progress || 0,
          estimatedEffort: data.estimatedEffort || 0,
          actualEffort: data.actualEffort || 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, project] }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
      },

      // Task Actions
      addTask: (data) => {
        const task: Task = {
          id: uuidv4(),
          title: data.title || 'New Task',
          description: data.description || '',
          status: data.status || 'todo',
          priority: data.priority || 'P3',
          goalId: data.goalId,
          projectId: data.projectId,
          milestoneId: data.milestoneId,
          parentId: data.parentId,
          tags: data.tags || [],
          dueDate: data.dueDate,
          startDate: data.startDate,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: data.estimatedDuration,
          actualDuration: data.actualDuration,
          order: data.order || get().tasks.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
        get().logActivity('create', task.id, 'task', `Created task: ${task.title}`);
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id && t.parentId !== id),
        }));
      },

      toggleTaskComplete: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        const isCompleted = task.status === 'completed';
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                ...t,
                status: isCompleted ? 'todo' as TaskStatus : 'completed' as TaskStatus,
                completedAt: isCompleted ? undefined : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              : t
          ),
        }));
        if (!isCompleted) {
          get().logActivity('complete', id, 'task', `Completed task: ${task.title}`);
        }
      },

      // Habit Actions
      addHabit: (data) => {
        const habit: Habit = {
          id: uuidv4(),
          name: data.name || 'New Habit',
          description: data.description || '',
          frequency: data.frequency || 'daily',
          target: data.target || 1,
          unit: data.unit || 'times',
          schedule: data.schedule || [0, 1, 2, 3, 4, 5, 6],
          goalId: data.goalId,
          currentStreak: 0,
          longestStreak: 0,
          color: data.color || COLORS[Math.floor(Math.random() * COLORS.length)],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => h.id === id ? { ...h, ...updates } : h),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          habitCompletions: state.habitCompletions.filter((c) => c.habitId !== id),
        }));
      },

      toggleHabitCompletion: (habitId, date) => {
        const existing = get().habitCompletions.find(c => c.habitId === habitId && c.date === date);
        if (existing) {
          set((state) => ({
            habitCompletions: state.habitCompletions.filter(c => c.id !== existing.id),
          }));
        } else {
          const completion: HabitCompletion = {
            id: uuidv4(),
            habitId,
            date,
            value: 1,
            completed: true,
            timestamp: new Date().toISOString(),
          };
          set((state) => ({ habitCompletions: [...state.habitCompletions, completion] }));
        }
        // Recalculate streaks
        const habit = get().habits.find(h => h.id === habitId);
        if (habit) {
          const completions = get().habitCompletions
            .filter(c => c.habitId === habitId)
            .sort((a, b) => b.date.localeCompare(a.date));

          let streak = 0;
          let today = safeFormat(new Date(), 'yyyy-MM-dd');
          let checkDate = parseISO(today);

          for (let i = 0; i < 365; i++) {
            const dateStr = safeFormat(checkDate, 'yyyy-MM-dd');
            const dayOfWeek = checkDate.getDay();
            const isScheduled = habit.schedule.includes(dayOfWeek);

            if (!isScheduled) {
              checkDate = subDays(checkDate, 1);
              continue;
            }

            const completed = completions.some(c => c.date === dateStr);
            if (completed) {
              streak++;
            } else if (i === 0) {
              // Today not yet completed, continue checking
              checkDate = subDays(checkDate, 1);
              continue;
            } else {
              break;
            }
            checkDate = subDays(checkDate, 1);
          }

          const longest = Math.max(streak, habit.longestStreak);
          get().updateHabit(habitId, { currentStreak: streak, longestStreak: longest });
        }
      },

      // Focus Actions
      startFocusSession: (data) => {
        const id = uuidv4();
        const session: FocusSession = {
          id,
          startTime: data.startTime || new Date().toISOString(),
          duration: data.duration || 25,
          actualDuration: 0,
          taskId: data.taskId,
          projectId: data.projectId,
          goalId: data.goalId,
          status: 'running',
          type: data.type || 'pomodoro',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ focusSessions: [...state.focusSessions, session] }));
        return id;
      },

      updateFocusSession: (id, updates) => {
        set((state) => ({
          focusSessions: state.focusSessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      completeFocusSession: (id) => {
        const session = get().focusSessions.find(s => s.id === id);
        if (!session) return;
        const start = parseISO(session.startTime);
        const now = new Date();
        const actualMinutes = Math.round((now.getTime() - start.getTime()) / 60000);
        set((state) => ({
          focusSessions: state.focusSessions.map((s) =>
            s.id === id ? { ...s, status: 'completed' as const, endTime: now.toISOString(), actualDuration: actualMinutes } : s
          ),
        }));
        get().logActivity('focus', id, 'session', `Completed ${actualMinutes}min focus session`);
      },

      // Calendar Actions
      addCalendarEvent: (data) => {
        const event: CalendarEvent = {
          id: uuidv4(),
          title: data.title || 'Event',
          date: data.date || safeFormat(new Date(), 'yyyy-MM-dd'),
          startTime: data.startTime || '09:00',
          endTime: data.endTime || '10:00',
          type: data.type || 'event',
          taskId: data.taskId,
          goalId: data.goalId,
          color: data.color || '#6366f1',
        };
        set((state) => ({ calendarEvents: [...state.calendarEvents, event] }));
      },

      deleteCalendarEvent: (id) => {
        set((state) => ({ calendarEvents: state.calendarEvents.filter(e => e.id !== id) }));
      },

      toggleCalendarEventComplete: (id) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.map(e =>
            e.id === id ? { ...e, completed: !e.completed } : e
          )
        }));
      },

      cleanupOrphanedEvents: () => {
        set((state) => {
          const validGoalIds = new Set(state.goals.map((g) => g.id));
          const validGoalTitles = new Set(state.goals.map((g) => g.title.trim().toLowerCase()));

          let calendarChanged = false;
          const cleanCalendar = state.calendarEvents.filter((e) => {
            if (e.goalId) {
              const valid = validGoalIds.has(e.goalId);
              if (!valid) calendarChanged = true;
              return valid;
            }
            const lowerTitle = e.title.trim().toLowerCase();
            if (lowerTitle.startsWith('goal:')) {
              const goalName = lowerTitle.replace(/^goal:\s*/, '').trim();
              const valid = validGoalTitles.has(goalName);
              if (!valid) calendarChanged = true;
              return valid;
            }
            return true;
          }).map((e) => {
            if (!e.goalId && e.title.trim().toLowerCase().startsWith('goal:')) {
              const goalName = e.title.trim().toLowerCase().replace(/^goal:\s*/, '').trim();
              const matched = state.goals.find(g => g.title.trim().toLowerCase() === goalName);
              if (matched) {
                calendarChanged = true;
                return { ...e, goalId: matched.id };
              }
            }
            return e;
          });

          let tasksChanged = false;
          const cleanTasks = state.tasks.map((t) => {
            if (t.goalId && !validGoalIds.has(t.goalId)) {
              tasksChanged = true;
              return { ...t, goalId: undefined };
            }
            return t;
          });

          const cleanMilestones = state.milestones.filter((m) => !m.goalId || validGoalIds.has(m.goalId));
          const milestonesChanged = cleanMilestones.length !== state.milestones.length;

          const cleanProjects = state.projects.filter((p) => !p.goalId || validGoalIds.has(p.goalId));
          const projectsChanged = cleanProjects.length !== state.projects.length;

          if (!calendarChanged && !tasksChanged && !milestonesChanged && !projectsChanged) {
            return {};
          }

          return {
            calendarEvents: cleanCalendar,
            tasks: cleanTasks,
            milestones: cleanMilestones,
            projects: cleanProjects,
          };
        });
      },

      // Review Actions
      addDailyReview: (data) => {
        const review: DailyReview = {
          id: uuidv4(),
          date: data.date || safeFormat(new Date(), 'yyyy-MM-dd'),
          accomplishments: data.accomplishments || '',
          blockers: data.blockers || '',
          tomorrowFocus: data.tomorrowFocus || '',
          completedTasks: data.completedTasks || 0,
          plannedTasks: data.plannedTasks || 0,
          focusDuration: data.focusDuration || 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ dailyReviews: [...state.dailyReviews, review] }));
      },

      addWeeklyReview: (data) => {
        const review: WeeklyReview = {
          id: uuidv4(),
          weekStart: data.weekStart || '',
          weekEnd: data.weekEnd || '',
          goalProgress: data.goalProgress || '',
          taskCompletion: data.taskCompletion || '',
          focusTime: data.focusTime || 0,
          notes: data.notes || '',
          nextWeekFocus: data.nextWeekFocus || '',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ weeklyReviews: [...state.weeklyReviews, review] }));
      },

      // Computed helpers
      getGoalProgress: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return 0;

        switch (goal.progressType) {
          case 'manual': {
            if (goal.progress > 0) return goal.progress;
            const events = get().calendarEvents.filter(e => e.goalId === goalId);
            if (events.length > 0) {
              const completed = events.filter(e => e.completed).length;
              return Math.min(100, Math.round((completed / events.length) * 100));
            }
            return 0;
          }
          case 'streak': {
            const events = get().calendarEvents.filter(e => e.goalId === goalId);
            if (events.length === 0) return 0;
            const completed = events.filter(e => e.completed).length;
            return Math.min(100, Math.round((completed / events.length) * 100));
          }
          case 'task_based': {
            const tasks = get().tasks.filter(t => t.goalId === goalId);
            if (tasks.length === 0) return 0;
            const completed = tasks.filter(t => t.status === 'completed').length;
            return Math.round((completed / tasks.length) * 100);
          }
          case 'milestone_based': {
            const milestones = get().milestones.filter(m => m.goalId === goalId);
            if (milestones.length === 0) return 0;
            const completed = milestones.filter(m => m.status === 'completed').length;
            return Math.round((completed / milestones.length) * 100);
          }
          case 'numeric': {
            if (goal.targetValue === 0) return 0;
            return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          }
          default:
            return goal.progress;
        }
      },

      toggleGoalDayComplete: (goalId: string, date: string) => {
        const existingEvent = get().calendarEvents.find(e => e.goalId === goalId && e.date === date);
        if (existingEvent) {
          get().toggleCalendarEventComplete(existingEvent.id);
        } else {
          const goal = get().goals.find(g => g.id === goalId);
          if (!goal) return;
          const newEvent: CalendarEvent = {
            id: uuidv4(),
            title: `Goal: ${goal.title}`,
            date,
            startTime: goal.optimizedTime || '09:00',
            endTime: goal.optimizedEndTime || '10:00',
            type: 'event',
            goalId: goal.id,
            color: goal.color,
            completed: true,
          };
          set(state => ({ calendarEvents: [...state.calendarEvents, newEvent] }));
        }
      },

      getGoalStreak: (goalId: string) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return { currentStreak: 0, longestStreak: 0, completedDays: 0, totalDays: 0 };

        const events = get().calendarEvents.filter(e => e.goalId === goalId);
        const completedDates = new Set(events.filter(e => e.completed).map(e => e.date));

        const completedDays = completedDates.size;
        const totalDays = events.length || 1;

        const today = new Date();
        const todayStr = safeFormat(today, 'yyyy-MM-dd');
        let currentStreak = 0;

        let startIndex = 0;
        if (!completedDates.has(todayStr)) {
          startIndex = 1;
        }

        for (let i = startIndex; i < 365; i++) {
          const dStr = safeFormat(subDays(today, i), 'yyyy-MM-dd');
          if (goal.startDate && dStr < goal.startDate) break;
          if (completedDates.has(dStr)) {
            currentStreak++;
          } else {
            break;
          }
        }

        const sortedDates = Array.from(completedDates).sort();
        let longestStreak = 0;
        let tempStreak = 0;
        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0) {
            tempStreak = 1;
          } else {
            const diff = differenceInDays(parseISO(sortedDates[i]), parseISO(sortedDates[i - 1]));
            if (diff === 1) {
              tempStreak++;
            } else if (diff > 1) {
              tempStreak = 1;
            }
          }
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        }

        return {
          currentStreak,
          longestStreak,
          completedDays,
          totalDays,
        };
      },

      getTodayTasks: () => {
        const today = safeFormat(new Date(), 'yyyy-MM-dd');
        return get().tasks.filter(t =>
          (t.scheduledDate === today || t.dueDate === today) && t.status !== 'completed' && t.status !== 'cancelled'
        );
      },

      getTodayHabits: () => {
        const today = safeFormat(new Date(), 'yyyy-MM-dd');
        const dayOfWeek = new Date().getDay();
        return get().habits
          .filter(h => h.schedule.includes(dayOfWeek))
          .map(h => ({
            habit: h,
            completed: get().habitCompletions.some(c => c.habitId === h.id && c.date === today),
          }));
      },

      getCurrentStreak: () => {
        const completions = get().habitCompletions;
        if (completions.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
          const date = safeFormat(subDays(today, i), 'yyyy-MM-dd');
          const hasActivity = completions.some(c => c.date === date) ||
            get().tasks.some(t => t.completedAt && safeFormat(parseISO(t.completedAt), 'yyyy-MM-dd') === date) ||
            get().focusSessions.some(s => s.status === 'completed' && s.endTime && safeFormat(parseISO(s.endTime), 'yyyy-MM-dd') === date) ||
            get().calendarEvents.some(e => e.completed && e.date === date);

          if (hasActivity) {
            streak++;
          } else if (i === 0) {
            continue; // Today might not have activity yet
          } else {
            break;
          }
        }
        return streak;
      },

      getLongestStreak: () => {
        const allDates = new Set<string>();
        get().habitCompletions.forEach(c => allDates.add(c.date));
        get().tasks.forEach(t => { if (t.completedAt) allDates.add(safeFormat(parseISO(t.completedAt), 'yyyy-MM-dd')); });
        get().focusSessions.forEach(s => { if (s.endTime) allDates.add(safeFormat(parseISO(s.endTime), 'yyyy-MM-dd')); });

        if (allDates.size === 0) return 0;

        const sorted = Array.from(allDates).sort();
        let longest = 1;
        let current = 1;

        for (let i = 1; i < sorted.length; i++) {
          const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
          if (diff === 1) {
            current++;
            longest = Math.max(longest, current);
          } else if (diff > 1) {
            current = 1;
          }
        }
        return longest;
      },

      getStreakData: () => {
        const today = new Date();
        const days: { date: string; status: 'completed' | 'partial' | 'missed' | 'future' | 'rest' }[] = [];

        for (let i = 29; i >= 0; i--) {
          const date = subDays(today, i);
          const dateStr = safeFormat(date, 'yyyy-MM-dd');

          if (i < 0) {
            days.push({ date: dateStr, status: 'future' });
            continue;
          }

          const completions = get().habitCompletions.filter(c => c.date === dateStr);
          const habitsScheduled = get().habits.filter(h => h.schedule.includes(date.getDay()));
          const tasksCompleted = get().tasks.filter(t => t.completedAt && safeFormat(parseISO(t.completedAt), 'yyyy-MM-dd') === dateStr);
          const focusSessions = get().focusSessions.filter(s => s.status === 'completed' && s.endTime && safeFormat(parseISO(s.endTime), 'yyyy-MM-dd') === dateStr);

          const totalActivities = completions.length + tasksCompleted.length + focusSessions.length;
          const scheduledTotal = habitsScheduled.length;

          if (totalActivities === 0 && scheduledTotal === 0) {
            days.push({ date: dateStr, status: 'rest' });
          } else if (scheduledTotal > 0 && totalActivities >= scheduledTotal) {
            days.push({ date: dateStr, status: 'completed' });
          } else if (totalActivities > 0) {
            days.push({ date: dateStr, status: 'partial' });
          } else {
            days.push({ date: dateStr, status: 'missed' });
          }
        }
        return days;
      },

      getFocusToday: () => {
        const today = safeFormat(new Date(), 'yyyy-MM-dd');
        return get().focusSessions
          .filter(s => s.status === 'completed' && s.endTime && safeFormat(parseISO(s.endTime), 'yyyy-MM-dd') === today)
          .reduce((sum, s) => sum + s.actualDuration, 0);
      },

      getTotalFocus: () => {
        return get().focusSessions
          .filter(s => s.status === 'completed')
          .reduce((sum, s) => sum + s.actualDuration, 0);
      },

      getWeekTasksCompleted: () => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const dayStrs = days.map(d => safeFormat(d, 'yyyy-MM-dd'));

        return get().tasks.filter(t =>
          t.status === 'completed' && t.completedAt && dayStrs.includes(safeFormat(parseISO(t.completedAt), 'yyyy-MM-dd'))
        ).length;
      },

      logActivity: (type, entityId, entityType, description) => {
        const log: ActivityLog = {
          id: uuidv4(),
          type,
          entityId,
          entityType,
          description,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ activityLog: [log, ...state.activityLog].slice(0, 500) }));
      },
    }),
    {
      name: 'goal-execution-system',
      version: 2,
    }
  )
);
