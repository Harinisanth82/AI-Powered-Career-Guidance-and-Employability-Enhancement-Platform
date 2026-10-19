import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CareerRecommendation } from '../../types';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Brain,
  Code2,
  Users,
  Target
} from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const { profile, refreshData, showToast, setActiveTab, setSelectedCareerId } = useApp();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    top_career: string;
    recommendations: CareerRecommendation[];
    model_used: string;
    model_accuracy: number;
  } | null>(null);

  // Form states
  const [techRatings, setTechRatings] = useState({
    javascript: profile?.skills?.javascript || 7,
    react: profile?.skills?.react || 7,
    nodejs: profile?.skills?.nodejs || 6,
    sql: profile?.skills?.sql || 7,
    mongodb: profile?.skills?.mongodb || 6,
    python: profile?.skills?.python || 5,
    java: profile?.skills?.java || 5,
    c: 4,
    cpp: 4,
    machine_learning: profile?.skills?.machine_learning || 4,
    data_science: 4,
    linux: profile?.skills?.linux || 6,
    docker: profile?.skills?.docker || 5,
    network_security: 4,
    figma_ui: 5
  });

  const [cognitiveRatings, setCognitiveRatings] = useState({
    problem_solving: 8,
    communication: 8,
    leadership: 7
  });

  const [academicData, setAcademicData] = useState({
    cgpa: profile?.cgpa || 8.4,
    certifications: profile?.certifications_count || 2,
    internship_experience: 1,
    project_experience: 3,
    interest: profile?.interests || 'Web Development',
    preferred_domain: 'Technology',
    work_style: profile?.work_style || 'Collaborative Teamwork',
    career_values: profile?.career_values || 'Continuous Learning & Growth'
  });

  const handleTechChange = (key: string, val: number) => {
    setTechRatings(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const submission = {
        ...techRatings,
        ...cognitiveRatings,
        ...academicData
      };
      const res = await api.submitAssessment(submission);
      setResults(res);
      await refreshData();
      showToast(`Assessment processed by ${res.model_used}. Top match: ${res.top_career}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error processing assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Multi-Dimensional Career Assessment
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Evaluates candidate attributes across technical proficiency, cognitive logic, and values to predict optimal career tracks using our custom machine-learning model.
        </p>
      </div>

      {/* Progress Steps */}
      {!results && (
        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          {[
            { num: 1, label: 'Technical Proficiency', icon: Code2 },
            { num: 2, label: 'Cognitive & Work Style', icon: Brain },
            { num: 3, label: 'Academic & Career Values', icon: Target }
          ].map((s) => {
            const Icon = s.icon;
            const isCurrent = step === s.num;
            const isCompleted = step > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Form Content */}
      {!results ? (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-6">
          {/* STEP 1: Technical Proficiency */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Step 1: Technical Proficiency Rating (1 - 10)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rate your current practical hands-on capability across foundational languages, frameworks, and system tools.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'javascript', label: 'JavaScript' },
                  { key: 'react', label: 'React' },
                  { key: 'nodejs', label: 'Node.js & Express' },
                  { key: 'sql', label: 'SQL & RDBMS' },
                  { key: 'mongodb', label: 'MongoDB' },
                  { key: 'python', label: 'Python' },
                  { key: 'java', label: 'Java' },
                  { key: 'cpp', label: 'C++' },
                  { key: 'machine_learning', label: 'Machine Learning' },
                  { key: 'linux', label: 'Linux & Terminal' },
                  { key: 'docker', label: 'Docker' },
                  { key: 'figma_ui', label: 'UI/UX & Figma' }
                ].map((item) => {
                  const val = (techRatings as any)[item.key] || 5;
                  return (
                    <div key={item.key} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                        <span>{item.label}</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{val}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={val}
                        onChange={(e) => handleTechChange(item.key, parseInt(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  Continue to Cognitive Skills <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Cognitive & Work Style */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Step 2: Cognitive & Collaborative Dimensions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assess your problem-solving approaches, teamwork style, and communication preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'problem_solving', label: 'Problem Solving & Algorithmic Logic' },
                  { key: 'communication', label: 'Technical & Verbal Communication' },
                  { key: 'leadership', label: 'Ownership & Initiative' }
                ].map((item) => {
                  const val = (cognitiveRatings as any)[item.key] || 7;
                  return (
                    <div key={item.key} className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        <span>{item.label}</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{val}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={val}
                        onChange={(e) => setCognitiveRatings(prev => ({ ...prev, [item.key]: parseInt(e.target.value) }))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Primary Work Style Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Collaborative Teamwork',
                    'Autonomous Deep Work',
                    'Cross-Functional Leadership'
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setAcademicData(prev => ({ ...prev, work_style: style }))}
                      className={`p-3 rounded-lg border text-xs font-medium text-left transition-colors ${
                        academicData.work_style === style
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  Continue to Academic & Values <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Academic & Career Values */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Step 3: Background & Career Aspirations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide background details and technical interest domain to feed the recommendation engine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Undergraduate CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="6.0"
                    max="10.0"
                    value={academicData.cgpa}
                    onChange={(e) => setAcademicData(prev => ({ ...prev, cgpa: parseFloat(e.target.value) }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Relevant Technical Certifications Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={academicData.certifications}
                    onChange={(e) => setAcademicData(prev => ({ ...prev, certifications: parseInt(e.target.value) }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Primary Domain Interest
                  </label>
                  <select
                    value={academicData.interest}
                    onChange={(e) => setAcademicData(prev => ({ ...prev, interest: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Enterprise Java">Enterprise Java</option>
                    <option value="Backend Architecture">Backend Architecture</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Software Engineering">Software Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Preferred Industry Sector
                  </label>
                  <select
                    value={academicData.preferred_domain}
                    onChange={(e) => setAcademicData(prev => ({ ...prev, preferred_domain: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="Technology">Technology & SaaS</option>
                    <option value="Finance">Finance & Fintech</option>
                    <option value="Healthcare">Healthcare & Biotech</option>
                    <option value="E-Commerce">E-Commerce & Retail</option>
                    <option value="Enterprise Software">Enterprise Software</option>
                    <option value="Consulting">Consulting & Strategy</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Inferring with ML Model...' : 'Submit & Infer Career Matches'}
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Custom Machine Learning Inference Complete</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Top Recommended Career: {results.top_career}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Trained Model: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{results.model_used}</span> · Model Accuracy: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{results.model_accuracy}%</span>
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Ranked Career Recommendations
            </h4>

            {results.recommendations.map((rec, idx) => (
              <div
                key={rec.career}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {rec.career}
                      </h5>
                      <div className="text-xs text-slate-500 font-mono">{rec.track}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {rec.score}%
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{rec.confidence_tier} Confidence</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {rec.description}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                      Data-Driven Reasons
                    </div>
                    <ul className="space-y-1">
                      {rec.explanation.key_reasons.map((r, i) => (
                        <li key={i} className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                      Areas to Advance
                    </div>
                    <ul className="space-y-1">
                      {rec.explanation.areas_to_improve.map((r, i) => (
                        <li key={i} className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedCareerId(rec.career.toLowerCase().replace(/ /g, '-'));
                      setActiveTab('career-detail');
                    }}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    View Career Architecture
                  </button>
                  <button
                    onClick={() => {
                      api.updateProfile({ target_career: rec.career });
                      setActiveTab('skill-gap');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    Set as Target Career & View Gaps
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setResults(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              ← Edit & Re-Evaluate Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
