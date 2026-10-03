import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://incbvivyzfhcbnqrzzrx.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qecgdJVZv0CS0OXZdFICDQ_8IYhlN-S';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserSyncPayload {
  goals: any[];
  milestones: any[];
  projects: any[];
  tasks: any[];
  habits: any[];
  habitCompletions: any[];
  focusSessions: any[];
  calendarEvents: any[];
  dailyReviews: any[];
  weeklyReviews: any[];
  activityLog: any[];
  theme: string;
}

/**
 * Saves user data payload to Supabase cloud
 */
export async function syncToSupabase(userId: string, data: UserSyncPayload): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from('user_sync')
      .upsert(
        {
          user_id: userId,
          data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      // Table may not yet be created or RLS error
      console.warn('[Supabase Sync Warning]:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Error]:', err);
    return false;
  }
}

/**
 * Loads user data payload from Supabase cloud
 */
export async function loadFromSupabase(userId: string): Promise<UserSyncPayload | null> {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_sync')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    return data.data as UserSyncPayload;
  } catch {
    return null;
  }
}
