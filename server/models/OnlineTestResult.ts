import mongoose, { Schema, Document } from 'mongoose';

export interface IOnlineTestResult extends Document {
  userId: string;
  testId: string;
  career: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  topicWisePerformance: Record<string, any>;
  weakAreas: string[];
  userAnswers: Record<string, string>;
  questions: Array<any>;
  createdAt: Date;
}

const OnlineTestResultSchema = new Schema<IOnlineTestResult>(
  {
    userId: { type: String, required: true, index: true },
    testId: { type: String, required: true },
    career: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    topicWisePerformance: { type: Schema.Types.Mixed as any, default: {} },
    weakAreas: { type: [String], default: [] },
    userAnswers: { type: Schema.Types.Mixed as any, default: {} },
    questions: { type: [Schema.Types.Mixed] as any, default: [] },
  },
  { timestamps: true }
);

export const OnlineTestResult = mongoose.models.OnlineTestResult || mongoose.model<IOnlineTestResult>('OnlineTestResult', OnlineTestResultSchema);
