import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  userId: string;
  career: string;
  score: number;
  confidenceTier: string;
  track: string;
  description: string;
  keyReasons: string[];
  areasToImprove: string[];
  influentialFeatures: Array<any>;
  modelUsed: string;
  modelAccuracy: number;
  createdAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: String, required: true, index: true },
    career: { type: String, required: true },
    score: { type: Number, required: true },
    confidenceTier: { type: String, default: 'High Match' },
    track: { type: String, default: 'Engineering' },
    description: { type: String, default: '' },
    keyReasons: { type: [String], default: [] },
    areasToImprove: { type: [String], default: [] },
    influentialFeatures: { type: [Schema.Types.Mixed] as any, default: [] },
    modelUsed: { type: String, default: 'Logistic Regression' },
    modelAccuracy: { type: Number, default: 98 },
  },
  { timestamps: true }
);

export const Recommendation = mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
