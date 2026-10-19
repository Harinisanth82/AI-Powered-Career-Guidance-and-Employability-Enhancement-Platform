import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Career } from '../../types';
import {
  Compass,
  Search,
  Filter,
  ArrowRight,
  Code2,
  Briefcase,
  Layers,
  GraduationCap
} from 'lucide-react';

export const CareerCatalogPage: React.FC = () => {
  const { setSelectedCareerId, setActiveTab } = useApp();
  const [careers, setCareers] = useState<Career[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await api.getCareersCatalog();
        setCareers(data);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const tracks = ['All', ...Array.from(new Set(careers.map(c => c.track)))];

  const filteredCareers = careers.filter(c => {
    const matchSearch = c.career.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchTrack = selectedTrack === 'All' || c.track === selectedTrack;
    return matchSearch && matchTrack;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Comprehensive Career Catalog & Track Index
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore industry benchmark roles, competency requirements, tools, and learning paths.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {tracks.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTrack(t)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedTrack === t
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCareers.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-mono">{item.track}</span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {item.difficulty}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {item.career}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                {item.description}
              </p>

              {/* Core Required Skills */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                  Core Skills ({item.skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {item.skills.slice(0, 4).map((sk, idx) => (
                    <span key={sk} className="font-medium">
                      {sk}{idx < 3 && idx < item.skills.slice(0, 4).length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                  {item.skills.length > 4 && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      +{item.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedCareerId(item.id);
                  setActiveTab('career-detail');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                Inspect Architecture <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  api.updateProfile({ target_career: item.career });
                  setActiveTab('skill-gap');
                }}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              >
                Set Target Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Salary Disclosure Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 flex items-center justify-between">
        <span>
          <strong>Data Integrity Standard:</strong> Salary and compensation metrics require an official verified labor-market dataset to prevent speculative claims.
        </span>
        <button
          onClick={() => setActiveTab('insights')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0 ml-4"
        >
          View Empirical Dataset Trends
        </button>
      </div>
    </div>
  );
};
