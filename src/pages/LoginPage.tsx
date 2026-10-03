import React, { useState } from 'react';
import { useStore } from '../store';
import { Target, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { login } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name, email || 'user@example.com');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fb] dark:bg-[#0f1117] px-4 sm:px-6">
      <div className="w-full max-w-md bg-white dark:bg-[#13151d] rounded-2xl shadow-xl border border-[#e5e7eb] dark:border-[#1e2030] overflow-hidden flex flex-col">
        {/* Header section with gradient */}
        <div className="pt-10 pb-6 px-8 flex flex-col items-center text-center bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-500/5 dark:to-[#13151d]">
          <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Welcome to Momentum</h1>
          <p className="text-[13px] text-[#6b7280] dark:text-[#9ca3af] mt-2 font-medium">
            Your personal goal execution system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-[#f9fafb] dark:bg-[#1a1d2e] border border-[#d1d5db] dark:border-[#2d3044] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-[#111827] dark:text-white placeholder:text-[#9ca3af] dark:placeholder:text-[#6b7280]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                Email <span className="text-[#9ca3af] dark:text-[#4b5563] font-normal lowercase">(Optional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-[#f9fafb] dark:bg-[#1a1d2e] border border-[#d1d5db] dark:border-[#2d3044] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-[#111827] dark:text-white placeholder:text-[#9ca3af] dark:placeholder:text-[#6b7280]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-3xl pointer-events-none" />
    </div>
  );
}
