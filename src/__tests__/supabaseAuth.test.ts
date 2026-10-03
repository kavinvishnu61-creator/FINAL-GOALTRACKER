import { describe, it, expect } from 'vitest';
import { supabase } from '../utils/supabase';

describe('Supabase Auth API', () => {
  it('has working auth methods', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
  });
});
