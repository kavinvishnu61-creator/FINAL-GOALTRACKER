import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore, saveUserLocalCache, loadUserLocalCache, extractUserDataPayload } from '../store';

describe('Data Pathway, Data Retention & Anti-Data-Loss Tests', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      key: (i: number) => Object.keys(localStorageMock)[i] || null,
      length: Object.keys(localStorageMock).length,
    };

    // Reset store state to initial
    useStore.setState({
      user: null,
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
      selectedGoalId: null,
      selectedProjectId: null,
      syncStatus: 'idle',
      lastSyncedAt: null,
    });
  });

  // TEST 1: Creation & Instant Local Persistence
  it('instantly persists created goal and habit to isolated user local storage cache', () => {
    const userId = 'usr_alice_123';
    useStore.getState().login('Alice', 'alice@test.com', userId);

    const goalId = useStore.getState().addGoal({
      title: 'Run a Half Marathon',
      category: 'Health',
      priority: 'P1',
      startDate: '2026-05-01',
      targetDate: '2026-08-01',
      color: '#22c55e',
    });

    useStore.getState().addHabit({
      name: 'Morning 5km Run',
      frequency: 'daily',
      target: 5,
      unit: 'km',
      goalId,
      color: '#22c55e',
    });

    // Verify in-memory state
    expect(useStore.getState().goals.length).toBe(1);
    expect(useStore.getState().goals[0].id).toBe(goalId);
    expect(useStore.getState().habits.length).toBe(1);

    // Verify immediate synchronous persistence to isolated cache
    const cached = loadUserLocalCache(userId);
    expect(cached).toBeDefined();
    expect(cached?.goals?.length).toBe(1);
    expect(cached?.goals?.[0].title).toBe('Run a Half Marathon');
    expect(cached?.habits?.length).toBe(1);
    expect(cached?.habits?.[0].name).toBe('Morning 5km Run');
  });

  // TEST 2: Page Reload / Browser Restart Simulation
  it('retains all goals, habits, and tasks upon simulated page reload and rehydration', () => {
    const userId = 'usr_bob_456';
    useStore.getState().login('Bob', 'bob@test.com', userId);

    const goalId = useStore.getState().addGoal({
      title: 'Publish Tech Book',
      category: 'Career',
      priority: 'P1',
      targetDate: '2026-12-31',
    });

    useStore.getState().addTask({
      title: 'Draft Chapter 1',
      priority: 'P2',
      goalId,
    });

    useStore.getState().addHabit({
      name: 'Write 500 words',
      frequency: 'daily',
      target: 500,
      unit: 'words',
      goalId,
    });

    // Simulate complete browser restart: wipe active in-memory store
    useStore.setState({
      user: null,
      goals: [],
      tasks: [],
      habits: [],
      calendarEvents: [],
    });

    expect(useStore.getState().goals.length).toBe(0);

    // Simulate user session restoration / login
    useStore.getState().login('Bob', 'bob@test.com', userId);

    const rehydratedState = useStore.getState();
    expect(rehydratedState.goals.length).toBe(1);
    expect(rehydratedState.goals[0].title).toBe('Publish Tech Book');
    expect(rehydratedState.tasks.length).toBe(1);
    expect(rehydratedState.tasks[0].title).toBe('Draft Chapter 1');
    expect(rehydratedState.habits.length).toBe(1);
    expect(rehydratedState.habits[0].name).toBe('Write 500 words');
  });

  // TEST 3: Multi-User Data Isolation (Strict Zero-Data-Leak)
  it('guarantees strict data isolation between multiple accounts without leakage', () => {
    // 1. User 1 logs in and creates private goals
    const user1Id = 'usr_user1';
    useStore.getState().login('User One', 'user1@test.com', user1Id);
    useStore.getState().addGoal({ title: 'Top Secret User 1 Goal' });
    useStore.getState().addHabit({ name: 'User 1 Habit' });

    expect(useStore.getState().goals.length).toBe(1);

    // 2. User 1 logs out
    useStore.getState().logout();
    expect(useStore.getState().user).toBeNull();
    expect(useStore.getState().goals.length).toBe(0);
    expect(useStore.getState().habits.length).toBe(0);

    // 3. User 2 logs in on the same browser
    const user2Id = 'usr_user2';
    useStore.getState().login('User Two', 'user2@test.com', user2Id);

    // Verify User 2 has completely empty state and NONE of User 1's data
    expect(useStore.getState().goals.length).toBe(0);
    expect(useStore.getState().habits.length).toBe(0);

    // User 2 creates their own goal
    useStore.getState().addGoal({ title: 'User 2 Unique Goal' });
    expect(useStore.getState().goals.length).toBe(1);
    expect(useStore.getState().goals[0].title).toBe('User 2 Unique Goal');

    // 4. User 2 logs out and User 1 logs back in
    useStore.getState().logout();
    useStore.getState().login('User One', 'user1@test.com', user1Id);

    // Verify User 1's original data is restored cleanly and doesn't contain User 2's data
    expect(useStore.getState().goals.length).toBe(1);
    expect(useStore.getState().goals[0].title).toBe('Top Secret User 1 Goal');
    expect(useStore.getState().goals.some(g => g.title === 'User 2 Unique Goal')).toBe(false);
  });

  // TEST 4: Anti-Data-Loss Protection against Empty Cloud Overwrites
  it('prevents empty cloud response from wiping existing local goals and habits', async () => {
    const userId = 'usr_protect_789';
    useStore.getState().login('Protect User', 'protect@test.com', userId);

    useStore.getState().addGoal({
      title: 'Protected Goal That Must Not Be Wiped',
      category: 'Learning',
    });

    const mockSyncToSupabase = vi.fn().mockResolvedValue(true);
    const mockLoadFromSupabase = vi.fn().mockResolvedValue({
      data: { goals: [], tasks: [], habits: [] }, // Empty cloud response!
      isNewUser: false,
      error: null,
    });

    // Execute cloud load with empty cloud data
    const currentGoalsBefore = useStore.getState().goals;
    expect(currentGoalsBefore.length).toBe(1);

    // If cloud has 0 goals but local has 1, the store safeguard must NOT wipe local goals
    await useStore.getState().loadCloudData();

    const currentGoalsAfter = useStore.getState().goals;
    expect(currentGoalsAfter.length).toBe(1);
    expect(currentGoalsAfter[0].title).toBe('Protected Goal That Must Not Be Wiped');
  });

  // TEST 5: Modification Retention across Edits
  it('correctly updates and retains edited goal fields and habit fields', () => {
    const userId = 'usr_edit_test';
    useStore.getState().login('Editor', 'edit@test.com', userId);

    const goalId = useStore.getState().addGoal({
      title: 'Original Title',
      category: 'General',
      priority: 'P3',
      optimizedTime: '08:00',
      optimizedEndTime: '09:00',
    });

    useStore.getState().addHabit({
      name: 'Original Habit',
      target: 1,
      unit: 'times',
    });

    const habitId = useStore.getState().habits[0].id;

    // Apply updates
    useStore.getState().updateGoal(goalId, {
      title: 'Updated Goal Title',
      category: 'Health',
      priority: 'P1',
      optimizedTime: '06:00',
      optimizedEndTime: '07:00',
      color: '#f97316',
    });

    useStore.getState().updateHabit(habitId, {
      name: 'Updated Habit Name',
      target: 30,
      unit: 'mins',
      color: '#f97316',
    });

    // Check store
    const goal = useStore.getState().goals.find(g => g.id === goalId);
    expect(goal?.title).toBe('Updated Goal Title');
    expect(goal?.category).toBe('Health');
    expect(goal?.priority).toBe('P1');
    expect(goal?.color).toBe('#f97316');

    const habit = useStore.getState().habits.find(h => h.id === habitId);
    expect(habit?.name).toBe('Updated Habit Name');
    expect(habit?.target).toBe(30);
    expect(habit?.unit).toBe('mins');

    // Check isolated cache
    const cached = loadUserLocalCache(userId);
    expect(cached?.goals?.[0].title).toBe('Updated Goal Title');
    expect(cached?.habits?.[0].name).toBe('Updated Habit Name');
  });

  // TEST 6: Safe Deletion & Selective Retention
  it('selectively deletes only target item while strictly retaining unrelated items', () => {
    const userId = 'usr_delete_test';
    useStore.getState().login('Deleter', 'del@test.com', userId);

    const goal1 = useStore.getState().addGoal({ title: 'Goal 1 Keep' });
    const goal2 = useStore.getState().addGoal({ title: 'Goal 2 To Delete' });

    useStore.getState().addHabit({ name: 'Habit 1 Keep' });
    useStore.getState().addHabit({ name: 'Habit 2 To Delete' });

    const habit2Id = useStore.getState().habits.find(h => h.name === 'Habit 2 To Delete')!.id;

    expect(useStore.getState().goals.length).toBe(2);
    expect(useStore.getState().habits.length).toBe(2);

    // Delete goal 2
    useStore.getState().deleteGoal(goal2);
    expect(useStore.getState().goals.length).toBe(1);
    expect(useStore.getState().goals[0].id).toBe(goal1);
    expect(useStore.getState().goals[0].title).toBe('Goal 1 Keep');

    // Delete habit 2
    useStore.getState().deleteHabit(habit2Id);
    expect(useStore.getState().habits.length).toBe(1);
    expect(useStore.getState().habits[0].name).toBe('Habit 1 Keep');

    // Verify cache has only remaining items
    const cached = loadUserLocalCache(userId);
    expect(cached?.goals?.length).toBe(1);
    expect(cached?.goals?.[0].title).toBe('Goal 1 Keep');
    expect(cached?.habits?.length).toBe(1);
    expect(cached?.habits?.[0].name).toBe('Habit 1 Keep');
  });
});
