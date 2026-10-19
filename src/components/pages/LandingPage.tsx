import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  FileSpreadsheet,
  Route,
  FileText,
  FileCheck2,
  Video,
  Gauge,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Brain,
  Target,
  Sun,
  Moon
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, darkMode, toggleDarkMode } = useApp();

  const features = [
    {
      title: 'ML Career Recommendation',
      desc: 'Custom-trained Random Forest and Logistic Regression models predict your top career matches with mathematical scores and feature-importance explanations.',
      icon: Compass,
      tag: 'Custom Scikit-Learn'
    },
    {
      title: 'Skill Gap Matrix',
      desc: 'Deterministic benchmark gap analysis dividing capabilities into Mastered, Developing, and Critical Gaps with hours-to-readiness calculations.',
      icon: FileSpreadsheet,
      tag: 'Deterministic Analytics'
    },
    {
      title: 'Personalized Roadmap',
      desc: 'Topologically sequenced learning phases ordered by prerequisite graphs, milestones, and hands-on deliverables without generative fluff.',
      icon: Route,
      tag: 'Structured Paths'
    },
    {
      title: 'Resume ATS NLP Parser',
      desc: 'Extracts programming skills, credentials, and experience from uploaded PDF resumes using PyMuPDF and regex entity matching.',
      icon: FileText,
      tag: 'Local PyMuPDF'
    },
    {
      title: 'Dynamic Online Tests',
      desc: 'Adaptive multiple-choice exams generated on demand across custom topics and difficulties, with deterministic scoring and topic analysis.',
      icon: FileCheck2,
      tag: 'API-Key LLM'
    },
    {
      title: 'AI Interview Simulation',
      desc: 'Realistic interactive mock interviews evaluated via TF-IDF cosine similarity, STAR behavioral rubrics, and qualitative LLM coaching.',
      icon: Video,
      tag: 'Hybrid NLP + LLM'
    },
    {
      title: 'Employability Index (0–100)',
      desc: 'A transparent, weighted mathematical indicator: 35% Skill Mastery + 25% Roadmap + 25% Proofs & Projects + 15% Interview Performance.',
      icon: Gauge,
      tag: 'Composite Index'
    },
    {
      title: 'Empirical Data Insights',
      desc: 'Real statistical distributions from dataset training records, benchmark CGPA distributions, and transparent market status disclosures.',
      icon: Sparkles,
      tag: 'Empirical Metrics'
    }
  ];

  const steps = [
    { num: '01', title: 'Build Your Profile', desc: 'Create your academic profile with education, CGPA, and career aspirations.' },
    { num: '02', title: 'Assess Your Skills', desc: 'Complete multi-dimensional ratings across 15+ technical tools and cognitive skills.' },
    { num: '03', title: 'Discover Suitable Careers', desc: 'Our trained ML classifier infers your top 3–5 role alignments with confidence scores.' },
    { num: '04', title: 'Identify Skill Gaps', desc: 'Pinpoint critical prerequisite deficits and estimated learning hours for your target track.' },
    { num: '05', title: 'Follow Learning Roadmap', desc: 'Advance through phased milestones, curated official docs, and capstone tasks.' },
    { num: '06', title: 'Practice Tests & Interviews', desc: 'Take timed topic tests and participate in turn-by-turn mock interview simulations.' },
    { num: '07', title: 'Track Employability Readiness', desc: 'Watch your 0–100 Employability Index grow toward certified job readiness.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            CG
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              AI Career Guidance Framework
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              Employability Development Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Cpu className="w-3.5 h-3.5" />
          <span>Hybrid Architecture: Custom Scikit-Learn ML + Python NLP + Dynamic LLM</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          AI-POWERED CAREER GUIDANCE &amp; EMPLOYABILITY ENHANCEMENT
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          An enterprise-grade employability engineering platform bridging academic coursework and industry job readiness. Discover personalized careers via trained ML, resolve prerequisite skill gaps, practice dynamic online tests and mock interviews, and verify hiring readiness through a transparent 0–100 index.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            Start Career Discovery <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
          >
            Candidate Sign In
          </button>
        </div>

        {/* Value Proof Strip */}
        <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200 dark:border-slate-800/80 mt-12">
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">11 Tracks</div>
            <div className="text-xs text-slate-500 mt-0.5">Software, Data, AI &amp; Cloud</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100% Real ML</div>
            <div className="text-xs text-slate-500 mt-0.5">Scikit-learn classification</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">Local NLP</div>
            <div className="text-xs text-slate-500 mt-0.5">PyMuPDF ATS &amp; TF-IDF</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">0–100 Gauge</div>
            <div className="text-xs text-slate-500 mt-0.5">Readiness Index Model</div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Comprehensive Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for Objective Career Acceleration
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Every feature divides cleanly into custom deterministic analytics and targeted generative AI, ensuring reliable, verifiable candidate growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (7 Steps) */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Methodology
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The 7-Step Employability Engineering Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A continuous loop from assessment to verified project delivery and mock interview fluency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((st) => (
            <div
              key={st.num}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2 relative"
            >
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                STEP {st.num}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {st.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}

          {/* Call to Action card as final step block */}
          <div className="p-5 rounded-xl border border-indigo-600/30 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                READY TO BEGIN
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Launch Your Career Path
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Take the comprehensive career assessment right now.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('register')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
            >
              Register Account
            </button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <div className="p-10 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-slate-900 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bridge the Gap to Industry Employment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Discover your strongest career alignments, tackle targeted skill gaps, and prove your capabilities with measurable evidence.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setActiveTab('register')}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Create Free Account
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
