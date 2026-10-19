import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ResumeAnalysisPage: React.FC = () => {
  const { profile, showToast, setActiveTab, refreshData } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [applyingSkills, setApplyingSkills] = useState(false);
  const [skillsApplied, setSkillsApplied] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload a PDF document.', 'error');
        return;
      }
      setFile(selected);
      setAnalysis(null);
      setSkillsApplied(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a PDF resume file first.', 'error');
      return;
    }

    try {
      setAnalyzing(true);
      const res = await api.analyzeResume(file, profile?.target_career || 'Full Stack Developer');
      setAnalysis(res);
      setSkillsApplied(false);
      showToast('Resume analyzed via Python NLP & regex entity extractor!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze resume', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySkills = async () => {
    if (!analysis?.matched_career_skills || analysis.matched_career_skills.length === 0) return;
    try {
      setApplyingSkills(true);
      const skillsToSync = analysis.matched_career_skills.map((s: any) => s.skill);
      await api.applyResumeSkills(skillsToSync);
      setSkillsApplied(true);
      await refreshData();
      showToast(`Synced ${skillsToSync.length} verified skills to candidate profile!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to sync skills', 'error');
    } finally {
      setApplyingSkills(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          PDF Resume NLP Extraction & Benchmark Matcher
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Evaluates resume PDFs using PyMuPDF and Python regex entity extraction to benchmark candidate competencies against industry prerequisites.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <label className="cursor-pointer font-semibold text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            <span>{file ? file.name : 'Choose a PDF resume file'}</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-400 mt-1">
            Accepts standard PDF formatted resumes up to 10MB
          </p>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={analyzing}
            className="py-2 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {analyzing ? 'Extracting Entities via PyMuPDF...' : 'Analyze Resume'}
            <FileCheck2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overview Score Card */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">
                Target Role Benchmark
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {analysis.target_career}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Parsed {analysis.detected_skills_count} verified domain skills from {analysis.filename}.
              </p>
            </div>

            <div className="flex items-center gap-6 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shrink-0">
              <div>
                <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {analysis.skill_coverage_percentage}%
                </div>
                <div className="text-[11px] text-slate-500">Skill Coverage</div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {analysis.matched_career_skills.length} / {analysis.matched_career_skills.length + analysis.missing_career_skills.length}
                </div>
                <div className="text-[11px] text-slate-500">Benchmark Skills</div>
              </div>
            </div>
          </div>

          {/* Sync Detected Skills to Profile Banner (Section 48) */}
          {analysis.matched_career_skills && analysis.matched_career_skills.length > 0 && (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {skillsApplied ? '✓ Skills Synced with Candidate Profile' : 'Sync Detected Skills with Candidate Profile?'}
                </div>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                  {skillsApplied
                    ? `Successfully integrated verified skills into your profile. Skill gaps and employability metrics are up to date.`
                    : `Resume detected ${analysis.matched_career_skills.length} matching skills (${analysis.matched_career_skills.map((s: any) => s.skill).slice(0, 4).join(', ')}${analysis.matched_career_skills.length > 4 ? '...' : ''}). Apply them to update your Skill Gap Matrix & Employability Index.`}
                </p>
              </div>
              <button
                onClick={handleApplySkills}
                disabled={applyingSkills || skillsApplied}
                className={`py-2 px-4 rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors ${
                  skillsApplied
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {applyingSkills ? 'Syncing...' : skillsApplied ? 'Profile Synced' : 'Sync to Profile'}
              </button>
            </div>
          )}

          {/* Skill Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matched Skills */}
            <div className="p-5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Detected Target Skills ({analysis.matched_career_skills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matched_career_skills.map((s: any) => (
                  <span
                    key={s.skill}
                    className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                  >
                    ✓ {s.skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100 dark:border-rose-950">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Missing Prerequisite Skills ({analysis.missing_career_skills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_career_skills.map((s: any) => (
                  <span
                    key={s.skill}
                    className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium text-[11px]"
                  >
                    ✗ {s.skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Extracted Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Extracted Education</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                {analysis.extracted_education.map((e: string, i: number) => (
                  <div key={i} className="line-clamp-2">• {e}</div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Certifications & Credentials</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                {analysis.extracted_certifications.length > 0 ? (
                  analysis.extracted_certifications.map((c: string, i: number) => (
                    <div key={i} className="line-clamp-2">• {c}</div>
                  ))
                ) : (
                  <div className="text-slate-400">None detected in text.</div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Experience Summary</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                {analysis.extracted_experience}
              </div>
            </div>
          </div>

          {/* Multi-Career Match Comparison */}
          {analysis.career_benchmark_rankings && (
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Comparative Match Across Other Tracks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.career_benchmark_rankings.map((c: any) => (
                  <div
                    key={c.career}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.career}</div>
                      <div className="text-[11px] text-slate-400">{c.matched_count} of {c.total_required} skills</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {c.coverage_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
