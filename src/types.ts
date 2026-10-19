export interface Career {
  id: string;
  career: string;
  track: string;
  description: string;
  skills: string[];
  soft_skills: string[];
  tools: string[];
  education: string[];
  projects: string[];
  difficulty: string;
  learning_path: string[];
}

export interface CandidateProfile {
  name: string;
  email: string;
  target_career: string;
  education_level: string;
  institution: string;
  cgpa: number;
  certifications_count: number;
  skills: Record<string, number>;
  interests: string;
  work_style: string;
  career_values: string;
}

export interface CareerRecommendation {
  career: string;
  score: number;
  confidence_tier: string;
  track: string;
  description: string;
  explanation: {
    key_reasons: string[];
    areas_to_improve: string[];
    influential_features: Array<{ feature: string; score: string }>;
  };
}

export interface SkillGapItem {
  skill_id: string;
  name: string;
  category: string;
  current_level: number;
  target_level: number;
  difficulty: string;
  prerequisites: string[];
  critical: boolean;
  description: string;
}

export interface GapAnalysis {
  target_career: string;
  skill_coverage_percentage: number;
  mastered_skills: SkillGapItem[];
  developing_skills: SkillGapItem[];
  critical_gaps: SkillGapItem[];
  estimated_preparation_time: {
    total_readiness_hours: number;
    learning_hours: number;
    project_hours: number;
    practice_hours: number;
    estimated_weeks_part_time: number;
    estimated_weeks_full_time: number;
  };
}

export interface Milestone {
  id: string;
  phase: string;
  title: string;
  objective: string;
  skills: string[];
  skill_ids: string[];
  prerequisites: string[];
  estimated_hours: number;
  learning_resources: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    estimated_time: string;
    description: string;
  }>;
  task: {
    title: string;
    description: string;
    deliverables: string[];
  };
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface LearningResource {
  id: string;
  title: string;
  skill: string;
  career: string;
  difficulty: string;
  type: string;
  url: string;
  estimated_time: string;
  description: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
  career: string;
  difficulty: string;
  estimated_hours: number;
  skills_developed: string[];
  description: string;
  deliverables: string[];
  relevance_score: number;
  gap_skills_addressed: string[];
  recommendation_reasons: string[];
}

export interface SkillProof {
  id: string;
  title: string;
  type: string;
  url: string;
  verified: boolean;
  badge: string;
  date: string;
  skills_verified: string[];
  verification_checks?: string[];
}

export interface InterviewQuestion {
  id: string;
  career: string;
  category: string;
  difficulty: string;
  question: string;
  reference_concepts: string[];
  sample_reference_answer: string;
  rubrics: Record<string, string>;
}

export interface InterviewEvaluation {
  question_id: string;
  overall_score: number;
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  structure_score: number;
  verdict: string;
  matched_concepts: string[];
  missing_concepts: string[];
  improvement_areas: string[];
  word_count: number;
}

export interface EmployabilityIndexData {
  score: number;
  category: 'Highly Ready' | 'Moderately Ready' | 'Developing' | 'Early Stage';
  readiness_badge: string;
  recommendation: string;
  target_career: string;
  breakdown: {
    skill_mastery: { weight: number; score: number; contribution: number };
    roadmap_completion: { weight: number; score: number; contribution: number };
    proof_projects: { weight: number; score: number; contribution: number };
    interview_performance: { weight: number; score: number; contribution: number };
  };
  metrics_summary: {
    mastered_skills_count: number;
    developing_skills_count: number;
    critical_gaps_count: number;
    completed_milestones: number;
    total_milestones: number;
    verified_proofs_count: number;
    completed_interviews_count: number;
  };
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface DatasetAnalysis {
  num_rows: number;
  num_columns: number;
  columns: string[];
  data_types: Record<string, string>;
  missing_counts: Record<string, number>;
  total_missing: number;
  duplicate_rows: number;
  unique_counts: Record<string, number>;
  sample_values: Record<string, string[]>;
  numerical_columns: string[];
  categorical_columns: string[];
  text_columns: string[];
  potential_targets: Array<{
    column: string;
    unique_classes: number;
    confidence: string;
    is_keyword_match: boolean;
  }>;
  class_distributions: Record<string, Record<string, number>>;
  suggested_mapping: Record<string, string>;
  is_supervised_ready: boolean;
  file_name?: string;
  file_path?: string;
}

export interface ModelMetrics {
  model_name: string;
  model_version: string;
  training_date: string;
  dataset_name: string;
  dataset_size: number;
  feature_count: number;
  target_column: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  career_classes: string[];
  all_model_evaluations: Record<string, {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
  }>;
  feature_importances: Record<string, number>;
}

export interface CandidateInsight {
  type: string;
  title: string;
  description: string;
  impact: string;
  action: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'admin';
}

export interface OnlineTestQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: string;
  topic: string;
}

export interface OnlineTestResult {
  testId: string;
  career: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  topicWisePerformance: Record<string, { correct: number; total: number; percentage: number }>;
  weakAreas: string[];
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  questions: OnlineTestQuestion[];
}

export interface InterviewSimulationTurn {
  id: string;
  question: string;
  category: string;
  userAnswer: string;
  evaluated: boolean;
  scores?: {
    technical: number;
    relevance: number;
    communication: number;
    structure: number;
    overall: number;
  };
  feedback?: {
    what_you_did_well: string[];
    what_was_missing: string[];
    what_to_improve: string[];
    suggested_better_approach: string;
  };
}

export interface FinalInterviewReport {
  sessionId: string;
  career: string;
  interviewType: string;
  difficulty: string;
  totalQuestions: number;
  averageScores: {
    technical: number;
    relevance: number;
    communication: number;
    structure: number;
    overall: number;
  };
  verdict: string;
  readinessContribution: number;
  keyStrengths: string[];
  priorityImprovements: string[];
  turns: InterviewSimulationTurn[];
}

export interface LLMStatus {
  available: boolean;
  model: string;
  provider: string;
  fallback_active: boolean;
}

export interface DashboardSummary {
  career: {
    target: string;
    topMatch: string;
    matchScore: number;
    confidenceTier: string;
    recommendationsCount: number;
  };
  skills: {
    totalEvaluated: number;
    topSkills: Array<{ name: string; level: number }>;
    criticalGaps: Array<{ name: string; targetLevel: number }>;
    developingCount: number;
    masteredCount: number;
  };
  roadmap: {
    totalMilestones: number;
    completedMilestones: number;
    completionPercentage: number;
    currentPhase: string;
    nextMilestone: {
      id: string;
      title: string;
      objective: string;
      skills: string[];
      status: string;
    } | null;
  };
  tests: {
    totalTaken: number;
    latestScore: number | null;
    latestTopic: string | null;
    averageScore: number;
    weakAreas: string[];
  };
  interview: {
    totalSessions: number;
    latestVerdict: string | null;
    averageScore: number;
    readinessContribution: number;
  };
  resume: {
    uploaded: boolean;
    filename: string | null;
    atsScore: number | null;
    detectedSkillsCount: number;
    missingSkillsCount: number;
  };
  proofs: {
    verifiedCount: number;
  };
  employability: EmployabilityIndexData;
  nextAction: {
    title: string;
    description: string;
    actionTab: any;
    buttonText: string;
    badge: string;
  };
}


