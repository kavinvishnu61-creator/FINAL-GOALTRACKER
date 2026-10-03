# Momentum — Personal Goal Execution System

A modern, high-performance web application designed for ambitious individuals to execute, track, and achieve their goals systematically.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Zustand**.

---

## 🌟 Key Features

### 🎯 1. Outcome-Driven Goal Management
- **Progress Tracking Modes**: Manual percentage, Task-based, Milestone-based, Numeric/Metric, or Habit/Streak-based.
- **Categorization & Priorities**: Group goals by Career, Health, Learning, Finance, Relationships, or Creative. Priority levels P1 through P4.
- **Optimized Scheduling**: Automatically generates calendar schedules and allocates dedicated daily focus windows.

### 📅 2. Today Execution Plan
- **Daily Focus Dashboard**: View your personalized daily schedule, high-priority tasks, and scheduled habits at a glance.
- **Daily Preference Tasks**: Distinguish standalone daily tasks from long-term goal tasks.
- **Live Daily Metrics**: Real-time stats for tasks completed, current streak, minutes focused, and habit completion.

### 🗓️ 3. Full Calendar Integration
- **Month & Week Overview**: Interactive view of goal milestones, daily tasks, events, and focus sessions.
- **Event Management**: Create, view, complete, and delete scheduled calendar blocks with custom color tags.

### ⏱️ 4. Focus Timer (Pomodoro)
- **Deep Work Sessions**: Built-in 25-minute Pomodoro (or custom duration) focus timer.
- **Session History & Analytics**: Log minutes against specific goals or tasks.
- **Browser Notifications**: Desktop alerts upon completing deep work sessions.

### 🔥 5. Habit Consistency Tracker
- **Streak Engine**: Tracks current streaks and longest streaks across daily, weekly, or custom schedules.
- **Mini Heatmap & History**: 14-day consistency view for every habit.

### 📊 6. Comprehensive Analytics
- **Activity Trends**: Weekly task completion, habit consistency, and focus minutes visualized with interactive charts (Recharts).
- **90-Day Contribution Heatmap**: GitHub-style activity grid visualizing all completed work over time.
- **Hourly Focus Distribution**: Insights into your most productive hours of the day.

### ⚡ 7. Command Palette (`Ctrl + K` / `Cmd + K`)
- Instant keyboard-driven navigation across all views, goal details, and quick creation shortcuts.

### 🌓 8. Sleek Dark & Light Themes
- Native dark mode with rich glassmorphism aesthetics and seamless system theme synchronization.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/kavinvishnu61-creator/qwengoaltracker01.git

# Navigate into project directory
cd qwengoaltracker01

# Install dependencies
npm install
```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking

Verify all TypeScript types:

```bash
npm run typecheck
```

### Running Tests

Execute the unit test suite with Vitest:

```bash
npm run test
```

### Production Build

Create an optimized, minified production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Architecture & Organization

```
d:/GOALTRACKER01
├── dist/                  # Compiled production assets
├── src/
│   ├── __tests__/         # Automated Vitest test suites
│   │   ├── dateUtils.test.ts
│   │   └── store.test.ts
│   ├── components/        # Reusable UI components
│   │   ├── CommandPalette.tsx  # Keyboard-driven command palette
│   │   └── Sidebar.tsx         # Main navigation sidebar & streak widget
│   ├── pages/             # View pages
│   │   ├── AnalyticsPage.tsx   # Visual charts & productivity heatmaps
│   │   ├── CalendarPage.tsx    # Monthly & daily calendar view
│   │   ├── FocusPage.tsx       # Pomodoro timer & session logging
│   │   ├── GoalDetailPage.tsx  # Milestones, sub-projects, and goal breakdown
│   │   ├── GoalsPage.tsx       # Goal list, filtering, and creation
│   │   ├── HabitsPage.tsx      # Habit tracking & consistency streaks
│   │   ├── HomePage.tsx        # Central executive summary dashboard
│   │   ├── LoginPage.tsx       # User authentication / onboarding screen
│   │   └── TodayPage.tsx       # Daily plan & execution workspace
│   ├── store/             # Central state management (Zustand)
│   │   └── index.ts            # Persistent application store & business logic
│   ├── types/             # TypeScript interfaces and domain types
│   │   └── index.ts            # Data models for Goal, Task, Habit, Session, etc.
│   ├── utils/             # Shared utilities
│   │   └── date.ts             # Bulletproof date formatting & helpers
│   ├── App.tsx            # Root application router & layout container
│   ├── index.css          # Tailwind CSS design system tokens & animations
│   └── main.tsx           # Application entry point with React ErrorBoundary
├── index.html             # Base HTML template with instant theme resolver
├── package.json           # Project manifest, scripts, and dependencies
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.js         # Vite configuration (port 3000, React plugin, Tailwind)
```

---

## 🛠️ Technology Stack

- **Core Framework**: React 18
- **Language**: TypeScript 5.7
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand 5 with local storage persistence
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Date Manipulation**: date-fns
- **Unit Testing**: Vitest 5

---

## 📄 License

MIT © [Momentum Goal Tracker](https://github.com/kavinvishnu61-creator/qwengoaltracker01)
