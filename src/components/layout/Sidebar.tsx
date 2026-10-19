import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  FileSpreadsheet,
  Route,
  BookOpen,
  FolderGit2,
  Award,
  Video,
  FileText,
  Gauge,
  History,
  Sparkles,
  Cpu,
  GraduationCap,
  FileCheck2,
  Scale,
  LogOut,
  Bot
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout, user } = useApp();

  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'CAREER INTELLIGENCE',
      items: [
        { id: 'assessment', label: 'Career Assessment', icon: GraduationCap },
        { id: 'careers', label: 'Explore Careers', icon: Compass },
        { id: 'career-comparison', label: 'Career Comparison', icon: Scale },
        { id: 'skill-gap', label: 'Skill Gap Matrix', icon: FileSpreadsheet },
        { id: 'insights', label: 'Empirical Insights', icon: Sparkles }
      ]
    },
    {
      title: 'SKILL DEVELOPMENT',
      items: [
        { id: 'roadmap', label: 'Learning Roadmap', icon: Route },
        { id: 'learning-hub', label: 'Learning Hub', icon: BookOpen },
        { id: 'projects', label: 'Project Studio', icon: FolderGit2 },
        { id: 'proofs', label: 'Proof of Skills', icon: Award }
      ]
    },
    {
      title: 'AI ASSESSMENT & INTERVIEWS',
      items: [
        { id: 'online-test', label: 'Online Tests (LLM)', icon: FileCheck2 },
        { id: 'interview-simulation', label: 'AI Interview Simulation', icon: Bot },
        { id: 'interviews', label: 'Interview Question Arena', icon: Video },
        { id: 'resume', label: 'Resume ATS Analysis', icon: FileText }
      ]
    },
    {
      title: 'READINESS & ADMIN',
      items: [
        { id: 'employability', label: 'Employability Index', icon: Gauge },
        { id: 'timeline', label: 'Career Timeline', icon: History },
        { id: 'admin-training', label: 'AI Model Training', icon: Cpu }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200 dark:shadow-none">
          CG
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Career Guidance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Hybrid ML + LLM
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Engine Status & Logout Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Hybrid Architecture</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono">ML + LLM</span>
        </div>

        {/* Visible Logout Option (Section 16) */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors"
        >
          <span>Log Out</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
