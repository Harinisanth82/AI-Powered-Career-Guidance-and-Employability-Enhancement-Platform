import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { GapAnalysis } from '../../types';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const { profile, setActiveTab } = useApp();
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        setLoading(true);
        const data = await api.getGapAnalysis(profile?.target_career);
        setGapAnalysis(data);
      } catch (err) {
        console.error('Error fetching gap analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, [profile?.target_career]);

  if (loading || !gapAnalysis) {
    return <div className="text-xs text-slate-500 py-8">Analyzing skill benchmarks and prerequisites...</div>;
  }

  const est = gapAnalysis.estimated_preparation_time;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Target Role Benchmark Analysis</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Skill Gap Matrix: {profile?.target_career || gapAnalysis.target_career}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mathematical difference between industry prerequisite levels and candidate assessment proficiency.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shrink-0">
          <div>
            <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {gapAnalysis.skill_coverage_percentage}%
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Role Skill Coverage</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {est.total_readiness_hours}h
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Est. Prep Time</div>
          </div>
        </div>
      </div>

      {/* Estimated Preparation Time Breakdown */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Estimated Preparation Time Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formulated as: Total Hours = Structured Learning + Guided Capstone Projects + Applied Practice.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ~{est.estimated_weeks_part_time} wks (15h/wk) · ~{est.estimated_weeks_full_time} wks (35h/wk)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500">Learning & Concept Hours</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {est.learning_hours} Hours
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Foundational coursework & documentation</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500">Capstone Project Hours</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {est.project_hours} Hours
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Code implementation & verification</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500">Applied Practice & Quizzes</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {est.practice_hours} Hours
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Refactoring, test coverage & mock drills</div>
          </div>
        </div>
      </div>

      {/* Tri-Column Gap Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* MASTERED */}
        <div className="p-5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Mastered Skills ({gapAnalysis.mastered_skills.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              Proficient
            </span>
          </div>

          {gapAnalysis.mastered_skills.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">No skills fully mastered yet.</div>
          ) : (
            <div className="space-y-3">
              {gapAnalysis.mastered_skills.map((s) => (
                <div key={s.skill_id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span>{s.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {s.current_level} / {s.target_level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Benchmark satisfied
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DEVELOPING */}
        <div className="p-5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-950">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Developing Skills ({gapAnalysis.developing_skills.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
              In Progress
            </span>
          </div>

          {gapAnalysis.developing_skills.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">No skills currently developing.</div>
          ) : (
            <div className="space-y-3">
              {gapAnalysis.developing_skills.map((s) => (
                <div key={s.skill_id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span>{s.name}</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {s.current_level} / {s.target_level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Deficit: {s.target_level - s.current_level} levels to target
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CRITICAL GAP */}
        <div className="p-5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Critical Gaps ({gapAnalysis.critical_gaps.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
              Immediate Need
            </span>
          </div>

          {gapAnalysis.critical_gaps.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">No critical skill gaps identified.</div>
          ) : (
            <div className="space-y-3">
              {gapAnalysis.critical_gaps.map((s) => (
                <div key={s.skill_id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span>{s.name}</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                      0 / {s.target_level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Prerequisites: {s.prerequisites.length > 0 ? s.prerequisites.join(', ') : 'None'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setActiveTab('learning-hub')}
          className="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
        >
          Explore Learning Hub Resources
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          View Phased Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
