import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Client Connection', () => {
  it('connects to Supabase endpoint and checks tables', async () => {
    const supabaseUrl = 'https://incbvivyzfhcbnqrzzrx.supabase.co';
    const supabaseKey = 'sb_publishable_qecgdJVZv0CS0OXZdFICDQ_8IYhlN-S';
    const client = createClient(supabaseUrl, supabaseKey);
    
    const res = await client.from('user_sync').select('*').limit(1);
    console.log('Supabase query result:', res);
    expect(res).toBeDefined();
  });

  it('tests syncToSupabase and loadFromSupabase functions', async () => {
    const { syncToSupabase, loadFromSupabase } = await import('../utils/supabase');
    const testUserId = 'test_usr_' + Math.random().toString(36).substring(7);
    const payload = {
      goals: [{ id: 'g1', title: 'Test Goal 123' }],
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
      theme: 'dark',
    };
    const syncRes = await syncToSupabase(testUserId, payload);
    console.log('syncRes:', syncRes);
    const loadRes = await loadFromSupabase(testUserId);
    console.log('loadRes:', JSON.stringify(loadRes));
  });
});
