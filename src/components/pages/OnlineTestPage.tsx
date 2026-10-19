import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { OnlineTestQuestion, OnlineTestResult } from '../../types';
import {
  FileCheck2,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  BarChart2,
  Cpu,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const OnlineTestPage: React.FC = () => {
  const { profile, showToast, lastTestResult, setLastTestResult, llmStatus } = useApp();

  // Test setup states
  const [career, setCareer] = useState(profile?.target_career || 'Full Stack Developer');
  const [topic, setTopic] = useState('React Hooks & Component State');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  // Active test states
  const [inTest, setInTest] = useState(false);
  const [questions, setQuestions] = useState<OnlineTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 min default
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OnlineTestResult | null>(lastTestResult);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (inTest && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inTest, secondsLeft]);

  const handleStartTest = async () => {
    try {
      setGenerating(true);
      const res = await api.generateOnlineTest({
        career,
        topic,
        difficulty,
        count: questionCount
      });

      if (!res.questions || res.questions.length === 0) {
        throw new Error('No test questions were generated.');
      }

      setQuestions(res.questions);
      setAnswers({});
      setCurrentIndex(0);
      setSecondsLeft(questionCount * 60); // 1 minute per question
      setResult(null);
      setInTest(true);
      showToast(`Online test started with ${res.questions.length} questions!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate online test', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    const topicPerformance: Record<string, { correct: number; total: number; percentage: number }> = {};
    const weakList: string[] = [];

    questions.forEach((q) => {
      const userAns = answers[q.id];
      const isCorrect = userAns === q.correct_answer;
      if (isCorrect) correctCount++;

      if (!topicPerformance[q.topic]) {
        topicPerformance[q.topic] = { correct: 0, total: 0, percentage: 0 };
      }
      topicPerformance[q.topic].total += 1;
      if (isCorrect) topicPerformance[q.topic].correct += 1;
    });

    Object.entries(topicPerformance).forEach(([top, perf]) => {
      perf.percentage = Math.round((perf.correct / perf.total) * 100);
      if (perf.percentage < 60) {
        weakList.push(top);
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);

    const finalResult: OnlineTestResult = {
      testId: `test-${Date.now()}`,
      career,
      topic,
      difficulty,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      scorePercentage: scorePct,
      timeSpentSeconds: (questionCount * 60) - secondsLeft,
      topicWisePerformance: topicPerformance,
      weakAreas: weakList.length > 0 ? weakList : ['Advanced edge cases & timing conditions'],
      userAnswers: answers,
      questions
    };

    return finalResult;
  };

  const handleAutoSubmit = () => {
    showToast('Time expired! Submitting test automatically...', 'info');
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    setSubmitting(true);
    const finalResult = calculateScore();
    setResult(finalResult);
    setLastTestResult(finalResult);
    setInTest(false);

    try {
      await api.saveOnlineTestResult(finalResult);
    } catch (e) {
      console.warn('Test result local backup active:', e);
    } finally {
      setSubmitting(false);
    }

    showToast(`Test submitted! You scored ${finalResult.scorePercentage}% (${finalResult.correctAnswers}/${finalResult.totalQuestions}).`, 'success');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>LLM-Powered Skill Validation Engine</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Adaptive Online Technical Assessment
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate timed domain-specific tests powered by Gemini LLM with deterministic scoring, topic-wise breakdown, and zero hallucinated scores.
        </p>
      </div>

      {/* LLM Status Strip */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-600 dark:text-slate-300">Question Generation Engine:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {llmStatus?.model || 'gemini-3.8-flash'}
          </span>
        </div>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
          ● Engine Active
        </span>
      </div>

      {/* Mode 1: Test Setup Form */}
      {!inTest && !result && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Configure Your Online Test
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Career Track
              </label>
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assessment Topic
              </label>
              <input
                type="text"
                placeholder="e.g. React Hooks, Java Collections, SQL Joins"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="Beginner">Beginner (Foundational Syntax & Concepts)</option>
                <option value="Intermediate">Intermediate (Real-world Architecture & Patterns)</option>
                <option value="Advanced">Advanced (High-scale, Concurrency & Edge Cases)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium font-mono"
              >
                <option value={3}>3 Questions (Fast 3-min Check)</option>
                <option value={5}>5 Questions (Standard 5-min Quiz)</option>
                <option value={10}>10 Questions (Comprehensive 10-min Drill)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartTest}
              disabled={generating || !topic.trim()}
              className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {generating ? 'Generating Test with LLM...' : 'Generate & Start Test'}
              <Play className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Live Active Test Environment */}
      {inTest && questions.length > 0 && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          {/* Top Test Bar: Timer & Progress */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {career} · {topic}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs border border-amber-200 dark:border-amber-900/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsLeft)}</span>
              </div>
            </div>
          </div>

          {/* Current Question Display */}
          {questions[currentIndex] && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {questions[currentIndex].question}
              </p>

              {/* Options Radio List */}
              <div className="space-y-2.5 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText = questions[currentIndex].options[optKey];
                  const isSelected = answers[questions[currentIndex].id] === optKey;
                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(questions[currentIndex].id, optKey)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {optKey}
                      </span>
                      <span className="leading-relaxed">{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Navigator Dots & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isAnswered
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="py-1.5 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Submit & Score Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Test Result & Detailed Explanations */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Score Header Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Assessment Results: {result.topic}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {result.scorePercentage}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({result.correctAnswers} of {result.totalQuestions} correct)
                </span>
                <span className={`text-xs font-bold ml-2 ${
                  result.scorePercentage >= 70 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  · {result.scorePercentage >= 80 ? 'Proficient' : result.scorePercentage >= 60 ? 'Competent' : 'Needs Development'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setInTest(false);
                }}
                className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Take Another Assessment
              </button>
            </div>
          </div>

          {/* Detailed Question Explanations Review */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Question-by-Question Technical Review
            </h4>

            {result.questions.map((q, idx) => {
              const userAns = result.userAnswers[q.id];
              const isCorrect = userAns === q.correct_answer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border space-y-3 ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">
                      Q{idx + 1} · {q.topic}
                    </span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <div
                        key={opt}
                        className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                          opt === q.correct_answer
                            ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                            : opt === userAns && !isCorrect
                            ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                            : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="font-mono font-bold">{opt}:</span>
                        <span>{q.options[opt]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Technical Explanation */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
