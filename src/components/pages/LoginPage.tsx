import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogIn, ArrowRight, Lock, Mail, ShieldCheck, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setActiveTab, darkMode, toggleDarkMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('candidate@example.com');
    setPassword('demo1234');
    try {
      setLoading(true);
      await login('candidate@example.com', 'demo1234');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            CG
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Career Guidance Framework
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Employability Engine</p>
          </div>
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Login Form */}
      <div className="max-w-md w-full mx-auto px-6 py-12">
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Candidate Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your personalized roadmap, mock interviews, and readiness gauge.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <LogIn className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Quick Demo Login (Alex Mercer · Candidate)
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <button
              onClick={() => setActiveTab('register')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/80 dark:border-slate-800">
        AI-Powered Career Guidance and Employability Enhancement Platform · 2026
      </footer>
    </div>
  );
};
