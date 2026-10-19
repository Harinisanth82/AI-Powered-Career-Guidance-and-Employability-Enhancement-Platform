import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Target, ShieldCheck, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, employabilityIndex, darkMode, toggleDarkMode, activeTab, user, logout } = useApp();

  const tabLabels: Record<string, string> = {
    'landing': 'Platform Overview',
    'login': 'Candidate Sign In',
    'register': 'Candidate Registration',
    'dashboard': 'Platform Overview',
    'assessment': 'Multi-Dimensional Assessment',
    'careers': 'Career Catalog & Tracks',
    'career-detail': 'Career Architecture Analysis',
    'career-comparison': 'Cross-Role Comparison Matrix',
    'skill-gap': 'Skill Gap Analysis & Benchmark',
    'roadmap': 'Milestone-Based Learning Roadmap',
    'learning-hub': 'Curated Resource Hub',
    'projects': 'Recommended Project Studio',
    'proofs': 'Proof of Skills Verification',
    'online-test': 'Adaptive Online Test Generator',
    'interview-prep': 'Interview Question Repository',
    'interview-simulation': 'AI Mock Interview Simulation',
    'interviews': 'Mock Interview NLP Arena',
    'resume': 'Resume NLP Extraction',
    'employability': 'Employability Readiness Model',
    'timeline': 'Candidate Progress Timeline',
    'insights': 'Empirical Career Insights',
    'admin-training': 'Admin ML Model Training Studio'
  };

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            AI-Powered Career Guidance Framework
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {tabLabels[activeTab] || 'Platform Overview'}
          </h2>
        </div>
      </div>

      {/* Target Role & Readiness Indicators & Actions */}
      <div className="flex items-center gap-4">
        {profile && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-500 dark:text-slate-400">Target Role:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {profile.target_career}
            </span>
          </div>
        )}

        {employabilityIndex && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400">Readiness:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {employabilityIndex.score}/100
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {employabilityIndex.category}
            </span>
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-tight">
                {user?.name || profile?.name || 'Alex Mercer'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {user?.role || 'Candidate'}
              </div>
            </div>
          </div>

          {/* Visible Logout Button (Section 16) */}
          <button
            onClick={logout}
            title="Log Out of Platform"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
