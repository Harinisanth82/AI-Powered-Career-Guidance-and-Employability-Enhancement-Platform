/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { AssessmentPage } from './components/pages/AssessmentPage';
import { CareerCatalogPage } from './components/pages/CareerCatalogPage';
import { CareerDetailPage } from './components/pages/CareerDetailPage';
import { CareerComparisonPage } from './components/pages/CareerComparisonPage';
import { SkillGapPage } from './components/pages/SkillGapPage';
import { RoadmapPage } from './components/pages/RoadmapPage';
import { LearningHubPage } from './components/pages/LearningHubPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { ProofOfSkillsPage } from './components/pages/ProofOfSkillsPage';
import { OnlineTestPage } from './components/pages/OnlineTestPage';
import { InterviewSimulationPage } from './components/pages/InterviewSimulationPage';
import { InterviewArenaPage } from './components/pages/InterviewArenaPage';
import { ResumeAnalysisPage } from './components/pages/ResumeAnalysisPage';
import { EmployabilityPage } from './components/pages/EmployabilityPage';
import { TimelinePage } from './components/pages/TimelinePage';
import { InsightsPage } from './components/pages/InsightsPage';
import { AdminTrainingPage } from './components/pages/AdminTrainingPage';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated, toast } = useApp();

  // Public Full-Page Views for unauthenticated visitors
  if (!isAuthenticated) {
    if (activeTab === 'register') {
      return <RegisterPage />;
    }
    if (activeTab === 'login') {
      return <LoginPage />;
    }
    return <LandingPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'assessment':
        return <AssessmentPage />;
      case 'careers':
        return <CareerCatalogPage />;
      case 'career-detail':
        return <CareerDetailPage />;
      case 'career-comparison':
        return <CareerComparisonPage />;
      case 'skill-gap':
        return <SkillGapPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'learning-hub':
        return <LearningHubPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'proofs':
        return <ProofOfSkillsPage />;
      case 'online-test':
        return <OnlineTestPage />;
      case 'interview-simulation':
        return <InterviewSimulationPage />;
      case 'interviews':
        return <InterviewArenaPage />;
      case 'resume':
        return <ResumeAnalysisPage />;
      case 'employability':
        return <EmployabilityPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'insights':
        return <InsightsPage />;
      case 'admin-training':
        return <AdminTrainingPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-lg animate-in slide-in-from-bottom-5">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
