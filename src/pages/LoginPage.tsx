import React, { useState } from 'react';
import { useStore } from '../store';
import { Target, ArrowRight, Lock, Mail, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { signUpWithEmail, signInWithEmail } from '../utils/supabase';

export function LoginPage() {
  const { login } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please fill in your email and password');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up with Supabase
        const displayName = name.trim() || cleanEmail.split('@')[0];
        const { data, error } = await signUpWithEmail(displayName, cleanEmail, password);

        if (error) {
          const errLower = error.message.toLowerCase();
          // If rate limit reached or user already registered, attempt direct sign in
          if (errLower.includes('rate limit') || errLower.includes('already registered')) {
            const signInRes = await signInWithEmail(cleanEmail, password);
            if (!signInRes.error && signInRes.data?.user) {
              const userId = signInRes.data.user.id;
              login(displayName, cleanEmail, userId);
              return;
            }
            if (errLower.includes('rate limit')) {
              setErrorMessage(
                "Supabase email confirmation rate limit reached (3/hr). In Supabase Dashboard -> Authentication -> Providers -> Email, turn OFF 'Confirm email', or try the Sign In tab!"
              );
              setLoading(false);
              return;
            }
          }

          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        // If Supabase created user
        const userId = data?.user?.id || `user_${cleanEmail}`;
        login(displayName, cleanEmail, userId);
      } else {
        // Sign In with Supabase
        const { data, error } = await signInWithEmail(cleanEmail, password);

        if (error) {
          const errLower = (error.message || '').toLowerCase();
          if (errLower.includes('email not confirmed')) {
            setErrorMessage(
              "Please turn OFF 'Confirm email' in Supabase: Dashboard -> Authentication -> Providers -> Email -> uncheck 'Confirm email'."
            );
            setLoading(false);
            return;
          }
          setErrorMessage(error.message || 'Invalid email or password');
          setLoading(false);
          return;
        }

        const displayName =
          data?.user?.user_metadata?.name || cleanEmail.split('@')[0];
        const userId = data?.user?.id || `user_${cleanEmail}`;
        login(displayName, cleanEmail, userId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    login('Guest User', 'guest@momentum.demo', 'guest_demo_user');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fb] dark:bg-[#0f1117] px-4 sm:px-6">
      <div className="w-full max-w-md bg-white dark:bg-[#13151d] rounded-2xl shadow-xl border border-[#e5e7eb] dark:border-[#1e2030] overflow-hidden flex flex-col">
        {/* Header section with gradient */}
        <div className="pt-8 pb-5 px-8 flex flex-col items-center text-center bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-500/5 dark:to-[#13151d]">
          <div className="w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">
            Momentum
          </h1>
          <p className="text-[13px] text-[#6b7280] dark:text-[#9ca3af] mt-1 font-medium">
            Personal Goal Execution System
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1 mt-5 p-1 bg-[#f3f4f6] dark:bg-[#1a1d2e] rounded-xl w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${!isSignUp
                  ? 'bg-white dark:bg-[#252836] text-[#111827] dark:text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111827] dark:hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${isSignUp
                  ? 'bg-white dark:bg-[#252836] text-[#111827] dark:text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111827] dark:hover:text-white'
                }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-3 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              {infoMessage}
            </div>
          )}

          <div className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#f9fafb] dark:bg-[#1a1d2e] border border-[#d1d5db] dark:border-[#2d3044] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-[#111827] dark:text-white placeholder:text-[#9ca3af]"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#f9fafb] dark:bg-[#1a1d2e] border border-[#d1d5db] dark:border-[#2d3044] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-[#111827] dark:text-white placeholder:text-[#9ca3af]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#f9fafb] dark:bg-[#1a1d2e] border border-[#d1d5db] dark:border-[#2d3044] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-[#111827] dark:text-white placeholder:text-[#9ca3af]"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isSignUp ? (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign In <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#e5e7eb] dark:border-[#1e2030]" />
              <span className="flex-shrink mx-3 text-[11px] text-[#9ca3af] uppercase font-medium">
                Or
              </span>
              <div className="flex-grow border-t border-[#e5e7eb] dark:border-[#1e2030]" />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-[#4b5563] dark:text-[#9ca3af] hover:text-[#111827] dark:hover:text-white hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d2e] rounded-xl transition-all border border-[#e5e7eb] dark:border-[#2d3044]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Explore as Guest (Instant Demo)
            </button>
          </div>
        </form>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
    </div>
  );
}
