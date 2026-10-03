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
});
