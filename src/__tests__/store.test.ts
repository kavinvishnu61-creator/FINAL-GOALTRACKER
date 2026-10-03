import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Store functionality', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] || null,
      length: 0,
    };
  });

  it('initializes with default state', () => {
    const state = useStore.getState();
    expect(state).toBeDefined();
    expect(Array.isArray(state.goals)).toBe(true);
    expect(Array.isArray(state.tasks)).toBe(true);
    expect(Array.isArray(state.habits)).toBe(true);
  });

  it('can log in a user and log out', () => {
    useStore.getState().login('Test User', 'test@example.com');
    expect(useStore.getState().user?.name).toBe('Test User');
    useStore.getState().logout();
    expect(useStore.getState().user).toBeNull();
  });

  it('can add a goal and query streak and progress', () => {
    const id = useStore.getState().addGoal({
      title: 'Master React & Vite',
      status: 'active',
      progress: 50,
    });
    expect(id).toBeDefined();
    const progress = useStore.getState().getGoalProgress(id);
    expect(progress).toBe(50);
  });

  it('isolates data between different user accounts and does not leak previous user goals', () => {
    // 1. User A logs in and creates a goal
    useStore.getState().login('User A', 'usera@example.com', 'user_a_id');
    const goalAId = useStore.getState().addGoal({
      title: 'User A Secret Goal',
      status: 'active',
      progress: 25,
    });
    expect(useStore.getState().goals.some((g) => g.id === goalAId)).toBe(true);

    // 2. User A logs out
    useStore.getState().logout();
    expect(useStore.getState().user).toBeNull();
    expect(useStore.getState().goals.length).toBe(0);

    // 3. User B logs in with a different email
    useStore.getState().login('User B', 'userb@example.com', 'user_b_id');
    expect(useStore.getState().user?.email).toBe('userb@example.com');
    // Crucial check: User B MUST NOT have User A's goal!
    expect(useStore.getState().goals.length).toBe(0);
    expect(useStore.getState().goals.some((g) => g.id === goalAId)).toBe(false);

    // 4. User B logs out
    useStore.getState().logout();
    expect(useStore.getState().goals.length).toBe(0);

    // 5. User A logs back in
    useStore.getState().login('User A', 'usera@example.com', 'user_a_id');
    expect(useStore.getState().user?.email).toBe('usera@example.com');
    // Crucial check: User A's goal must be restored!
    expect(useStore.getState().goals.some((g) => g.id === goalAId)).toBe(true);
  });
});
