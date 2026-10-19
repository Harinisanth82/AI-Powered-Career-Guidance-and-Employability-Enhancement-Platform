import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { EmployabilityIndexData } from '../../types';
import {
  Gauge,
  ShieldCheck,
  Award,
  Route,
  Video,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const EmployabilityPage: React.FC = () => {
  const { profile, setActiveTab } = useApp();
  const [data, setData] = useState<EmployabilityIndexData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.getEmployabilityIndex();
        setData(res);
      } catch (err) {
        console.error('Error fetching employability index:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile?.target_career]);

  if (loading || !data) {
    return <div className="text-xs text-slate-500 py-8">Computing Employability Readiness Index...</div>;
  }

  const breakdown = data.breakdown;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Employability Readiness Index Model
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A transparent, mathematically weighted composite indicator evaluating candidate competence across 4 verified dimensions.
        </p>
      </div>

      {/* Main Score Hero */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Composite Readiness Score
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                {data.score}
              </span>
              <span className="text-base font-mono text-slate-400">/ 100</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-2">
                · {data.category} ({data.readiness_badge})
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6 text-xs text-slate-500">
            <div>Target Career Track:</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
              {data.target_career}
            </div>
          </div>
        </div>

        {/* Formula Representation */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
          Readiness = (0.35 × {breakdown.skill_mastery.score}%) + (0.25 × {breakdown.roadmap_completion.score}%) + (0.25 × {breakdown.proof_projects.score}%) + (0.15 × {breakdown.interview_performance.score}%)
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {data.recommendation}
        </p>
      </div>

      {/* 4 Pillars Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pillar 1: Core Skill Mastery (35%) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                1. Core Skill Mastery (35%)
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              +{breakdown.skill_mastery.contribution} pts
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Component Performance</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {breakdown.skill_mastery.score}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${breakdown.skill_mastery.score}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Calculated from candidate proficiency across essential prerequisite skills benchmarked against target career standards.
          </p>

          <button
            onClick={() => setActiveTab('skill-gap')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 pt-1"
          >
            Inspect Skill Gaps <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: Milestone Completion (25%) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                2. Roadmap Milestones (25%)
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              +{breakdown.roadmap_completion.contribution} pts
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Component Performance</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {breakdown.roadmap_completion.score}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${breakdown.roadmap_completion.score}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Reflects progress across topologically sequenced learning phases, tasks, and coursework objectives.
          </p>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 pt-1"
          >
            Continue Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: Proof of Skills & Projects (25%) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                3. Proofs & Artifacts (25%)
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              +{breakdown.proof_projects.contribution} pts
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Component Performance</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {breakdown.proof_projects.score}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${breakdown.proof_projects.score}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Grounded in verifiable GitHub repositories, live deployments, and credentials verified through deterministic structural checks.
          </p>

          <button
            onClick={() => setActiveTab('proofs')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 pt-1"
          >
            Submit Verified Proofs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 4: Mock Interview Performance (15%) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                4. Mock Interviews (15%)
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              +{breakdown.interview_performance.contribution} pts
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Component Performance</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {breakdown.interview_performance.score}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full"
              style={{ width: `${breakdown.interview_performance.score}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Derived from automated NLP evaluations measuring technical depth, topic relevance, communication fluency, and STAR structure.
          </p>

          <button
            onClick={() => setActiveTab('interviews')}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 pt-1"
          >
            Take Mock Interview <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transparent Disclaimer Notice */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Transparency Notice:</strong> The Employability Readiness Index is a system-generated preparation metric designed to highlight capability gaps and guide structured development. It represents measurable candidate qualifications and does not constitute a legal or contractual guarantee of employment.
        </p>
      </div>
    </div>
  );
};
