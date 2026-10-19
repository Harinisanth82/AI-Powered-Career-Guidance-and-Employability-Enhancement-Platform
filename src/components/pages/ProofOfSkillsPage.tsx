import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SkillProof } from '../../types';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Plus,
  FolderGit2,
  Globe,
  FileCheck2
} from 'lucide-react';

export const ProofOfSkillsPage: React.FC = () => {
  const { refreshData, showToast } = useApp();
  const [proofs, setProofs] = useState<SkillProof[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('GitHub Repository');
  const [url, setUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [notes, setNotes] = useState('');

  const fetchProofs = async () => {
    try {
      const data = await api.getProofs();
      setProofs(data);
    } catch (err) {
      console.error('Error fetching proofs:', err);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      showToast('Please provide a title and URL for the proof artifact.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.submitProof({
        title,
        type,
        url,
        skills_demonstrated: skills.length > 0 ? skills : ['Full-Stack Implementation', 'Architecture'],
        notes
      });
      showToast(res.message, 'success');
      setTitle('');
      setUrl('');
      setSkillsInput('');
      setNotes('');
      await fetchProofs();
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Proof of Skills Verification System
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Submit verifiable artifacts (repositories, live deployments, credentials) evaluated through deterministic structural inspection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Plus className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Submit New Proof Artifact
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Artifact Title
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Task Queue Service"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Artifact Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="GitHub Repository">GitHub Repository</option>
                <option value="Live Deployment URL">Live Deployment URL</option>
                <option value="Technical Blog">Technical Blog / RFC</option>
                <option value="Certification">Accredited Certification</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Public URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Demonstrated Skills (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="React, TypeScript, Docker, PostgreSQL"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Verifying Artifact...' : 'Verify & Award Badge'}
            </button>
          </form>
        </div>

        {/* Verified Artifacts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Verified Candidate Evidence ({proofs.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Deterministic Inspection Standard
            </span>
          </div>

          {proofs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
              No proof artifacts submitted yet. Submit a GitHub repository or deployment link above.
            </div>
          ) : (
            <div className="space-y-3.5">
              {proofs.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {p.title}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {p.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {p.type} · Verified {p.date}
                      </div>
                    </div>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Link</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Skills verified */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.skills_verified.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Deterministic checks passed */}
                  {p.verification_checks && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px] text-slate-500">
                      {p.verification_checks.map((chk, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>{chk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
