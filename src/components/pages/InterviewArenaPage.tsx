import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { InterviewQuestion, InterviewEvaluation } from '../../types';
import {
  Video,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  BarChart2,
  RefreshCw
} from 'lucide-react';

export const InterviewArenaPage: React.FC = () => {
  const { profile, refreshData, showToast } = useApp();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [category, setCategory] = useState('All');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await api.getInterviewSession(profile?.target_career, category);
      setQuestions(res.questions);
      if (res.questions.length > 0) {
        setActiveQuestion(res.questions[0]);
      }
      setEvaluation(null);
      setUserAnswer('');
    } catch (err) {
      console.error('Error fetching interview questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [category, profile?.target_career]);

  const handleEvaluate = async () => {
    if (!activeQuestion || !userAnswer.trim()) {
      showToast('Please type your response before submitting.', 'error');
      return;
    }

    try {
      setEvaluating(true);
      const res = await api.evaluateInterviewAnswer(activeQuestion.id, userAnswer);
      setEvaluation(res);
      await refreshData();
      showToast(`Interview evaluated via NLP pipeline (${res.verdict})!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error evaluating interview answer', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mock Interview Arena & NLP Evaluation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic NLP scoring pipeline: TF-IDF cosine similarity, keyword coverage, and STAR structural analysis without generative hallucination.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          {['All', 'Technical', 'Behavioral', 'HR'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Question Picker */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Question Bank ({questions.length})
            </span>
            <button
              onClick={fetchSession}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title="Refresh Questions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => {
              const isSelected = activeQuestion?.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQuestion(q);
                    setEvaluation(null);
                    setUserAnswer('');
                  }}
                  className={`w-full p-3 rounded-lg border text-left text-xs transition-colors ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px] text-slate-400 font-mono">
                    <span>Q{idx + 1} · {q.category}</span>
                    <span>{q.difficulty}</span>
                  </div>
                  <div className="line-clamp-2 leading-relaxed">
                    {q.question}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Answer Studio & NLP Report */}
        <div className="lg:col-span-2 space-y-5">
          {/* Question Prompt */}
          {activeQuestion && (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  Track: {activeQuestion.career}
                </span>
                <span className="font-mono">{activeQuestion.category} · {activeQuestion.difficulty}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {activeQuestion.question}
              </h3>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Your Response (Technical Precision & Clear Articulation)
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide your in-depth answer here. For behavioral questions, follow the STAR (Situation, Task, Action, Result) method..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-sans placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Word Count: {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || !userAnswer.trim()}
                  className="py-2 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  {evaluating ? 'Running NLP Pipeline...' : 'Evaluate Answer'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Evaluation Report */}
          {evaluation && (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    NLP Evaluation Scorecard
                  </h4>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-slate-400">Overall:</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {evaluation.overall_score}/100
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                    ({evaluation.verdict})
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Technical Depth</div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                    {evaluation.technical_score}%
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Topic Relevance</div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                    {evaluation.relevance_score}%
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Communication</div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                    {evaluation.communication_score}%
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Structure / STAR</div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                    {evaluation.structure_score}%
                  </div>
                </div>
              </div>

              {/* Concept Coverage Analysis */}
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Matched Concepts ({evaluation.matched_concepts.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.matched_concepts.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                      >
                        ✓ {c}
                      </span>
                    ))}
                    {evaluation.matched_concepts.length === 0 && (
                      <span className="text-xs text-slate-400">No key reference concepts matched.</span>
                    )}
                  </div>
                </div>

                {evaluation.missing_concepts.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Unaddressed Benchmark Concepts ({evaluation.missing_concepts.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.missing_concepts.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium text-[11px]"
                        >
                          ✗ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actionable Feedback */}
              {evaluation.improvement_areas.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Actionable Improvement Recommendations
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {evaluation.improvement_areas.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
