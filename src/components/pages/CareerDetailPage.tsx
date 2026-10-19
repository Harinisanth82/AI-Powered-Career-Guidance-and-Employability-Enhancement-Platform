import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Career, GapAnalysis } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  FolderGit2,
  Layers,
  Wrench,
  GraduationCap
} from 'lucide-react';

export const CareerDetailPage: React.FC = () => {
  const { selectedCareerId, setActiveTab, showToast } = useApp();
  const [career, setCareer] = useState<Career | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const careerId = selectedCareerId || 'full-stack-developer';
        const res = await api.compareCareer(careerId);
        setCareer(res.career);
        setGapAnalysis(res.gap_analysis);
      } catch (err) {
        console.error('Error fetching career detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [selectedCareerId]);

  if (loading || !career) {
    return <div className="text-xs text-slate-500 py-8">Loading career profile...</div>;
  }

  const handleSetTarget = async () => {
    try {
      await api.updateProfile({ target_career: career.career });
      showToast(`Target career updated to ${career.career}!`, 'success');
      setActiveTab('skill-gap');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link & actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('careers')}
          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Career Catalog
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSetTarget}
            className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Set as Target Career & Analyze Gaps
          </button>
        </div>
      </div>

      {/* Main Role Banner */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-medium">
            {career.track}
          </span>
          <span className="text-slate-400 font-mono">
            Complexity: {career.difficulty}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {career.career}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {career.description}
        </p>

        {gapAnalysis && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div>
              Current Skill Match: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{gapAnalysis.skill_coverage_percentage}%</strong>
            </div>
            <div>
              Mastered: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{gapAnalysis.mastered_skills.length}</strong>
            </div>
            <div>
              Critical Gaps: <strong className="font-mono text-rose-600 dark:text-rose-400">{gapAnalysis.critical_gaps.length}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Skills, Tools & Soft Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Technical Capabilities</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
            {career.skills.map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Standard Tooling</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
            {career.tools.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Relevant Backgrounds</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
            {career.education.map((e) => (
              <div key={e} className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{e}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Path Architecture */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Structured Learning Curriculum
        </h3>
        <div className="space-y-3">
          {career.learning_path.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature Projects */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Signature Capstone Deliverables
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {career.projects.map((proj) => (
            <div
              key={proj}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex items-center gap-2"
            >
              <FolderGit2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">{proj}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
