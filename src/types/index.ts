export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type GoalStatus = 'planned' | 'active' | 'paused' | 'completed' | 'archived';
export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type ProjectStatus = 'not_started' | 'active' | 'paused' | 'completed' | 'archived';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type ProgressType = 'manual' | 'task_based' | 'milestone_based' | 'numeric' | 'habit_based';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Goal {
  id: string;
  title: string;
  description: string;
  reason: string;
  category: string;
  status: GoalStatus;
  priority: Priority;
  startDate: string;
  targetDate: string;
  progress: number;
  progressType: ProgressType;
  targetValue: number;
  currentValue: number;
  unit: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  order: number;
  createdAt: string;
}

export interface Project {
  id: string;
  goalId: string;
  milestoneId?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
  progress: number;
  estimatedEffort: number;
  actualEffort: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  goalId?: string;
  projectId?: string;
  milestoneId?: string;
  parentId?: string;
  tags: string[];
  dueDate?: string;
  startDate?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  completedAt?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  target: number;
  unit: string;
  schedule: number[]; // days of week 0-6
  goalId?: string;
  currentStreak: number;
  longestStreak: number;
  color: string;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
  timestamp: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // planned minutes
  actualDuration: number; // actual minutes
  taskId?: string;
  projectId?: string;
  goalId?: string;
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  type: 'pomodoro' | 'custom';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'focus' | 'habit' | 'milestone' | 'event';
  taskId?: string;
  goalId?: string;
  color: string;
}

export interface DailyReview {
  id: string;
  date: string;
  accomplishments: string;
  blockers: string;
  tomorrowFocus: string;
  completedTasks: number;
  plannedTasks: number;
  focusDuration: number;
  createdAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  goalProgress: string;
  taskCompletion: string;
  focusTime: number;
  notes: string;
  nextWeekFocus: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  entityId: string;
  entityType: string;
  description: string;
  timestamp: string;
}

export type ViewPage = 'home' | 'today' | 'goals' | 'projects' | 'habits' | 'focus' | 'calendar' | 'analytics' | 'inbox' | 'upcoming';
