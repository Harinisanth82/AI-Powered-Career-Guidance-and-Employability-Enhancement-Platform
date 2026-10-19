import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { TimelineEvent } from '../../types';
import {
  History,
  GraduationCap,
  Award,
  Video,
  Route,
  Cpu,
  FileText,
  Calendar
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await api.getTimeline();
        setTimeline(data);
      } catch (err) {
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assessment': return GraduationCap;
      case 'proof': return Award;
      case 'interview': return Video;
      case 'roadmap':
      case 'milestone_completed': return Route;
      case 'model_trained': return Cpu;
      case 'resume': return FileText;
      default: return History;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Candidate Progress Timeline
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chronological audit trail of assessments, verified proofs, milestone completions, and mock interview performance.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {timeline.map((event) => {
          const Icon = getEventIcon(event.type);
          return (
            <div key={event.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 flex items-center justify-center shrink-0 z-10" />

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {event.title}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {event.date}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
