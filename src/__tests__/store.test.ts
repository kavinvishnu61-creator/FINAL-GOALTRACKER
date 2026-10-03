import { describe, it, expect } from 'vitest';
import { useStore } from '../store';

describe('Store functionality', () => {
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
});
