import { createClient, User as SupabaseAuthUser } from '@supabase/supabase-js';

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
 * Sign up with Email and Password
 */
export async function signUpWithEmail(name: string, email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Sign out of Supabase
 */
export async function signOutAuth() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

/**
 * Get current session user if authenticated
 */
export async function getCurrentAuthUser(): Promise<SupabaseAuthUser | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
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
      console.warn('[Supabase Sync Warning]:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Error]:', err);
    return false;
  }
}

export interface CloudLoadResult {
  data: UserSyncPayload | null;
  isNewUser: boolean;
  error?: string | null;
}

/**
 * Loads user data payload from Supabase cloud
 */
export async function loadFromSupabase(userId: string): Promise<CloudLoadResult> {
  if (!userId) return { data: null, isNewUser: true, error: null };
  try {
    const { data, error } = await supabase
      .from('user_sync')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Load Warning]:', error.message);
      return { data: null, isNewUser: false, error: error.message };
    }

    if (!data || !data.data) {
      return { data: null, isNewUser: true, error: null };
    }

    return { data: data.data as UserSyncPayload, isNewUser: false, error: null };
  } catch (err: any) {
    console.warn('[Supabase Load Error]:', err);
    return { data: null, isNewUser: false, error: err?.message || 'Network error' };
  }
}

