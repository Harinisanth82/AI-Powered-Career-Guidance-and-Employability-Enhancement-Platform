import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSession extends Document {
  userId: string;
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
  turns: Array<any>;
  createdAt: Date;
}

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    career: { type: String, required: true },
    interviewType: { type: String, required: true },
    difficulty: { type: String, default: 'Intermediate' },
    totalQuestions: { type: Number, default: 1 },
    averageScores: {
      technical: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      structure: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    verdict: { type: String, default: 'Competent' },
    readinessContribution: { type: Number, default: 10 },
    keyStrengths: { type: [String], default: [] },
    priorityImprovements: { type: [String], default: [] },
    turns: { type: [Schema.Types.Mixed] as any, default: [] },
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.models.InterviewSession || mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
