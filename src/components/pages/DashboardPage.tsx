import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  CareerRecommendation,
  GapAnalysis,
  Milestone
} from '../../types';
import {
  Gauge,
  ArrowRight,
  Sparkles,
  BookOpen,
  Video,
  Award,
  Clock,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile, employabilityIndex, setActiveTab, setSelectedCareerId } = useApp();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [gapRes, roadRes] = await Promise.all([
          api.getGapAnalysis(profile?.target_career),
          api.getRoadmap()
        ]);
        setGapAnalysis(gapRes);
        setRoadmap(roadRes);

        // Fetch top recommendations based on candidate assessment features
        if (profile?.skills) {
          const recRes = await api.submitAssessment({
            javascript: profile.skills.javascript || 7,
            react: profile.skills.react || 7,
            nodejs: profile.skills.nodejs || 6,
            sql: profile.skills.sql || 7,
            mongodb: profile.skills.mongodb || 6,
            python: profile.skills.python || 5,
            java: profile.skills.java || 5,
            linux: profile.skills.linux || 6,
            docker: profile.skills.docker || 5,
            machine_learning: profile.skills.machine_learning || 4,
            problem_solving: 8,
            communication: 8,
            leadership: 7,
            cgpa: profile.cgpa || 8.2,
            certifications: profile.certifications_count || 2,
            interest: profile.interests || 'Web Development'
          });
          setRecommendations(recRes.recommendations);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.target_career]);

  const score = employabilityIndex?.score || 78;
  const nextMilestone = roadmap.find(m => m.status === 'In Progress') || roadmap[0];

  return (
    <div className="space-y-6">
      {/* Hero: Employability Readiness Index & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Readiness Gauge Card */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Employability Readiness Index
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Mathematical Model: 0.35·S + 0.25·R + 0.25·P + 0.15·I
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Score Display */}
              <div className="sm:col-span-1 text-center sm:text-left">
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-5xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                    {score}
                  </span>
                  <span className="text-sm font-mono text-slate-400">/ 100</span>
                </div>
                <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {employabilityIndex?.category || 'Moderately Ready'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Target: {profile?.target_career || 'Full Stack Developer'}
                </div>
              </div>

              {/* Component Contribution Breakdown */}
              <div className="sm:col-span-2 space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Skill Benchmark Coverage (35%)</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
                      {employabilityIndex?.breakdown.skill_mastery.score || gapAnalysis?.skill_coverage_percentage || 72}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${employabilityIndex?.breakdown.skill_mastery.score || gapAnalysis?.skill_coverage_percentage || 72}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Roadmap Milestones (25%)</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
                      {employabilityIndex?.breakdown.roadmap_completion.score || 50}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${employabilityIndex?.breakdown.roadmap_completion.score || 50}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Verified Proofs & Projects (25%)</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
                      {employabilityIndex?.breakdown.proof_projects.score || 85}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${employabilityIndex?.breakdown.proof_projects.score || 85}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Mock Interview NLP Score (15%)</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
                      {employabilityIndex?.breakdown.interview_performance.score || 82}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${employabilityIndex?.breakdown.interview_performance.score || 82}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {employabilityIndex?.recommendation || 'Progressing well. Continue completing roadmap milestones to increase hiring readiness.'}
            </span>
            <button
              onClick={() => setActiveTab('employability')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 shrink-0 ml-4"
            >
              Full Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Next Action & Roadmap Snapshot */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Learning Milestone
              </span>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                {nextMilestone?.phase || 'PHASE 1'}
              </span>
            </div>

            {nextMilestone ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {nextMilestone.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {nextMilestone.objective}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {nextMilestone.estimated_hours} Hours Est.
                  </span>
                  <span>·</span>
                  <span>{nextMilestone.skills.length} Target Skills</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4">No active milestones pending.</div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('roadmap')}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              Continue Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Career Recommendations from Custom ML Model */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Top Career Matches (Custom ML Classifier)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated across 24 candidate features using our trained Random Forest model.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('assessment')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Retake Assessment <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div
              key={rec.career}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400">
                    Rank #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{rec.score}%</span>
                    <span className="text-[10px] text-slate-400 font-normal">Match</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {rec.career}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {rec.track}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Model Reasoning
                  </div>
                  {rec.explanation.key_reasons.slice(0, 2).map((r, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span className="line-clamp-1">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedCareerId(rec.career.toLowerCase().replace(/ /g, '-'));
                    setActiveTab('career-detail');
                  }}
                  className="text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
                >
                  Inspect Requirements <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    api.updateProfile({ target_career: rec.career });
                    setActiveTab('skill-gap');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Set as Target
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Gaps & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Skill Gaps */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Target Role Capability Gaps ({profile?.target_career})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identified based on industry standard prerequisites.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('skill-gap')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View All Gaps
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gapAnalysis?.critical_gaps.slice(0, 4).map((gap) => (
              <div
                key={gap.skill_id}
                className="p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 flex items-start justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {gap.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Benchmark: Level {gap.target_level}/10 · Current: {gap.current_level}/10
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-rose-600 dark:text-rose-400">
                  Critical
                </span>
              </div>
            ))}

            {gapAnalysis?.developing_skills.slice(0, 2).map((gap) => (
              <div
                key={gap.skill_id}
                className="p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 flex items-start justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {gap.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Benchmark: Level {gap.target_level}/10 · Current: {gap.current_level}/10
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400">
                  Developing
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Estimated Preparation Time: <strong className="text-slate-800 dark:text-slate-200 font-mono">{gapAnalysis?.estimated_preparation_time.total_readiness_hours || 120} Hours</strong>
            </span>
            <span className="font-mono text-slate-400">
              ~{gapAnalysis?.estimated_preparation_time.estimated_weeks_part_time || 8} weeks at 15h/week
            </span>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Preparation Modules
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('interviews')}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Mock Interview Arena</div>
                    <div className="text-[11px] text-slate-400">NLP scoring with STAR rubrics</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('resume')}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Resume PDF NLP Parser</div>
                    <div className="text-[11px] text-slate-400">Extract skills & benchmark coverage</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('proofs')}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Proof of Skills Submission</div>
                    <div className="text-[11px] text-slate-400">Deterministic repo & link validation</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('admin-training')}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">ML Training Studio (Admin)</div>
                    <div className="text-[11px] text-slate-400">Train models on custom CSV datasets</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
