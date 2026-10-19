import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  InterviewSimulationTurn,
  FinalInterviewReport
} from '../../types';
import {
  Video,
  Send,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Sparkles,
  ArrowRight,
  Brain,
  MessageSquare
} from 'lucide-react';

export const InterviewSimulationPage: React.FC = () => {
  const { profile, refreshData, showToast, lastInterviewReport, setLastInterviewReport } = useApp();

  // Setup state
  const [career, setCareer] = useState(profile?.target_career || 'Full Stack Developer');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(3);
  const [starting, setStarting] = useState(false);

  // Active Simulation state
  const [inSimulation, setInSimulation] = useState(false);
  const [turns, setTurns] = useState<InterviewSimulationTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluatingTurn, setEvaluatingTurn] = useState(false);
  const [report, setReport] = useState<FinalInterviewReport | null>(lastInterviewReport);

  const handleStartSimulation = async () => {
    try {
      setStarting(true);
      const res = await api.generateDynamicInterviewQuestions({
        career,
        interviewType,
        difficulty,
        skills: profile?.skills ? Object.keys(profile.skills) : ['JavaScript', 'React', 'Node.js', 'SQL'],
        count: questionCount
      });

      if (!res.questions || res.questions.length === 0) {
        throw new Error('Failed to generate interview simulation questions.');
      }

      const initialTurns: InterviewSimulationTurn[] = res.questions.map((q: any, i: number) => ({
        id: `turn-${i + 1}`,
        question: q.question,
        category: q.category || interviewType,
        userAnswer: '',
        evaluated: false
      }));

      setTurns(initialTurns);
      setCurrentTurnIndex(0);
      setCurrentAnswer('');
      setReport(null);
      setInSimulation(true);
      showToast(`Interview simulation started (${initialTurns.length} questions)!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error initializing interview simulation', 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleEvaluateTurn = async () => {
    const current = turns[currentTurnIndex];
    if (!current || !currentAnswer.trim()) {
      showToast('Please type your response before submitting.', 'error');
      return;
    }

    try {
      setEvaluatingTurn(true);

      // 1. Deterministic NLP scoring from Python AI backend
      const nlpResult = await api.evaluateInterviewAnswer(current.id, currentAnswer);

      // 2. Qualitative feedback coaching from LLM service
      let qualitativeFeedback: any = {
        what_you_did_well: ["Addressed key concepts directly"],
        what_was_missing: ["Detailed architecture trade-offs"],
        what_to_improve: ["Incorporate explicit metrics and system constraints"],
        suggested_better_approach: "Structure with: High-level overview -> Mechanics -> Trade-offs."
      };

      try {
        qualitativeFeedback = await api.evaluateInterviewFeedback({
          question: current.question,
          userAnswer: currentAnswer,
          category: current.category,
          career
        });
      } catch (e) {
        console.warn('Qualitative LLM evaluation fallback used:', e);
      }

      const updatedTurn: InterviewSimulationTurn = {
        ...current,
        userAnswer: currentAnswer,
        evaluated: true,
        scores: {
          technical: nlpResult.technical_score,
          relevance: nlpResult.relevance_score,
          communication: nlpResult.communication_score,
          structure: nlpResult.structure_score,
          overall: nlpResult.overall_score
        },
        feedback: qualitativeFeedback
      };

      const nextTurns = [...turns];
      nextTurns[currentTurnIndex] = updatedTurn;
      setTurns(nextTurns);

      showToast(`Answer evaluated! Overall score: ${nlpResult.overall_score}/100.`, 'success');

      // Check if finished or advance to next question
      if (currentTurnIndex < turns.length - 1) {
        setCurrentTurnIndex(prev => prev + 1);
        setCurrentAnswer('');
      } else {
        // Complete Simulation
        generateFinalReport(nextTurns);
      }
    } catch (err: any) {
      showToast(err.message || 'Error evaluating interview turn', 'error');
    } finally {
      setEvaluatingTurn(false);
    }
  };

  const generateFinalReport = async (completedTurns: InterviewSimulationTurn[]) => {
    const turnCount = completedTurns.length || 1;
    const avgTech = Math.round(completedTurns.reduce((acc, t) => acc + (t.scores?.technical || 65), 0) / turnCount);
    const avgRel = Math.round(completedTurns.reduce((acc, t) => acc + (t.scores?.relevance || 65), 0) / turnCount);
    const avgComm = Math.round(completedTurns.reduce((acc, t) => acc + (t.scores?.communication || 65), 0) / turnCount);
    const avgStruct = Math.round(completedTurns.reduce((acc, t) => acc + (t.scores?.structure || 65), 0) / turnCount);
    const avgOverall = Math.round(completedTurns.reduce((acc, t) => acc + (t.scores?.overall || 65), 0) / turnCount);

    const finalRep: FinalInterviewReport = {
      sessionId: `sim-${Date.now()}`,
      career,
      interviewType,
      difficulty,
      totalQuestions: turnCount,
      averageScores: {
        technical: avgTech,
        relevance: avgRel,
        communication: avgComm,
        structure: avgStruct,
        overall: avgOverall
      },
      verdict: avgOverall >= 80 ? 'Highly Recommended' : avgOverall >= 65 ? 'Qualified Candidate' : 'Developing Preparation',
      readinessContribution: Math.round(avgOverall * 0.15),
      keyStrengths: [
        "Consistent technical concept recognition",
        "Clear professional communication style"
      ],
      priorityImprovements: [
        "Include more concrete numerical results in STAR behavioral examples",
        "Elaborate on distributed systems resilience and edge-case failure modes"
      ],
      turns: completedTurns
    };

    setReport(finalRep);
    setLastInterviewReport(finalRep);
    setInSimulation(false);

    try {
      await api.saveInterviewSession(finalRep);
    } catch (e) {
      console.warn('Interview session local backup active:', e);
    }

    await refreshData();
    showToast('Interview simulation concluded! Final scorecard generated.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <Video className="w-4 h-4" />
          <span>Interactive Simulation &amp; Real-time AI Coaching</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          AI Mock Interview Simulation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Simulate a real-world multi-stage interview. Each answer is scored by local NLP concept coverage + STAR behavioral checks with qualitative coaching feedback.
        </p>
      </div>

      {/* Setup Form */}
      {!inSimulation && !report && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Interview Simulation Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Role
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
                Interview Category
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="Technical">Technical Deep Dive</option>
                <option value="Behavioral">Behavioral &amp; Leadership (STAR)</option>
                <option value="HR">HR &amp; Cultural Alignment</option>
                <option value="Mixed">Mixed Rounds</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Interview Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="Beginner">Entry Level / Junior</option>
                <option value="Intermediate">Mid-Level / Core Competency</option>
                <option value="Advanced">Senior / Lead Architect</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Number of Interview Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium font-mono"
              >
                <option value={2}>2 Questions (Brief Practice)</option>
                <option value={3}>3 Questions (Standard Simulation)</option>
                <option value={5}>5 Questions (Comprehensive Mock Interview)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartSimulation}
              disabled={starting}
              className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {starting ? 'Generating Custom Interview...' : 'Start AI Simulation'}
              <Play className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Turn Screen */}
      {inSimulation && turns[currentTurnIndex] && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-400">
                Question {currentTurnIndex + 1} of {turns.length}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {career} · {turns[currentTurnIndex].category}
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono">
              In Progress
            </span>
          </div>

          {/* AI Question Prompt */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Interviewer Question:</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
              {turns[currentTurnIndex].question}
            </p>
          </div>

          {/* Answer Area */}
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Candidate Response:
            </label>
            <textarea
              rows={6}
              placeholder="Structure your answer clearly. Explain trade-offs or use the STAR method for behavioral questions..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 leading-relaxed placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-slate-400">
              Word Count: {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>

            <button
              onClick={handleEvaluateTurn}
              disabled={evaluatingTurn || !currentAnswer.trim()}
              className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {evaluatingTurn ? 'Evaluating with Hybrid NLP & LLM...' : 'Submit Response & Continue'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Final Interview Report */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Final Interview Scorecard: {report.career}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {report.averageScores.overall}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  (Overall Competency)
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                  · {report.verdict}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setReport(null);
                setInSimulation(false);
              }}
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Start New Simulation
            </button>
          </div>

          {/* Average Rubric Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-slate-400 text-[11px]">Technical Knowledge</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {report.averageScores.technical}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-slate-400 text-[11px]">Topic Relevance</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {report.averageScores.relevance}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-slate-400 text-[11px]">Communication</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {report.averageScores.communication}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-slate-400 text-[11px]">STAR Structure</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {report.averageScores.structure}%
              </div>
            </div>
          </div>

          {/* Question Turns Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Turn-by-Turn Evaluations
            </h4>

            {report.turns.map((turn, idx) => (
              <div
                key={turn.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-500">
                    Question {idx + 1} ({turn.category})
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Score: {turn.scores?.overall}%
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {turn.question}
                </p>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Your Submitted Answer:</span>
                  {turn.userAnswer}
                </div>

                {/* Qualitative Feedback */}
                {turn.feedback && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] block">
                        What You Did Well:
                      </span>
                      {turn.feedback.what_you_did_well.map((item, i) => (
                        <div key={i} className="text-slate-600 dark:text-slate-400 flex items-start gap-1">
                          <span>✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 text-[11px] block">
                        Areas to Improve:
                      </span>
                      {turn.feedback.what_to_improve.map((item, i) => (
                        <div key={i} className="text-slate-600 dark:text-slate-400 flex items-start gap-1">
                          <span>•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
