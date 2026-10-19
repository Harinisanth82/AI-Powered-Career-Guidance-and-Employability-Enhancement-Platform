import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Milestone } from '../../types';
import {
  Route,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  FolderGit2,
  Play,
  RotateCcw
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { profile, refreshData, showToast } = useApp();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const data = await api.getRoadmap();
      setMilestones(data);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [profile?.target_career]);

  const handleStatusChange = async (milestoneId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      await api.updateMilestoneStatus(milestoneId, status);
      await fetchRoadmap();
      await refreshData();
      showToast(`Milestone status updated to ${status}!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const data = await api.generateRoadmap(profile?.target_career);
      setMilestones(data);
      await refreshData();
      showToast('Learning roadmap regenerated from skill prerequisites!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-8">Generating structured roadmap milestones...</div>;
  }

  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const progressPct = Math.round((completedCount / (milestones.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <Route className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Topological Learning Sequence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Personalized Learning Roadmap: {profile?.target_career}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ordered by skill dependency graph and gap criticality without generative hallucination.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {completedCount} / {milestones.length}
            </div>
            <div className="text-[11px] text-slate-400">Milestones Done ({progressPct}%)</div>
          </div>
          <button
            onClick={handleRegenerate}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Regenerate Roadmap"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phased Milestones List */}
      <div className="space-y-5">
        {milestones.map((m, idx) => {
          const isDone = m.status === 'Completed';
          const isInProgress = m.status === 'In Progress';

          return (
            <div
              key={m.id}
              className={`p-6 rounded-xl border transition-all ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : isInProgress
                  ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900/80 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {m.phase}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {m.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mr-2">
                    <Clock className="w-3.5 h-3.5" /> {m.estimated_hours}h
                  </span>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                    {(['Pending', 'In Progress', 'Completed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(m.id, st)}
                        className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                          m.status === st
                            ? st === 'Completed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'In Progress'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Objective */}
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                {m.objective}
              </p>

              {/* Skills and Prerequisites */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Target Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Prerequisites
                  </span>
                  <div className="text-slate-600 dark:text-slate-400">
                    {m.prerequisites.length > 0 ? m.prerequisites.join(', ') : 'Foundational Starting Point'}
                  </div>
                </div>
              </div>

              {/* Task Deliverable */}
              {m.task && (
                <div className="mt-4 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{m.task.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {m.task.description}
                  </p>
                </div>
              )}

              {/* Learning Resources */}
              {m.learning_resources && m.learning_resources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Curated Resources:
                  </span>
                  {m.learning_resources.map((res) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>{res.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
