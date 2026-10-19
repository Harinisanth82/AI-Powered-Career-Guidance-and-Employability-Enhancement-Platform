import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Career, GapAnalysis } from '../../types';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CareerComparisonPage: React.FC = () => {
  const { profile, setSelectedCareerId, setActiveTab } = useApp();
  const [catalog, setCatalog] = useState<Career[]>([]);
  const [careerAId, setCareerAId] = useState<string>('full-stack-developer');
  const [careerBId, setCareerBId] = useState<string>('backend-developer');
  const [compA, setCompA] = useState<{ career: Career; gap_analysis: GapAnalysis } | null>(null);
  const [compB, setCompB] = useState<{ career: Career; gap_analysis: GapAnalysis } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const list = await api.getCareersCatalog();
        setCatalog(list);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    const fetchComparisons = async () => {
      try {
        setLoading(true);
        const [resA, resB] = await Promise.all([
          api.compareCareer(careerAId),
          api.compareCareer(careerBId)
        ]);
        setCompA(resA);
        setCompB(resB);
      } catch (err) {
        console.error('Error comparing careers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparisons();
  }, [careerAId, careerBId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Career Architecture Comparison Matrix
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compare prerequisite skills, current readiness percentages, gap distributions, and preparation time between multiple industry tracks.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300 block">
            Select Track A:
          </label>
          <select
            value={careerAId}
            onChange={(e) => setCareerAId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.career} ({c.track})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300 block">
            Select Track B:
          </label>
          <select
            value={careerBId}
            onChange={(e) => setCareerBId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.career} ({c.track})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {compA && compB && !loading && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <th className="p-4 font-semibold text-slate-400 uppercase text-[11px] w-1/4">Metric / Dimension</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-sm w-[37.5%]">
                  {compA.career.career}
                </th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-sm w-[37.5%]">
                  {compB.career.career}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-4 font-semibold text-slate-500">Industry Domain</td>
                <td className="p-4 font-mono">{compA.career.track}</td>
                <td className="p-4 font-mono">{compB.career.track}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Candidate Skill Match</td>
                <td className="p-4">
                  <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                    {compA.gap_analysis.skill_coverage_percentage}%
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                    {compB.gap_analysis.skill_coverage_percentage}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Mastered Skills</td>
                <td className="p-4">
                  <span className="font-mono font-semibold text-emerald-600">
                    {compA.gap_analysis.mastered_skills.length} skills verified
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-mono font-semibold text-emerald-600">
                    {compB.gap_analysis.mastered_skills.length} skills verified
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Critical Skill Gaps</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {compA.gap_analysis.critical_gaps.map((g) => (
                      <span key={g.skill_id} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px]">
                        {g.name}
                      </span>
                    ))}
                    {compA.gap_analysis.critical_gaps.length === 0 && <span className="text-slate-400">None</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {compB.gap_analysis.critical_gaps.map((g) => (
                      <span key={g.skill_id} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px]">
                        {g.name}
                      </span>
                    ))}
                    {compB.gap_analysis.critical_gaps.length === 0 && <span className="text-slate-400">None</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Est. Preparation Time</td>
                <td className="p-4 font-mono">
                  <strong>{compA.gap_analysis.estimated_preparation_time.total_readiness_hours} Hours</strong> (~{compA.gap_analysis.estimated_preparation_time.estimated_weeks_part_time} wks)
                </td>
                <td className="p-4 font-mono">
                  <strong>{compB.gap_analysis.estimated_preparation_time.total_readiness_hours} Hours</strong> (~{compB.gap_analysis.estimated_preparation_time.estimated_weeks_part_time} wks)
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Signature Capstones</td>
                <td className="p-4 text-[11px]">
                  {compA.career.projects.join(' · ')}
                </td>
                <td className="p-4 text-[11px]">
                  {compB.career.projects.join(' · ')}
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Target Role Action</td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      api.updateProfile({ target_career: compA.career.career });
                      setActiveTab('skill-gap');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                  >
                    Select as Target Role
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      api.updateProfile({ target_career: compB.career.career });
                      setActiveTab('skill-gap');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                  >
                    Select as Target Role
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
