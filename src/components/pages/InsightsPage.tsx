import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { CandidateInsight } from '../../types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<CandidateInsight[]>([]);
  const [marketData, setMarketData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const [candRes, mktRes] = await Promise.all([
          api.getInsights(),
          api.getMarketInsights()
        ]);
        setInsights(candRes.candidate_insights);
        setMarketData(mktRes);
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Empirical Career & Employability Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Derived from candidate feature distributions, gap metrics, and mathematical models rather than LLM text generation.
        </p>
      </div>

      {/* Candidate-Specific Insights List */}
      <div className="space-y-4">
        {insights.map((ins, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {ins.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400">
                {ins.impact}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {ins.description}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                <strong>Recommended Action:</strong> {ins.action}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Labor-Market Dataset Status */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Database className="w-4 h-4 text-slate-500" />
          <span>Labor-Market Real-Time Data Status</span>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
          {marketData?.message || 'Market insights require an available labor-market dataset.'}
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          In compliance with our anti-fabrication guidelines, macro employment metrics, job vacancies, and wage distributions are only displayed when a structured dataset is supplied by administrators.
        </p>
      </div>
    </div>
  );
};
