import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Goal, Milestone, Project, Task, Habit, HabitCompletion,
  FocusSession, CalendarEvent, DailyReview, WeeklyReview,
  ActivityLog, ViewPage, ThemeMode, GoalStatus, TaskStatus, Priority
} from '../types';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO, differenceInDays } from 'date-fns';

interface AppState {
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

  // Review Actions
  addDailyReview: (review: Partial<DailyReview>) => void;
  addWeeklyReview: (review: Partial<WeeklyReview>) => void;

  // Computed helpers
  getGoalProgress: (goalId: string) => number;
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

function seedData() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');
  const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  
  return {
    goals: [
      {
        id: 'goal-1',
        title: 'Become an AI Engineer',
        description: 'Master machine learning, deep learning, and build production AI systems',
        reason: 'AI is the future and I want to be at the forefront',
        category: 'Career',
        status: 'active' as GoalStatus,
        priority: 'P1' as Priority,
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        targetDate: format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        progress: 35,
        progressType: 'task_based' as const,
        targetValue: 100,
        currentValue: 35,
        unit: '%',
        color: '#6366f1',
        createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z',
        updatedAt: today + 'T08:00:00.000Z',
      },
      {
        id: 'goal-2',
        title: 'Read 24 Books This Year',
        description: 'Expand knowledge across technology, philosophy, and personal development',
        reason: 'Continuous learning is essential for growth',
        category: 'Learning',
        status: 'active' as GoalStatus,
        priority: 'P2' as Priority,
        startDate: '2025-01-01',
        targetDate: '2025-12-31',
        progress: 42,
        progressType: 'numeric' as const,
        targetValue: 24,
        currentValue: 10,
        unit: 'books',
        color: '#22c55e',
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: today + 'T08:00:00.000Z',
      },
      {
        id: 'goal-3',
        title: 'Run a Half Marathon',
        description: 'Build endurance and complete a 21km race',
        reason: 'Physical health and mental resilience',
        category: 'Health',
        status: 'active' as GoalStatus,
        priority: 'P2' as Priority,
        startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
        targetDate: format(new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        progress: 25,
        progressType: 'manual' as const,
        targetValue: 100,
        currentValue: 25,
        unit: '%',
        color: '#f97316',
        createdAt: format(subDays(new Date(), 14), 'yyyy-MM-dd') + 'T10:00:00.000Z',
        updatedAt: today + 'T08:00:00.000Z',
      },
    ],
    milestones: [
      { id: 'ms-1', goalId: 'goal-1', title: 'Complete ML Foundations', description: 'Finish core ML courses', targetDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), status: 'in_progress' as const, progress: 60, order: 0, createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
      { id: 'ms-2', goalId: 'goal-1', title: 'Build First RAG System', description: 'Create a retrieval-augmented generation pipeline', targetDate: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), status: 'pending' as const, progress: 0, order: 1, createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
      { id: 'ms-3', goalId: 'goal-1', title: 'Deploy AI Portfolio', description: 'Ship 3 production-ready AI projects', targetDate: format(new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), status: 'pending' as const, progress: 0, order: 2, createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
    ],
    projects: [
      { id: 'proj-1', goalId: 'goal-1', milestoneId: 'ms-1', title: 'ML Course Completion', description: 'Complete Andrew Ng ML specialization', status: 'active' as const, priority: 'P1' as Priority, startDate: format(subDays(new Date(), 20), 'yyyy-MM-dd'), dueDate: format(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), progress: 60, estimatedEffort: 40, actualEffort: 24, createdAt: format(subDays(new Date(), 20), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
      { id: 'proj-2', goalId: 'goal-1', milestoneId: 'ms-2', title: 'RAG Pipeline Project', description: 'Build end-to-end RAG system with LangChain', status: 'active' as const, priority: 'P1' as Priority, startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'), dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), progress: 20, estimatedEffort: 60, actualEffort: 12, createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
    ],
    tasks: [
      { id: 'task-1', title: 'Complete RAG module - Document Loader', description: '', status: 'todo' as TaskStatus, priority: 'P1' as Priority, goalId: 'goal-1', projectId: 'proj-2', tags: ['AI', 'RAG'], dueDate: today, scheduledDate: today, estimatedDuration: 90, order: 0, createdAt: yesterday + 'T10:00:00.000Z', updatedAt: today + 'T08:00:00.000Z' },
      { id: 'task-2', title: 'Study transformer architecture notes', description: '', status: 'todo' as TaskStatus, priority: 'P2' as Priority, goalId: 'goal-1', projectId: 'proj-1', tags: ['ML', 'Study'], dueDate: today, scheduledDate: today, estimatedDuration: 60, order: 1, createdAt: yesterday + 'T10:00:00.000Z', updatedAt: today + 'T08:00:00.000Z' },
      { id: 'task-3', title: 'Read chapter 5 of AI Engineering book', description: '', status: 'todo' as TaskStatus, priority: 'P3' as Priority, goalId: 'goal-2', tags: ['Reading'], scheduledDate: today, estimatedDuration: 45, order: 2, createdAt: yesterday + 'T10:00:00.000Z', updatedAt: today + 'T08:00:00.000Z' },
      { id: 'task-4', title: 'Morning run - 5km', description: '', status: 'completed' as TaskStatus, priority: 'P2' as Priority, goalId: 'goal-3', tags: ['Exercise'], scheduledDate: today, completedAt: today + 'T07:30:00.000Z', estimatedDuration: 30, actualDuration: 28, order: 3, createdAt: yesterday + 'T10:00:00.000Z', updatedAt: today + 'T07:30:00.000Z' },
      { id: 'task-5', title: 'Review LangChain documentation', description: '', status: 'completed' as TaskStatus, priority: 'P2' as Priority, goalId: 'goal-1', projectId: 'proj-2', tags: ['AI'], scheduledDate: yesterday, completedAt: yesterday + 'T15:00:00.000Z', estimatedDuration: 45, actualDuration: 50, order: 4, createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd') + 'T10:00:00.000Z', updatedAt: yesterday + 'T15:00:00.000Z' },
      { id: 'task-6', title: 'Set up vector database', description: '', status: 'completed' as TaskStatus, priority: 'P1' as Priority, goalId: 'goal-1', projectId: 'proj-2', tags: ['AI', 'Infra'], scheduledDate: twoDaysAgo, completedAt: twoDaysAgo + 'T14:00:00.000Z', estimatedDuration: 60, actualDuration: 75, order: 5, createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd') + 'T10:00:00.000Z', updatedAt: twoDaysAgo + 'T14:00:00.000Z' },
      { id: 'task-7', title: 'Write blog post about learning journey', description: '', status: 'todo' as TaskStatus, priority: 'P3' as Priority, tags: ['Writing'], dueDate: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), estimatedDuration: 120, order: 6, createdAt: today + 'T08:00:00.000Z', updatedAt: today + 'T08:00:00.000Z' },
    ],
    habits: [
      { id: 'habit-1', name: 'Morning Exercise', description: '30 min workout or run', frequency: 'daily' as const, target: 1, unit: 'session', schedule: [1, 2, 3, 4, 5], goalId: 'goal-3', currentStreak: 5, longestStreak: 12, color: '#f97316', createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
      { id: 'habit-2', name: 'Read 30 Minutes', description: 'Read a non-fiction book', frequency: 'daily' as const, target: 1, unit: 'session', schedule: [0, 1, 2, 3, 4, 5, 6], goalId: 'goal-2', currentStreak: 8, longestStreak: 21, color: '#22c55e', createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
      { id: 'habit-3', name: 'Study AI/ML', description: 'Minimum 1 hour of focused study', frequency: 'daily' as const, target: 1, unit: 'hour', schedule: [1, 2, 3, 4, 5], goalId: 'goal-1', currentStreak: 3, longestStreak: 15, color: '#6366f1', createdAt: format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
      { id: 'habit-4', name: 'Meditate', description: '10 minutes mindfulness', frequency: 'daily' as const, target: 1, unit: 'session', schedule: [0, 1, 2, 3, 4, 5, 6], currentStreak: 2, longestStreak: 30, color: '#8b5cf6', createdAt: format(subDays(new Date(), 60), 'yyyy-MM-dd') + 'T10:00:00.000Z' },
    ],
    habitCompletions: [
      // Generate completions for last 7 days
      ...[0, 1, 2, 3, 4, 5, 6].flatMap(i => {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const completions = [];
        if (i < 5) completions.push({ id: `hc-ex-${i}`, habitId: 'habit-1', date, value: 1, completed: true, timestamp: date + 'T07:00:00.000Z' });
        if (i < 8) completions.push({ id: `hc-read-${i}`, habitId: 'habit-2', date, value: 1, completed: true, timestamp: date + 'T21:00:00.000Z' });
        if (i < 3 && new Date(date).getDay() !== 0 && new Date(date).getDay() !== 6) completions.push({ id: `hc-ai-${i}`, habitId: 'habit-3', date, value: 1, completed: true, timestamp: date + 'T14:00:00.000Z' });
        if (i < 2) completions.push({ id: `hc-med-${i}`, habitId: 'habit-4', date, value: 1, completed: true, timestamp: date + 'T06:30:00.000Z' });
        return completions;
      }),
    ],
    focusSessions: [
      { id: 'fs-1', startTime: today + 'T09:00:00.000Z', endTime: today + 'T09:50:00.000Z', duration: 50, actualDuration: 48, taskId: 'task-5', goalId: 'goal-1', status: 'completed' as const, type: 'pomodoro' as const, createdAt: today + 'T09:00:00.000Z' },
      { id: 'fs-2', startTime: today + 'T10:00:00.000Z', endTime: today + 'T10:50:00.000Z', duration: 50, actualDuration: 50, taskId: 'task-6', goalId: 'goal-1', status: 'completed' as const, type: 'pomodoro' as const, createdAt: today + 'T10:00:00.000Z' },
      { id: 'fs-3', startTime: yesterday + 'T09:00:00.000Z', endTime: yesterday + 'T09:50:00.000Z', duration: 50, actualDuration: 45, goalId: 'goal-1', status: 'completed' as const, type: 'pomodoro' as const, createdAt: yesterday + 'T09:00:00.000Z' },
      { id: 'fs-4', startTime: yesterday + 'T14:00:00.000Z', endTime: yesterday + 'T14:50:00.000Z', duration: 50, actualDuration: 50, goalId: 'goal-1', status: 'completed' as const, type: 'pomodoro' as const, createdAt: yesterday + 'T14:00:00.000Z' },
      { id: 'fs-5', startTime: twoDaysAgo + 'T10:00:00.000Z', endTime: twoDaysAgo + 'T11:30:00.000Z', duration: 90, actualDuration: 85, goalId: 'goal-1', status: 'completed' as const, type: 'custom' as const, createdAt: twoDaysAgo + 'T10:00:00.000Z' },
      { id: 'fs-6', startTime: threeDaysAgo + 'T09:00:00.000Z', endTime: threeDaysAgo + 'T09:50:00.000Z', duration: 50, actualDuration: 50, goalId: 'goal-1', status: 'completed' as const, type: 'pomodoro' as const, createdAt: threeDaysAgo + 'T09:00:00.000Z' },
    ],
    calendarEvents: [
      { id: 'ce-1', title: 'Deep Work - AI Study', date: today, startTime: '09:00', endTime: '11:00', type: 'focus' as const, goalId: 'goal-1', color: '#6366f1' },
      { id: 'ce-2', title: 'Team Standup', date: today, startTime: '11:00', endTime: '11:30', type: 'event' as const, color: '#9ca3af' },
      { id: 'ce-3', title: 'Lunch Break', date: today, startTime: '12:00', endTime: '13:00', type: 'event' as const, color: '#22c55e' },
      { id: 'ce-4', title: 'Project Review', date: today, startTime: '14:00', endTime: '15:00', type: 'event' as const, color: '#f97316' },
    ],
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
        const goal: Goal = {
          id,
          title: goalData.title || 'New Goal',
          description: goalData.description || '',
          reason: goalData.reason || '',
          category: goalData.category || 'General',
          status: goalData.status || 'active',
          priority: goalData.priority || 'P2',
          startDate: goalData.startDate || format(new Date(), 'yyyy-MM-dd'),
          targetDate: goalData.targetDate || format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          progress: goalData.progress || 0,
          progressType: goalData.progressType || 'manual',
          targetValue: goalData.targetValue || 100,
          currentValue: goalData.currentValue || 0,
          unit: goalData.unit || '%',
          color: goalData.color || COLORS[Math.floor(Math.random() * COLORS.length)],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ goals: [...state.goals, goal] }));
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
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          milestones: state.milestones.filter((m) => m.goalId !== id),
          projects: state.projects.filter((p) => p.goalId !== id),
          tasks: state.tasks.map((t) => t.goalId === id ? { ...t, goalId: undefined } : t),
        }));
      },

      // Milestone Actions
      addMilestone: (data) => {
        const milestone: Milestone = {
          id: uuidv4(),
          goalId: data.goalId || '',
          title: data.title || 'New Milestone',
          description: data.description || '',
          targetDate: data.targetDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
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
          startDate: data.startDate || format(new Date(), 'yyyy-MM-dd'),
          dueDate: data.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
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
          let today = format(new Date(), 'yyyy-MM-dd');
          let checkDate = parseISO(today);
          
          for (let i = 0; i < 365; i++) {
            const dateStr = format(checkDate, 'yyyy-MM-dd');
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
          date: data.date || format(new Date(), 'yyyy-MM-dd'),
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

      // Review Actions
      addDailyReview: (data) => {
        const review: DailyReview = {
          id: uuidv4(),
          date: data.date || format(new Date(), 'yyyy-MM-dd'),
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
          case 'manual':
            return goal.progress;
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

      getTodayTasks: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().tasks.filter(t =>
          (t.scheduledDate === today || t.dueDate === today) && t.status !== 'completed' && t.status !== 'cancelled'
        );
      },

      getTodayHabits: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
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
          const date = format(subDays(today, i), 'yyyy-MM-dd');
          const hasActivity = completions.some(c => c.date === date) ||
            get().tasks.some(t => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === date) ||
            get().focusSessions.some(s => s.status === 'completed' && s.endTime && format(parseISO(s.endTime), 'yyyy-MM-dd') === date);
          
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
        get().tasks.forEach(t => { if (t.completedAt) allDates.add(format(parseISO(t.completedAt), 'yyyy-MM-dd')); });
        get().focusSessions.forEach(s => { if (s.endTime) allDates.add(format(parseISO(s.endTime), 'yyyy-MM-dd')); });
        
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
          const dateStr = format(date, 'yyyy-MM-dd');
          
          if (i < 0) {
            days.push({ date: dateStr, status: 'future' });
            continue;
          }
          
          const completions = get().habitCompletions.filter(c => c.date === dateStr);
          const habitsScheduled = get().habits.filter(h => h.schedule.includes(date.getDay()));
          const tasksCompleted = get().tasks.filter(t => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === dateStr);
          const focusSessions = get().focusSessions.filter(s => s.status === 'completed' && s.endTime && format(parseISO(s.endTime), 'yyyy-MM-dd') === dateStr);
          
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
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().focusSessions
          .filter(s => s.status === 'completed' && s.endTime && format(parseISO(s.endTime), 'yyyy-MM-dd') === today)
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
        const dayStrs = days.map(d => format(d, 'yyyy-MM-dd'));
        
        return get().tasks.filter(t =>
          t.status === 'completed' && t.completedAt && dayStrs.includes(format(parseISO(t.completedAt), 'yyyy-MM-dd'))
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
      version: 1,
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<AppState> | undefined;
        // If no persisted data, use seed data
        if (!state || (!state.goals?.length && !state.tasks?.length)) {
          const seed = seedData();
          return {
            ...currentState,
            goals: seed.goals,
            milestones: seed.milestones,
            projects: seed.projects,
            tasks: seed.tasks,
            habits: seed.habits,
            habitCompletions: seed.habitCompletions,
            focusSessions: seed.focusSessions,
            calendarEvents: seed.calendarEvents,
          } as any;
        }
        return { ...currentState, ...state } as any;
      },
    }
  )
);
