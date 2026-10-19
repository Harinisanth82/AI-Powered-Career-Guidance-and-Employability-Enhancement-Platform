import {
  Career,
  CandidateProfile,
  CareerRecommendation,
  GapAnalysis,
  Milestone,
  LearningResource,
  RecommendedProject,
  SkillProof,
  InterviewQuestion,
  InterviewEvaluation,
  EmployabilityIndexData,
  TimelineEvent,
  DatasetAnalysis,
  ModelMetrics,
  CandidateInsight
} from '../types';

const BASE_URL = '/api';

function getAuthHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth Endpoints
  async register(name: string, email: string, password: string, target_career?: string): Promise<{ token: string; user: any; message?: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, target_career })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.detail || 'Registration failed. Please try again.');
    }
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: any; message?: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.detail || 'Invalid email or password.');
    }
    return data;
  },

  async getMe(): Promise<{ user: any }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Session expired or unauthorized');
    return res.json();
  },

  // Profile & Assessment
  async getProfile(): Promise<CandidateProfile> {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch candidate profile');
    return res.json();
  },

  async updateProfile(profile: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to update candidate profile');
    return res.json();
  },

  async submitAssessment(data: any): Promise<{
    status: string;
    top_career: string;
    recommendations: CareerRecommendation[];
    model_used: string;
    model_accuracy: number;
  }> {
    const res = await fetch(`${BASE_URL}/assessment/submit`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  // Careers
  async getCareersCatalog(): Promise<Career[]> {
    const res = await fetch(`${BASE_URL}/careers/catalog`);
    if (!res.ok) throw new Error('Failed to fetch careers catalog');
    return res.json();
  },

  async getCareerDetail(id: string): Promise<Career> {
    const res = await fetch(`${BASE_URL}/careers/catalog/${id}`);
    if (!res.ok) throw new Error('Failed to fetch career detail');
    return res.json();
  },

  async compareCareer(id: string): Promise<{
    career: Career;
    gap_analysis: GapAnalysis;
    candidate_skills: Record<string, number>;
  }> {
    const res = await fetch(`${BASE_URL}/careers/catalog/${id}/compare`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to compare career');
    return res.json();
  },

  async getGapAnalysis(careerId?: string): Promise<GapAnalysis> {
    const url = careerId ? `${BASE_URL}/careers/gap-analysis?career_id=${encodeURIComponent(careerId)}` : `${BASE_URL}/careers/gap-analysis`;
    const res = await fetch(url, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch skill gap analysis');
    return res.json();
  },

  // Roadmap
  async getRoadmap(): Promise<Milestone[]> {
    const res = await fetch(`${BASE_URL}/roadmap`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch learning roadmap');
    return res.json();
  },

  async generateRoadmap(careerId?: string): Promise<Milestone[]> {
    const url = careerId ? `${BASE_URL}/roadmap/generate?career_id=${encodeURIComponent(careerId)}` : `${BASE_URL}/roadmap/generate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to generate roadmap');
    return res.json();
  },

  async updateMilestoneStatus(milestoneId: string, status: 'Pending' | 'In Progress' | 'Completed'): Promise<any> {
    const res = await fetch(`${BASE_URL}/roadmap/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update milestone status');
    return res.json();
  },

  // Learning Hub & Projects
  async getLearningResources(skill?: string, career?: string): Promise<LearningResource[]> {
    let url = `${BASE_URL}/learning/resources`;
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (career) params.append('career', career);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch learning resources');
    return res.json();
  },

  async getRecommendedProjects(career?: string): Promise<RecommendedProject[]> {
    const url = career ? `${BASE_URL}/projects/recommended?career=${encodeURIComponent(career)}` : `${BASE_URL}/projects/recommended`;
    const res = await fetch(url, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch recommended projects');
    return res.json();
  },

  // Skills & Proofs
  async getProofs(): Promise<SkillProof[]> {
    const res = await fetch(`${BASE_URL}/skills/proofs`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch proofs');
    return res.json();
  },

  async submitProof(data: {
    title: string;
    type: string;
    url: string;
    skills_demonstrated: string[];
    notes?: string;
  }): Promise<{ status: string; proof: SkillProof; message: string }> {
    const res = await fetch(`${BASE_URL}/skills/proofs`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(data)
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resData.detail || resData.message || 'Failed to verify proof');
    }
    return resData;
  },

  // Interviews
  async getInterviewSession(career?: string, category: string = 'All'): Promise<{
    career: string;
    category: string;
    questions_count: number;
    questions: InterviewQuestion[];
  }> {
    const res = await fetch(`${BASE_URL}/interviews/sessions`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({ career, category, limit: 6 })
    });
    if (!res.ok) throw new Error('Failed to create interview session');
    return res.json();
  },

  async evaluateInterviewAnswer(questionId: string, userAnswer: string): Promise<InterviewEvaluation> {
    const res = await fetch(`${BASE_URL}/interviews/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({ question_id: questionId, user_answer: userAnswer })
    });
    if (!res.ok) throw new Error('Failed to evaluate interview answer');
    return res.json();
  },

  async getInterviewHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/interviews/history`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch interview history');
    return res.json();
  },

  async saveInterviewSession(report: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/interviews/sessions/save`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(report)
    });
    if (!res.ok) throw new Error('Failed to save interview session');
    return res.json();
  },

  async saveOnlineTestResult(result: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/tests/results`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(result)
    });
    if (!res.ok) throw new Error('Failed to save test result');
    return res.json();
  },

  async getOnlineTestHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/tests/history`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch test history');
    return res.json();
  },

  // Resume Analysis
  async analyzeResume(file: File, targetCareer: string = 'Full Stack Developer'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_career', targetCareer);

    const headers: Record<string, string> = {};
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/resume/analyze`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to analyze resume' }));
      throw new Error(err.detail || 'Failed to analyze resume PDF');
    }
    return res.json();
  },

  async applyResumeSkills(skills: string[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/resume/apply-skills`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({ skills })
    });
    if (!res.ok) throw new Error('Failed to apply resume skills to profile');
    return res.json();
  },

  // Dashboard Aggregation
  async getDashboardSummary(): Promise<any> {
    const res = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  // Employability & Timeline
  async getEmployabilityIndex(): Promise<EmployabilityIndexData> {
    const res = await fetch(`${BASE_URL}/progress/employability`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch employability index');
    return res.json();
  },

  async getTimeline(): Promise<TimelineEvent[]> {
    const res = await fetch(`${BASE_URL}/progress/timeline`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch progress timeline');
    return res.json();
  },

  // Insights
  async getInsights(): Promise<{
    candidate_insights: CandidateInsight[];
    primary_focus_career: string;
    readiness_index: number;
    critical_gap_summary: string[];
  }> {
    const res = await fetch(`${BASE_URL}/insights`, {
      headers: getAuthHeaders('application/json')
    });
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  async getMarketInsights(): Promise<any> {
    const res = await fetch(`${BASE_URL}/market/insights`);
    if (!res.ok) throw new Error('Failed to fetch market insights');
    return res.json();
  },

  // Dataset & ML Model Training
  async getDatasetAnalysis(): Promise<DatasetAnalysis> {
    const res = await fetch(`${BASE_URL}/dataset/analysis`);
    if (!res.ok) throw new Error('Failed to fetch dataset analysis');
    return res.json();
  },

  async uploadDataset(file: File): Promise<DatasetAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/dataset/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload dataset' }));
      throw new Error(err.detail || 'Failed to upload dataset');
    }
    return res.json();
  },

  async trainModel(targetColumn: string = 'Career', filePath?: string): Promise<{
    status: string;
    message: string;
    metadata: ModelMetrics;
  }> {
    const res = await fetch(`${BASE_URL}/model/train`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({ target_column: targetColumn, file_path: filePath })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to train ML model' }));
      throw new Error(err.detail || 'Failed to train model');
    }
    return res.json();
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${BASE_URL}/model/metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },

  // LLM Endpoints
  async getLLMStatus(): Promise<{ available: boolean; model: string; provider: string; fallback_active: boolean }> {
    const res = await fetch(`${BASE_URL}/llm/status`);
    if (!res.ok) throw new Error('Failed to fetch LLM status');
    return res.json();
  },

  async generateOnlineTest(params: {
    career: string;
    topic: string;
    difficulty: string;
    count: number;
  }): Promise<{
    career: string;
    topic: string;
    difficulty: string;
    count: number;
    questions: any[];
    source: string;
  }> {
    const res = await fetch(`${BASE_URL}/llm/generate-test`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate online test' }));
      throw new Error(err.error || err.detail || 'Failed to generate test');
    }
    return res.json();
  },

  async generateDynamicInterviewQuestions(params: {
    career: string;
    interviewType: string;
    difficulty: string;
    skills?: string[];
    skillGaps?: string[];
    count: number;
  }): Promise<{
    career: string;
    interviewType: string;
    questions: any[];
    source: string;
  }> {
    const res = await fetch(`${BASE_URL}/llm/generate-interview-questions`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate interview questions' }));
      throw new Error(err.error || err.detail || 'Failed to generate interview questions');
    }
    return res.json();
  },

  async evaluateInterviewFeedback(params: {
    question: string;
    userAnswer: string;
    category?: string;
    career?: string;
  }): Promise<{
    what_you_did_well: string[];
    what_was_missing: string[];
    what_to_improve: string[];
    suggested_better_approach: string;
  }> {
    const res = await fetch(`${BASE_URL}/llm/evaluate-answer`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to evaluate interview answer' }));
      throw new Error(err.error || err.detail || 'Failed to evaluate answer');
    }
    return res.json();
  }
};
