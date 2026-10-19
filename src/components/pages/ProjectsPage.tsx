import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { RecommendedProject } from '../../types';
import {
  FolderGit2,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Award
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { profile, setActiveTab } = useApp();
  const [projects, setProjects] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.getRecommendedProjects(profile?.target_career);
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [profile?.target_career]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Project Recommendation Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ranked portfolio projects tailored to close your specific target role capability gaps.
        </p>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj, idx) => (
          <div
            key={proj.id}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-slate-400">
                  {proj.difficulty} · ~{proj.estimated_hours}h
                </span>
                <div className="flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{proj.relevance_score}% Relevance</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {proj.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {proj.description}
              </p>

              {/* Skills Developed */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Skills Developed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.skills_developed.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Target Deliverables
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {proj.deliverables.map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveTab('proofs')}
                className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                Submit Project Proof <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
