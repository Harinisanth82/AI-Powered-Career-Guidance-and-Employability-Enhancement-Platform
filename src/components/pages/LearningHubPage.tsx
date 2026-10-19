import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LearningResource } from '../../types';
import {
  BookOpen,
  ExternalLink,
  Search,
  Clock,
  Filter,
  GraduationCap
} from 'lucide-react';

export const LearningHubPage: React.FC = () => {
  const { profile } = useApp();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await api.getLearningResources();
        setResources(data);
      } catch (err) {
        console.error('Error fetching learning resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const types = ['All', 'Documentation', 'Tutorial', 'Course', 'Exercise'];

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.skill.toLowerCase().includes(search.toLowerCase()) ||
      r.career.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === 'All' || r.type === selectedType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Curated Learning Resource Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-signal documentation, tutorials, courses, and labs indexed by prerequisite skills.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by skill or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === t
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-mono text-[11px]">{res.type}</span>
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {res.estimated_time}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                {res.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
                {res.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {res.skill.toUpperCase()}
                </span>
                <span className="text-slate-400 text-[11px]">{res.difficulty}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Open Official Source <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
